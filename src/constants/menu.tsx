import { LayoutDashboard, MessagesSquare, Settings, Users } from "lucide-react";
import type React from "react";

export type SIDE_BAR_MENU_PROPS = {
  label: string;
  icon: React.JSX.Element;
  path: string;
};

// Only what exists in the beta (spec 008).
export const SIDE_BAR_MENU: SIDE_BAR_MENU_PROPS[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "dashboard" },
  { label: "Conversaciones", icon: <MessagesSquare size={20} />, path: "conversations" },
  { label: "Leads", icon: <Users size={20} />, path: "leads" },
  { label: "Cuenta", icon: <Settings size={20} />, path: "settings" },
];
