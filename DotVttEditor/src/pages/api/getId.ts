import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const GET: APIRoute = async () => {
  const accountId = String(env.ACCOUNT_ID);
  const playerId = String(env.PLAYER_ID);

  if (!accountId || !playerId) {
    return new Response(null, {
      status: 400,
      statusText: "Missing vars",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const data = JSON.stringify({ accountId, playerId });
    return new Response(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(null, {
      status: 404,
    });
  }
};
