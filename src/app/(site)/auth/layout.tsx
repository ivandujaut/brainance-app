import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type React from "react";
import { Wordmark } from "@/components/brand/wordmark";

type Props = {
  children: React.ReactNode;
};

const shot = { width: 2400, height: 1500, sizes: "1100px" };
const alt = "La bandeja de conversaciones de BrAInance";

const Layout = async ({ children }: Props) => {
  const { userId } = await auth();

  if (userId) redirect("/dashboard");
  return (
    <div className="h-screen flex w-full justify-center">
      <div className="w-[600px] flex flex-col items-start p-6">
        <Link href="/" aria-label="BrAInance, inicio">
          <Wordmark className="text-2xl" />
        </Link>
        {children}
      </div>
      <div className="hidden lg:flex flex-1 w-full max-h-full overflow-hidden relative bg-muted flex-col pt-10 pl-24 gap-3 border-l">
        <h2 className="text-4xl font-bold leading-tight tracking-tight">
          Tu negocio responde a las 3 de la mañana. <span className="text-muted-foreground">Vos dormís.</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-10 max-w-md">
          BrAInance responde las consultas de tus visitantes con la información de tu negocio y te deja sus datos de
          contacto, sin formularios.
        </p>
        <div className="absolute top-60 left-24 w-[1100px] overflow-hidden rounded-tl-xl border-l border-t shadow-2xl">
          <Image src="/landing/inbox-light.webp" alt={alt} {...shot} className="h-auto w-full" />
        </div>
      </div>
    </div>
  );
};

export default Layout;
