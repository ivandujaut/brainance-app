import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false },
};

/** Minimal root layout for the chat iframe: no Clerk, no dashboard providers. */
export default function WidgetLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${jakarta.className} bg-transparent`}>{children}</body>
    </html>
  );
}
