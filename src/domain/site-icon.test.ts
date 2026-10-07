import { describe, expect, it } from "vitest";
import { siteIcon } from "./site-icon";

// The bot icon from "Apariencia" lives on ChatBot; Domain.icon is the one uploaded when adding the
// site (usually empty). The side menu showed only the latter (QA on the preview, 2026-10-06).
describe("siteIcon", () => {
  it("uses the bot icon", () => {
    expect(siteIcon({ icon: "", chatBot: { icon: "bot-uuid" } })).toBe("bot-uuid");
    expect(siteIcon({ icon: "site-uuid", chatBot: { icon: "bot-uuid" } })).toBe("bot-uuid");
  });

  it("falls back to the icon uploaded with the site", () => {
    expect(siteIcon({ icon: "site-uuid", chatBot: { icon: null } })).toBe("site-uuid");
    expect(siteIcon({ icon: "site-uuid", chatBot: null })).toBe("site-uuid");
  });

  it("is null without any icon, so the menu shows the initial", () => {
    expect(siteIcon({ icon: "", chatBot: { icon: "" } })).toBeNull();
    expect(siteIcon({ icon: "", chatBot: null })).toBeNull();
  });
});
