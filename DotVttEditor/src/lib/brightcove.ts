import { BrightcoveClient } from "@dottools/shared";

interface BrightcoveEnv {
  ACCOUNT_ID?: string;
  POLICY_KEY?: string;
  BC_CLIENT_ID?: string;
  BC_CLIENT_SECRET?: string;
}

/**
 * Build a BrightcoveClient from the request's runtime env. Server-side only —
 * never call this from a SolidJS island; the secrets must never reach the
 * browser bundle.
 */
export function brightcoveFromEnv(env: BrightcoveEnv): BrightcoveClient {
  const accountId = env.ACCOUNT_ID;
  const clientId = env.BC_CLIENT_ID;
  const clientSecret = env.BC_CLIENT_SECRET;
  if (!accountId || !clientId || !clientSecret) {
    throw new Error(
      "Brightcove credentials missing — set ACCOUNT_ID, BC_CLIENT_ID, BC_CLIENT_SECRET in env",
    );
  }
  return new BrightcoveClient({
    accountId,
    clientId,
    clientSecret,
    policyKey: env.POLICY_KEY,
  });
}
