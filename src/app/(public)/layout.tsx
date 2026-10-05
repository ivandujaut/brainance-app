import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/context/theme-provider";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BrAInance",
  description: "Chatbots con IA que atienden y captan clientes en tu sitio web",
};

/** Root layout for public pages (landing and legal, spec 008): static, no Clerk, readable without an account. */
export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={jakarta.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
