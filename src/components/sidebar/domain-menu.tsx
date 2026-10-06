import { useDomain } from "@/hooks/sidebar/use-domain";
import { cn } from "@/lib/utils";
import React from "react";
import AppDrawer from "../drawer";
import { AddDomainForm } from "../add-domain-form";
import { Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { siteSettingsPath } from "@/lib/routes";

type Props = {
  min?: boolean;
  domains:
    | {
        id: string;
        name: string;
        icon: string | null;
      }[]
    | null
    | undefined;
};

const DomainMenu = ({ domains, min }: Props) => {
  const { isDomain } = useDomain();

  return (
    <div className={cn("flex flex-col gap-3", min ? "mt-6" : "mt-3")}>
      <div className="flex justify-between w-full items-center">
        {!min && <p className="text-xs text-muted-foreground">SITIOS</p>}
        <AppDrawer
          description="Ingresá el dominio de tu sitio para conectar el chatbot"
          title="Agregá tu sitio"
          onOpen={
            <div className="cursor-pointer text-muted-foreground rounded-full border-2 hover:text-foreground">
              <Plus />
            </div>
          }
        >
          <AddDomainForm />
        </AppDrawer>
      </div>
      <div className="flex flex-col gap-1 text-muted-foreground font-medium">
        {domains &&
          domains.map((domain) => (
            <Link
              href={siteSettingsPath(domain.id)}
              key={domain.id}
              // Minimized, only the initial or the icon shows: the domain names the link.
              aria-label={min ? domain.name : undefined}
              title={min ? domain.name : undefined}
              className={cn(
                "flex gap-3 items-center justify-center hover:bg-background hover:text-foreground rounded-full transition duration-100 ease-in-out cursor-pointer ",
                !min ? "p-2" : "py-2",
                domain.id === isDomain && "bg-background text-foreground"
              )}
            >
              {domain.icon ? (
                <Image src={`https://ucarecdn.com/${domain.icon}/`} alt="logo" width={20} height={20} />
              ) : (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center uppercase">
                  {domain.name[0]}
                </span>
              )}
              {!min && <p className="text-sm">{domain.name}</p>}
            </Link>
          ))}
      </div>
    </div>
  );
};

export default DomainMenu;
