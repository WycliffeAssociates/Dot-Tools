export class BrightcoveApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: string;
  readonly url: string;

  constructor(opts: {
    url: string;
    status: number;
    statusText: string;
    body: string;
    method: string;
  }) {
    const snippet = opts.body.length > 500 ? `${opts.body.slice(0, 500)}…` : opts.body;
    super(`Brightcove ${opts.method} ${opts.url} → ${opts.status} ${opts.statusText}: ${snippet}`);
    this.name = "BrightcoveApiError";
    this.url = opts.url;
    this.status = opts.status;
    this.statusText = opts.statusText;
    this.body = opts.body;
  }
}
