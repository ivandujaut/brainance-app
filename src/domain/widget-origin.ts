type OriginOptions = { allowHttp?: boolean };

/**
 * CSP directive for the widget page: only the site and its subdomains may embed it.
 * Plain HTTP (and localhost) is only allowed in development and E2E runs.
 */
export const frameAncestors = (domain: string | null, { allowHttp = false }: OriginOptions = {}): string => {
  if (!domain) return "frame-ancestors 'none'";
  const sources = [`https://${domain}`, `https://*.${domain}`];
  if (allowHttp) sources.push(`http://${domain}`, `http://*.${domain}`, "http://localhost:*");
  return `frame-ancestors ${sources.join(" ")}`;
};

/** Whether a browser-sent Origin/Referer belongs to the site or one of its subdomains. */
export const originMatchesDomain = (
  origin: string | null,
  domain: string,
  { allowHttp = false }: OriginOptions = {},
): boolean => {
  if (!origin) return false;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && !(allowHttp && url.protocol === "http:")) return false;
  const host = url.hostname.toLowerCase();
  const site = domain.toLowerCase();
  return host === site || host.endsWith(`.${site}`);
};
