import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esUY } from "@clerk/localizations";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/theme-provider";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BrAInance",
  description: "Chatbots con IA que atienden y captan clientes en tu sitio web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esUY} appearance={{ variables: { colorPrimary: "#FFA947" } }}>
      <html lang="es">
        <body className={jakarta.className}>
          {/* Light theme only for now: the dark tokens stay in globals.css to turn it back on later. */}
          <ThemeProvider attribute="class" forcedTheme="light" disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
