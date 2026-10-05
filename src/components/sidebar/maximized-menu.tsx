import { SIDE_BAR_MENU } from "@/constants/menu";
import { ChevronLeftCircle, LogOut } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import React from "react";
import MenuItem from "./menu-item";
import DomainMenu from "./domain-menu";

type Props = {
  onExpand(): void;
  current: string;
  onSignOut(): void;
  domains:
    | {
        id: string;
        name: string;
        icon: string | null;
      }[]
    | null
    | undefined;
};

const MaxMenu = ({ current, domains, onExpand, onSignOut }: Props) => {
  return (
    <div className="py-3 px-4 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <Wordmark className="text-2xl" />
        <ChevronLeftCircle
          className="cursor-pointer animate-fade-in opacity-0 delay-300 fill-mode-forwards text-muted-foreground hover:text-foreground"
          onClick={onExpand}
        />
      </div>
      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between h-full pt-10">
        <div className="flex flex-col">
          <p className="text-xs text-muted-foreground mb-3">MENÚ</p>
          {SIDE_BAR_MENU.map((menu, key) => (
            <MenuItem size="max" {...menu} key={key} current={current} />
          ))}
          <DomainMenu domains={domains} />
        </div>
        <div className="flex flex-col">
          <p className="text-xs text-muted-foreground mb-3">OPCIONES</p>
          <MenuItem size="max" label="Cerrar sesión" icon={<LogOut />} onSignOut={onSignOut} />
        </div>
      </div>
    </div>
  );
};

export default MaxMenu;
