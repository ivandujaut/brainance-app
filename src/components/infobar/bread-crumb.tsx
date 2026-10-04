"use client";
import useSideBar from "@/context/use-sidebar";

const PAGES: Record<string, { title: string; description: string }> = {
  dashboard: { title: "Dashboard", description: "Lo que trajo tu bot: conversaciones, leads y lo que necesitó tu atención." },
  settings: { title: "Cuenta", description: "Tu contraseña y el tema de la interfaz." },
};

const BreadCrumb = () => {
  const { page } = useSideBar();
  const current = PAGES[page ?? ""];
  if (!current) return null;
  return (
    <div className="flex flex-col">
      <h2 className="text-3xl font-bold">{current.title}</h2>
      <p className="text-muted-foreground text-sm">{current.description}</p>
    </div>
  );
};

export default BreadCrumb;
