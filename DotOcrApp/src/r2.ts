import { AwsClient } from "aws4fetch";
import { VTT_CONTENT_TYPE } from "@dottools/shared";
import type { Config } from "./config.ts";

/**
 * Minimal R2 client over the S3-compatible endpoint using aws4fetch (SigV4).
 * We deliberately avoid @aws-sdk/client-s3 — it's a 100+ package tree and
 * overkill for put/get/head against R2.
 */
export class R2 {
  private readonly aws: AwsClient;
  private readonly endpoint: string;
  private readonly bucketAssets: string;
  private readonly bucketTmp: string;
  private readonly publicAssetsUrl: string | undefined;

  constructor(cfg: Config["r2"]) {
    this.aws = new AwsClient({
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
      service: "s3",
      region: "auto",
    });
    this.endpoint = `https://${cfg.accountId}.r2.cloudflarestorage.com`;
    this.bucketAssets = cfg.bucketAssets;
    this.bucketTmp = cfg.bucketTmp;
    this.publicAssetsUrl = cfg.publicAssetsUrl;
  }

  private url(bucket: string, key: string): string {
    return `${this.endpoint}/${bucket}/${encodeURI(key)}`;
  }

  private async put(
    bucket: string,
    key: string,
    body: BodyInit,
    contentType: string,
  ): Promise<void> {
    const resp = await this.aws.fetch(this.url(bucket, key), {
      method: "PUT",
      body,
      headers: { "Content-Type": contentType },
    });
    if (!resp.ok) {
      throw new Error(`R2 PUT ${bucket}/${key} → ${resp.status} ${await safeText(resp)}`);
    }
  }

  async exists(bucket: "assets" | "tmp", key: string): Promise<boolean> {
    const b = bucket === "assets" ? this.bucketAssets : this.bucketTmp;
    const resp = await this.aws.fetch(this.url(b, key), { method: "HEAD" });
    return resp.ok;
  }

  async getText(bucket: "assets" | "tmp", key: string): Promise<string | null> {
    const b = bucket === "assets" ? this.bucketAssets : this.bucketTmp;
    const resp = await this.aws.fetch(this.url(b, key), { method: "GET" });
    if (resp.status === 404) return null;
    if (!resp.ok) {
      throw new Error(`R2 GET ${b}/${key} → ${resp.status} ${await safeText(resp)}`);
    }
    return resp.text();
  }

  putVtt(key: string, vtt: string): Promise<void> {
    return this.put(this.bucketAssets, key, vtt, VTT_CONTENT_TYPE);
  }

  putThumb(key: string, jpeg: Uint8Array): Promise<void> {
    // Copy into a fresh ArrayBuffer-backed view so the Blob part type is
    // unambiguous (sidesteps TS's Uint8Array<ArrayBufferLike> variance), then
    // wrap in a Blob — unambiguously a BodyInit.
    const body = new Blob([new Uint8Array(jpeg)], { type: "image/jpeg" });
    return this.put(this.bucketTmp, key, body, "image/jpeg");
  }

  putJson(bucket: "assets" | "tmp", key: string, value: unknown): Promise<void> {
    const b = bucket === "assets" ? this.bucketAssets : this.bucketTmp;
    return this.put(b, key, JSON.stringify(value, null, 2), "application/json");
  }

  /** Public URL of an assets-bucket key, if a public base is configured. */
  publicAssetUrl(key: string): string | undefined {
    if (!this.publicAssetsUrl) return undefined;
    return `${this.publicAssetsUrl.replace(/\/+$/, "")}/${key}`;
  }
}

async function safeText(resp: Response): Promise<string> {
  try {
    return (await resp.text()).slice(0, 300);
  } catch {
    return "";
  }
}
