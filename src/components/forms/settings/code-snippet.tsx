"use client";
import Section from "@/components/section-label";
import { InstallSnippet } from "@/components/onboarding/install-snippet";

type Props = {
  id: string;
};

const CodeSnippet = ({ id }: Props) => (
  <div className="mt-10 flex flex-col gap-5 items-start">
    <Section label="Código de instalación" message="Copiá este código en tu sitio para mostrar el chat" />
    <InstallSnippet domainId={id} />
  </div>
);

export default CodeSnippet;
