// Minimal markdown for the legal pages (spec 008): headings, paragraphs, lists, bold and links.
// Kept tiny on purpose: the texts are ours and reviewed, and no HTML is ever rendered from them.

export type Inline =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "link"; value: string; href: string };

export type Block =
  | { type: "h1" | "h2" | "h3" | "p"; text: Inline[] }
  | { type: "ul"; items: Inline[][] };

const SAFE_HREF = /^(\/|https:\/\/|mailto:)/;

const parseInline = (source: string): Inline[] => {
  const out: Inline[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+(?:\([^)]*\))?)\)/g;
  let last = 0;
  for (const match of source.matchAll(pattern)) {
    if (match.index > last) out.push({ type: "text", value: source.slice(last, match.index) });
    if (match[1] !== undefined) out.push({ type: "strong", value: match[1] });
    else if (SAFE_HREF.test(match[3])) out.push({ type: "link", value: match[2], href: match[3] });
    else out.push({ type: "text", value: match[2] });
    last = match.index + match[0].length;
  }
  if (last < source.length) out.push({ type: "text", value: source.slice(last) });
  return out.filter((part) => part.type !== "text" || part.value.trim() !== "");
};

export const parseMarkdown = (source: string): Block[] => {
  const blocks: Block[] = [];
  for (const chunk of source.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").filter((l) => l.trim());
    if (!lines.length) continue;
    const heading = /^(#{1,3})\s+(.*)$/.exec(lines[0]);
    if (heading && lines.length === 1) {
      blocks.push({ type: (["h1", "h2", "h3"] as const)[heading[1].length - 1], text: parseInline(heading[2]) });
    } else if (lines.every((l) => /^-\s+/.test(l))) {
      blocks.push({ type: "ul", items: lines.map((l) => parseInline(l.replace(/^-\s+/, ""))) });
    } else {
      blocks.push({ type: "p", text: parseInline(lines.map((l) => l.trim()).join(" ")) });
    }
  }
  return blocks;
};
