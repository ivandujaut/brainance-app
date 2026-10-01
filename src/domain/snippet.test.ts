import { describe, expect, it } from "vitest";
import { buildInstallSnippet } from "./snippet";

const domainId = "6f1c2a4e-9b7d-4c3e-8f21-0a5b6c7d8e9f";

describe("buildInstallSnippet", () => {
  it("loads the widget from the app URL of the current environment", () => {
    const snippet = buildInstallSnippet({ appUrl: "https://app.brainance.example", domainId });
    expect(snippet).toContain('src="https://app.brainance.example/widget.js"');
    expect(snippet).not.toContain("localhost");
  });

  it("identifies the site by its id", () => {
    expect(buildInstallSnippet({ appUrl: "https://app.brainance.example", domainId })).toContain(
      `data-domain-id="${domainId}"`,
    );
  });

  it("ignores a trailing slash in the app URL", () => {
    expect(buildInstallSnippet({ appUrl: "https://app.brainance.example/", domainId })).toContain(
      'src="https://app.brainance.example/widget.js"',
    );
  });

  it("rejects values that could break out of the HTML attribute", () => {
    expect(() => buildInstallSnippet({ appUrl: "https://app.example", domainId: '"><script>' })).toThrow();
    expect(() => buildInstallSnippet({ appUrl: "javascript:alert(1)", domainId })).toThrow();
  });
});
