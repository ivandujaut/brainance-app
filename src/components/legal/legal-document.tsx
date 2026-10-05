import { readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { SiteFooter } from "@/components/site/footer";
import { fillLegalText } from "@/domain/legal";
import { parseMarkdown, type Inline } from "@/lib/simple-markdown";

const renderInline = (parts: Inline[]) =>
  parts.map((part, i) => {
    if (part.type === "strong") return <strong key={i}>{part.value}</strong>;
    if (part.type === "link")
      return part.href.startsWith("/") ? (
        <Link key={i} href={part.href} className="underline underline-offset-2">
          {part.value}
        </Link>
      ) : (
        <a key={i} href={part.href} className="underline underline-offset-2">
          {part.value}
        </a>
      );
    return <span key={i}>{part.value}</span>;
  });

/** A legal text from src/content/legal, rendered at build time (spec 008). */
export const LegalDocument = ({ file }: { file: "terminos" | "privacidad" }) => {
  const source = readFileSync(path.join(process.cwd(), "src/content/legal", `${file}.md`), "utf8");
  const blocks = parseMarkdown(
    fillLegalText(source, { contact: process.env.LEGAL_CONTACT_EMAIL, entity: process.env.LEGAL_ENTITY }),
  );
  const reviewed = process.env.LEGAL_REVIEWED === "true";

  return (
    <div className="theme-paper min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 px-4 py-10">
        <article className="mx-auto max-w-3xl flex flex-col gap-4 leading-relaxed" data-testid={`legal-${file}`}>
          {!reviewed && (
            <p role="note" className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
              Borrador sujeto a revisión legal. No es la versión definitiva.
            </p>
          )}
          {blocks.map((block, i) => {
            if (block.type === "h1") return <h1 key={i} className="text-4xl font-bold tracking-tight">{renderInline(block.text)}</h1>;
            if (block.type === "h2") return <h2 key={i} className="text-2xl font-bold mt-6">{renderInline(block.text)}</h2>;
            if (block.type === "h3") return <h3 key={i} className="font-semibold mt-2">{renderInline(block.text)}</h3>;
            if (block.type === "ul")
              return (
                <ul key={i} className="list-disc pl-6 flex flex-col gap-1">
                  {block.items.map((item, j) => (
                    <li key={j}>{renderInline(item)}</li>
                  ))}
                </ul>
              );
            return <p key={i} className="text-foreground/90">{renderInline(block.text)}</p>;
          })}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
};
