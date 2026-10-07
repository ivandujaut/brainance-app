/** The icon that represents a site: the bot's (set in "Apariencia"), else the one uploaded with the site. */
export const siteIcon = (site: { icon: string | null; chatBot: { icon: string | null } | null }) =>
  site.chatBot?.icon || site.icon || null;
