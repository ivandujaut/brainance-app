import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
  const user = await currentUser();

  if (user) redirect("/");
  return (
    <div className="h-screen flex w-full justify-center">
      <div className="w-[600px] ld:w-full flex flex-col items-start p-6">
        <Link href="/">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange to-grandis">
            BrAInance
          </h1>
        </Link>
        {children}
      </div>
      <div className="hidden lg:flex flex-1 w-full max-h-full max-w-4000px overflow-hidden relative bg-cream  flex-col pt-10 pl-24 gap-3">
        <h2 className="text-gravel md:text-4xl font-bold">Hi, I’m your AI powered taxes assistant, BrAInance!</h2>
        <p className="text-iridium md:text-sm mb-10">
          BrAInance is capable of capturing lead information without a form... <br />
          something never done before 😉
        </p>
        <Image
          src="/images/app-ui.png"
          alt="app image"
          loading="lazy"
          sizes="30"
          className="absolute shrink-0 !w-[1600px] top-60"
          width={0}
          height={0}
        />
      </div>
    </div>
  );
};

export default Layout;
