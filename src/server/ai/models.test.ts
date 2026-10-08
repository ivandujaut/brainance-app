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

  // Spec 014: E2E runs need a model that fails on demand.
  describe("failure markers", () => {
    const answer = async (prompt: string) => {
      vi.stubEnv("AI_ANSWER_MODEL", "mock/echo");
      vi.stubEnv("AI_ALLOW_MOCK_MODEL", "true");
      let error: unknown = null;
      const result = streamText({ model: resolveAnswerModel(), prompt, onError: (e) => void (error = e.error) });
      let text = "";
      for await (const piece of result.textStream) text += piece;
      return { text, error };
    };

    it("fails before any text with [falla]", async () => {
      const { text, error } = await answer("¿Abren hoy? [falla]");
      expect(text).toBe("");
      expect(String(error)).toContain("Mock model failure");
    });

    it("answers nothing with [vacio]", async () => {
      expect(await answer("¿Abren hoy? [vacio]")).toEqual({ text: "", error: null });
    });

    it("fails after part of the answer with [corte]", async () => {
      const { text, error } = await answer("¿Abren hoy? [corte]");
      expect(text).toBe("Respuesta de ");
      expect(String(error)).toContain("Mock model failure");
    });
  });
});
