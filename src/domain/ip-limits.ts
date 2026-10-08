// Limits per IP and site for the public widget endpoints (spec 015, ADR 0009). Generous on purpose:
// mobile carriers put many real visitors behind one IP (CGNAT).

const MINUTE_MS = 60_000;

export const IP_LIMITS = {
  /** Messages per IP and site in a short window (criterion 1). */
  burst: { messages: 40, windowMs: 10 * MINUTE_MS },
  /** Messages per IP and site in a day: one IP never exhausts the site's daily cap (criterion 2). */
  daily: { messages: 100, windowMs: 24 * 60 * MINUTE_MS },
  /** New visitors (visitorId never seen on the site) per IP and site (criterion 3). */
  newVisitors: { visitors: 10, windowMs: 60 * MINUTE_MS },
  /** Contact forms per IP and site (criterion 6). */
  leads: { submissions: 10, windowMs: 60 * MINUTE_MS },
} as const;

export type IpLimitReason = "ip_burst" | "ip_daily" | "ip_new_visitors" | "ip_leads";

export type IpCheck = { ok: true } | { ok: false; reason: IpLimitReason };

/** Whether a visitor message from this IP may go on, given the IP's recent counts on the site. */
export const checkMessageIpLimits = ({
  burst,
  daily,
  newVisitors,
  isNewVisitor,
}: {
  burst: number;
  daily: number;
  newVisitors: number;
  isNewVisitor: boolean;
}): IpCheck => {
  // The daily limit first: its reply gives the visitor the business's contact.
  if (daily >= IP_LIMITS.daily.messages) return { ok: false, reason: "ip_daily" };
  if (burst >= IP_LIMITS.burst.messages) return { ok: false, reason: "ip_burst" };
  if (isNewVisitor && newVisitors >= IP_LIMITS.newVisitors.visitors) return { ok: false, reason: "ip_new_visitors" };
  return { ok: true };
};

/** Whether a contact form from this IP may go on. */
export const checkLeadIpLimits = ({ leads }: { leads: number }): IpCheck =>
  leads >= IP_LIMITS.leads.submissions ? { ok: false, reason: "ip_leads" } : { ok: true };

const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
const HEXTET = /^[0-9a-f]{1,4}$/;

/** The eight groups of an IPv6 address, or null if it is not one. */
const ipv6Groups = (value: string): string[] | null => {
  const halves = value.split("::");
  if (halves.length > 2) return null;
  const parse = (part: string) => (part ? part.split(":") : []);
  const head = parse(halves[0]);
  const tail = halves.length === 2 ? parse(halves[1]) : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill("0"), ...tail];
  if (!groups.every((g) => HEXTET.test(g))) return null;
  return groups.map((g) => g.replace(/^0+(?=.)/, ""));
};

/**
 * What identifies a connection: the IPv4 address, or the /64 prefix of an IPv6 one (one attacker
 * gets many addresses inside a /64). Null when the value is not an IP.
 */
export const ipKey = (raw: string): string | null => {
  const value = raw.trim().toLowerCase();
  const mapped = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return IPV4.test(mapped[1]) ? mapped[1] : null;
  if (IPV4.test(value)) return value;
  if (!value.includes(":")) return null;
  const groups = ipv6Groups(value);
  return groups ? `${groups.slice(0, 4).join(":")}::/64` : null;
};
