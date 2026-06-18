function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export interface Config {
  brightcove: {
    accountId: string;
    clientId: string;
    clientSecret: string;
    policyKey: string | undefined;
  };
  r2: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketAssets: string;
    bucketTmp: string;
    /** Public base URL for the assets bucket (so the editor/Brightcove can read seeds). */
    publicAssetsUrl: string | undefined;
  };
  ocr: {
    /** Fallback language when neither custom_fields nor playlistLangs specify one. */
    defaultLang: string;
    /** How many videos to OCR in parallel. */
    concurrency: number;
    /** ONNX Runtime execution-provider preference, first available wins. */
    executionProviders: string[];
  };
  port: number;
}

let cached: Config | null = null;

export function loadConfig(): Config {
  if (cached) return cached;
  cached = {
    brightcove: {
      accountId: required("BRIGHTCOVE_ACCOUNT_ID"),
      clientId: required("BRIGHTCOVE_CLIENT_ID"),
      clientSecret: required("BRIGHTCOVE_CLIENT_SECRET"),
      policyKey: process.env.BRIGHTCOVE_POLICY_KEY,
    },
    r2: {
      accountId: required("R2_ACCOUNT_ID"),
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
      bucketAssets: optional("R2_BUCKET_ASSETS", "dot-assets"),
      bucketTmp: optional("R2_BUCKET_TMP", "dot-tmp"),
      publicAssetsUrl: process.env.R2_PUBLIC_ASSETS_URL,
    },
    ocr: {
      defaultLang: optional("OCR_DEFAULT_LANG", "en"),
      concurrency: Number.parseInt(optional("OCR_CONCURRENCY", "1"), 10),
      // CUDA on an NVIDIA Linux box, CoreML (Metal) on M1, CPU everywhere else.
      // First provider available at session-init wins.
      executionProviders: optional("OCR_EXECUTION_PROVIDERS", "cuda,coreml,cpu")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    },
    port: Number.parseInt(optional("PORT", "8000"), 10),
  };
  return cached;
}
