import Image from "next/image";

// Hero product shot (spec 009): the real dashboard and inbox, rendered from the app's own components
// (`npm run landing:screens`), laid out as two tilted planes. The light
// screens are used in both themes: on the dark page they are what catches the eye.

const shot = { width: 2400, height: 1500, sizes: "(min-width: 1280px) 1000px, 80vw" };
const alt =
  "La bandeja de BrAInance: la lista de conversaciones de una panadería y, abierta, una charla donde el bot respondió y después la dueña tomó el control.";

const plane =
  "absolute overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_50px_100px_-30px_rgb(0_0_0/0.45)]";

// Each plane carries the whole tilt, pivoting on the stage's center (600×360), instead of sharing
// a preserve-3d context: browsers then still apply the mask below, which they skip over 3D layers.
const tilt = ({ left, top, width, depth }: { left: number; top: number; width: number; depth: number }) => ({
  left,
  top,
  width,
  transformOrigin: `${600 - left}px ${360 - top}px`,
  transform: `perspective(2400px) rotateX(34deg) rotateY(6deg) rotateZ(-18deg) translateZ(${depth}px)`,
});

// A soft diagonal highlight, as if light fell on the screens from the top left.
const Sheen = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgb(255_255_255/0.5)_0%,transparent_35%,transparent_60%,rgb(0_0_0/0.12)_100%)]"
  />
);

// The edges dissolve into the page: an ellipse around the planes, intersected with fades at the top and bottom.
const fade = {
  maskImage:
    "linear-gradient(to bottom, transparent, black 18%, black 70%, transparent), radial-gradient(ellipse 55% 80% at 50% 55%, black 40%, transparent 85%)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
};

export const ProductShot = () => (
  <div
    className="relative h-[300px] overflow-hidden sm:h-[460px] lg:h-[620px]"
    style={fade}
    data-testid="product-shot"
  >
    {/* A fixed-size stage, scaled down on small screens, so the tilt looks the same everywhere. */}
    <div className="absolute left-1/2 top-0 h-[720px] w-[1200px] origin-top -translate-x-1/2 scale-[0.42] sm:scale-[0.66] lg:scale-[0.86] xl:scale-100">
      <div className="relative h-full w-full animate-hero-rise motion-reduce:animate-none">
        <div className={plane} style={tilt({ left: 420, top: -150, width: 900, depth: -120 })}>
          <Image src="/landing/dashboard-light.webp" alt="" {...shot} className="h-auto w-full" />
          <Sheen />
        </div>
        <div className={plane} style={tilt({ left: -40, top: 150, width: 1000, depth: 0 })}>
          <Image src="/landing/inbox-light.webp" alt={alt} {...shot} priority className="h-auto w-full" />
          <Sheen />
        </div>
      </div>
    </div>
  </div>
);
