import { describe, expect, it } from "vitest";
import { parseMarkdown } from "./simple-markdown";

describe("parseMarkdown", () => {
  it("parses headings, paragraphs and lists", () => {
    expect(parseMarkdown("# Título\n\n## Sección\n\nUn párrafo\nque sigue.\n\n- uno\n- dos")).toEqual([
      { type: "h1", text: [{ type: "text", value: "Título" }] },
      { type: "h2", text: [{ type: "text", value: "Sección" }] },
      { type: "p", text: [{ type: "text", value: "Un párrafo que sigue." }] },
      { type: "ul", items: [[{ type: "text", value: "uno" }], [{ type: "text", value: "dos" }]] },
    ]);
  });

  it("parses bold and links inline", () => {
    expect(parseMarkdown("Leé **esto** y [la política](/privacidad).")).toEqual([
      {
        type: "p",
        text: [
          { type: "text", value: "Leé " },
          { type: "strong", value: "esto" },
          { type: "text", value: " y " },
          { type: "link", value: "la política", href: "/privacidad" },
          { type: "text", value: "." },
        ],
      },
    ]);
  });

  it("only allows relative, https and mailto links", () => {
    const [block] = parseMarkdown("[x](javascript:alert(1)) [y](mailto:a@b.c) [z](https://ok.com)");
    expect(block.type === "p" && block.text.filter((t) => t.type === "link").map((t) => t.type === "link" && t.href)).toEqual([
      "mailto:a@b.c",
      "https://ok.com",
    ]);
  });

  it("parses h3", () => {
    expect(parseMarkdown("### Sub")).toEqual([{ type: "h3", text: [{ type: "text", value: "Sub" }] }]);
  });
});
