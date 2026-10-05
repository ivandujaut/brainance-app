import Image from "next/image";
import type { CSSProperties } from "react";

// Hero product shot (spec 009), after Aceternity's product hero: the real dashboard and inbox
// (`npm run landing:screens`) as two screens at the same isometric-like tilt, the front one shifted
// up and to the right, each fading out toward its right and bottom edges.

const shot = { width: 2400, height: 1500, sizes: "(min-width: 1280px) 1216px, 100vw" };
const alt =
  "La bandeja de BrAInance: la lista de conversaciones de una panadería y, abierta, una charla donde el bot respondió y después la dueña tomó el control.";

// `shift` runs before the tilt, like Tailwind 4's `translate` utilities beside an inline transform.
const screen = ({ fadeFrom, shift = "" }: { fadeFrom: number; shift?: string }): CSSProperties => {
  const mask = `linear-gradient(to right, black ${fadeFrom}%, transparent), linear-gradient(to bottom, black ${fadeFrom}%, transparent)`;
  return {
    transform: `${shift} rotateY(20deg) rotateX(40deg) rotateZ(-20deg)`.trim(),
    maskImage: mask,
    WebkitMaskImage: mask,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
};

const image = "absolute inset-0 h-auto w-full rounded-lg shadow-xl";

export const ProductShot = () => (
  <div
    className="relative min-h-72 w-full overflow-y-clip pt-16 [perspective:1200px] sm:min-h-80 sm:pt-28 md:min-h-[25rem] md:pt-36 lg:min-h-[50rem] lg:pt-52"
    data-testid="product-shot"
  >
    <div className="animate-hero-rise [perspective:4000px] motion-reduce:animate-none">
      <Image src="/landing/dashboard-light.webp" alt="" {...shot} className={image} style={screen({ fadeFrom: 20 })} />
    </div>
    <div className="translate-x-20 -translate-y-10 md:-translate-y-20 lg:-translate-y-40">
      {/* `perspective` reaches direct children only, so it sits on the image's parent. */}
      <div className="animate-hero-rise [animation-delay:150ms] [perspective:4000px] motion-reduce:animate-none">
        <Image
          src="/landing/inbox-light.webp"
          alt={alt}
          {...shot}
          priority
          className={image}
          style={screen({ fadeFrom: 50, shift: "translateX(-2.5rem)" })}
        />
      </div>
    </div>
    {/* The screens run past the section; they fade out across the whole viewport before the next one. */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-1/2 h-1/3 w-screen -translate-x-1/2 bg-gradient-to-b from-transparent to-background"
    />
  </div>
);
