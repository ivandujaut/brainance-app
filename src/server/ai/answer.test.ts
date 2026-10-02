import { MockLanguageModelV4, simulateReadableStream } from "ai/test";
import { describe, expect, it, vi } from "vitest";
import type { BusinessKnowledge } from "@/domain/answer-prompt";
import { answerQuestion, streamAnswer } from "./answer";

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

const streamingModel = (chunks: string[], { fail = false } = {}) =>
  new MockLanguageModelV4({
    provider: "mock",
    modelId: "mock-stream",
    doStream: async () => {
      if (fail) throw new Error("provider down");
      return {
        stream: simulateReadableStream({
          chunks: [
            { type: "text-start" as const, id: "t1" },
            ...chunks.map((delta) => ({ type: "text-delta" as const, id: "t1", delta })),
            { type: "text-end" as const, id: "t1" },
            {
              type: "finish" as const,
              finishReason: { unified: "stop" as const, raw: "stop" },
              usage: {
                inputTokens: { total: 900, noCache: 900, cacheRead: 0, cacheWrite: 0 },
                outputTokens: { total: 8, text: 8, reasoning: 0 },
              },
            },
          ],
        }),
      };
    },
  });

describe("streamAnswer", () => {
  it("streams the answer in pieces and reports the full text when it ends", async () => {
    let finished: { text: string; finishReason: string } | undefined;
    const result = streamAnswer({
      business,
      question: "¿Atienden OSDE?",
      model: streamingModel(["Sí, ", "OSDE 210 ", "en adelante."]),
      onEnd: (end) => {
        finished = end;
      },
    });

    const pieces: string[] = [];
    for await (const piece of result.textStream) pieces.push(piece);

    expect(pieces).toEqual(["Sí, ", "OSDE 210 ", "en adelante."]);
    await result.finished;
    expect(finished).toEqual({ text: "Sí, OSDE 210 en adelante.", finishReason: "stop" });
  });

  it("uses the same system prompt and history order as answerQuestion", async () => {
    const model = streamingModel(["ok"]);
    const result = streamAnswer({
      business,
      question: "¿Y Swiss Medical?",
      history: [
        { role: "user", content: "¿Atienden OSDE?" },
        { role: "assistant", content: "Sí." },
      ],
      model,
    });
    for await (const piece of result.textStream) void piece;
    const prompt = model.doStreamCalls[0].prompt;
    expect(prompt.map((m) => m.role)).toEqual(["system", "user", "assistant", "user"]);
    expect(JSON.stringify(prompt[0].content)).toContain("OSDE 210 en adelante");
  });

  it("does not report an answer when the model fails", async () => {
    const onEnd = vi.fn();
    const result = streamAnswer({ business, question: "hola", model: streamingModel([], { fail: true }), onEnd });
    await expect(async () => {
      for await (const piece of result.textStream) void piece;
      await result.finished;
    }).rejects.toThrow();
    expect(onEnd).not.toHaveBeenCalled();
  });
});
