import { BrightcoveClient } from "@dottools/shared/brightcove";

/** Worker bindings — KV namespace + the `vars`/secrets from wrangler.jsonc + 1Password. */
export interface Env {
  BRIGHTCOVE_PLAYLISTS: KVNamespace;
  /** Non-secret var. */
  BRIGHTCOVE_ACCOUNT_ID: string;
  /** Secrets, pushed from 1Password at deploy. */
  BRIGHTCOVE_POLICY_KEY: string;
  BRIGHTCOVE_CLIENT_ID: string;
  BRIGHTCOVE_CLIENT_SECRET: string;
  /** Self-minted shared secret gating POST /refresh. */
  REFRESH_TOKEN: string;
}

/** Builds the shared Brightcove client from the worker env. */
export function buildClient(env: Env): BrightcoveClient {
  return new BrightcoveClient({
    accountId: env.BRIGHTCOVE_ACCOUNT_ID,
    clientId: env.BRIGHTCOVE_CLIENT_ID,
    clientSecret: env.BRIGHTCOVE_CLIENT_SECRET,
    policyKey: env.BRIGHTCOVE_POLICY_KEY,
  });
}
