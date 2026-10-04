import { Settings, Users } from "lucide-react";
import type React from "react";
import ChatIcon from "../../public/icons/chat-icon";
import DashboardIcon from "../../public/icons/dashboard-icon";

export type SIDE_BAR_MENU_PROPS = {
  label: string;
  icon: React.JSX.Element;
  path: string;
};

// Only what exists in the beta (spec 008).
export const SIDE_BAR_MENU: SIDE_BAR_MENU_PROPS[] = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "dashboard" },
  { label: "Conversaciones", icon: <ChatIcon />, path: "conversations" },
  { label: "Leads", icon: <Users size={20} />, path: "leads" },
  { label: "Cuenta", icon: <Settings size={20} />, path: "settings" },
];
