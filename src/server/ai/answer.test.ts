import { MockLanguageModelV4 } from "ai/test";
import { describe, expect, it } from "vitest";
import type { BusinessKnowledge } from "@/domain/answer-prompt";
import { answerQuestion } from "./answer";

const business: BusinessKnowledge = {
  name: "Sonrisa Plena",
  description: "Clínica odontológica en Córdoba",
  addressing: "usted",
  contact: "el teléfono (0351) 555-0202",
  faqs: [{ question: "¿Atienden OSDE?", answer: "Sí, OSDE 210 en adelante." }],
};

const mockModel = (finish: "stop" | "length" = "stop") =>
  new MockLanguageModelV4({
    provider: "mock",
    modelId: "mock-model",
    doGenerate: async () => ({
      content: [{ type: "text", text: "Sí, atendemos OSDE 210 en adelante." }],
      finishReason: { unified: finish, raw: finish },
      usage: {
        inputTokens: { total: 900, noCache: 100, cacheRead: 800, cacheWrite: 0 },
        outputTokens: { total: 12, text: 12, reasoning: 0 },
      },
      response: { modelId: "mock-model-2026" },
      warnings: [],
    }),
  });

describe("answerQuestion", () => {
  it("returns the model's answer", async () => {
    const result = await answerQuestion({ business, question: "¿Atienden OSDE?", model: mockModel() });
    expect(result.text).toBe("Sí, atendemos OSDE 210 en adelante.");
  });

  it("records the served model, token usage including cache reads, latency and finish reason", async () => {
    const result = await answerQuestion({ business, question: "¿Atienden OSDE?", model: mockModel() });
    expect(result.servedModel).toBe("mock-model-2026");
    expect(result.usage).toEqual({
      inputTokens: 900,
      outputTokens: 12,
      cacheReadTokens: 800,
      cacheWriteTokens: 0,
    });
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.finishReason).toBe("stop");
  });

  it("reports truncated answers", async () => {
    const result = await answerQuestion({ business, question: "¿Atienden OSDE?", model: mockModel("length") });
    expect(result.finishReason).toBe("length");
  });

  it("sends the business knowledge as the system prompt and prior turns before the question", async () => {
    const model = mockModel();
    await answerQuestion({
      business,
      question: "¿Y Swiss Medical?",
      history: [
        { role: "user", content: "¿Atienden OSDE?" },
        { role: "assistant", content: "Sí, OSDE 210 en adelante." },
      ],
      model,
    });
    const prompt = model.doGenerateCalls[0].prompt;
    expect(prompt[0].role).toBe("system");
    expect(JSON.stringify(prompt[0].content)).toContain("OSDE 210 en adelante");
    expect(prompt.map((m) => m.role)).toEqual(["system", "user", "assistant", "user"]);
  });
});
