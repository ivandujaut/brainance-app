import { streamText } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ANSWER_MODEL, resolveAnswerModel } from "./models";

afterEach(() => vi.unstubAllEnvs());

describe("resolveAnswerModel", () => {
  it(`defaults to ${DEFAULT_ANSWER_MODEL}`, () => {
    vi.stubEnv("AI_ANSWER_MODEL", "");
    expect(resolveAnswerModel()).toBe("anthropic/claude-haiku-4.5");
  });

  it("uses AI_ANSWER_MODEL when set", () => {
    vi.stubEnv("AI_ANSWER_MODEL", "openai/gpt-5.6-luna");
    expect(resolveAnswerModel()).toBe("openai/gpt-5.6-luna");
  });

  it("refuses the mock model unless it is explicitly allowed", () => {
    vi.stubEnv("AI_ANSWER_MODEL", "mock/echo");
    vi.stubEnv("AI_ALLOW_MOCK_MODEL", "");
    expect(() => resolveAnswerModel()).toThrow(/mock/);
  });

  it("streams a deterministic echo of the question with the mock model", async () => {
    vi.stubEnv("AI_ANSWER_MODEL", "mock/echo");
    vi.stubEnv("AI_ALLOW_MOCK_MODEL", "true");
    const result = streamText({ model: resolveAnswerModel(), prompt: "¿Hacen envíos?" });
    expect(await result.text).toBe("Respuesta de prueba a: ¿Hacen envíos?");
  });
});
