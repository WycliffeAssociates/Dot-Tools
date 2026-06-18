import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const POST: APIRoute = async (context) => {
  const bucket: R2Bucket = env.DOT_TMP;
  const body = await context.request.blob();
  const prefix = context.url.searchParams?.get("prefix") as string;
  const imgName = context.url.searchParams?.get("name") as string;
  if (!prefix || !imgName) {
    return new Response(null, {
      status: 400,
    });
  }
  const key = `${prefix}/${imgName}`;
  await bucket.put(key, body);
  return new Response(null, {
    status: 200,
  });
};

export const GET: APIRoute = async (context) => {
  const bucket: R2Bucket = env.DOT_TMP;
  const prefix = context.url.searchParams?.get("prefix") as string;
  const imgs = await bucket.list({
    limit: 1000,
    prefix,
  });

  return new Response(JSON.stringify(imgs.objects), {
    status: 200,
  });
};
