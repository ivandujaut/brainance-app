import { describe, expect, it } from "vitest";
import { pollInterval } from "./polling";

describe("pollInterval", () => {
  it("polls every 3 seconds while a person attends the conversation", () => {
    expect(pollInterval({ live: true, visible: true, pushConnected: false })).toBe(3000);
  });

  it("polls every 15 seconds while only the bot answers", () => {
    expect(pollInterval({ live: false, visible: true, pushConnected: false })).toBe(15000);
  });

  it("pauses while the tab is hidden", () => {
    expect(pollInterval({ live: true, visible: false, pushConnected: false })).toBeNull();
  });

  it("only polls as a safety net every 30 seconds when push is connected", () => {
    expect(pollInterval({ live: true, visible: true, pushConnected: true })).toBe(30000);
    expect(pollInterval({ live: false, visible: true, pushConnected: true })).toBe(30000);
  });
});
