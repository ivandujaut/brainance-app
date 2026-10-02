"use client";
import { WidgetChat } from "@/components/widget/chat";
import { WIDGET_DEFAULT_COLOR, WIDGET_DEFAULT_WELCOME } from "@/domain/bot-settings";
import { isHexColor, readableTextColor } from "@/domain/color-contrast";
import type { Look } from "./appearance-form";

type Props = { siteId: string; name: string; look: Look };

/** The real widget, fed with the unsaved appearance. It does not read or create conversations. */
export const Preview = ({ siteId, name, look }: Props) => {
  // While the owner is typing a color, keep showing a valid one.
  const background = isHexColor(look.background) ? look.background.toUpperCase() : WIDGET_DEFAULT_COLOR;
  const config = {
    name,
    welcomeMessage: look.welcomeMessage.trim() || WIDGET_DEFAULT_WELCOME,
    icon: look.icon,
    background,
    textColor: readableTextColor(background),
  };
  return (
    <div className="h-full" data-testid="bot-preview">
      <WidgetChat domainId={siteId} config={config} preview />
    </div>
  );
};
