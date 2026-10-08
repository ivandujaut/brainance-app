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

const streamingModel = (
  chunks: string[],
  { fail = false, failAfterText = false, initialDelayInMs = 0, chunkDelayInMs = 0 } = {},
) =>
  new MockLanguageModelV4({
    provider: "mock",
    modelId: "mock-stream",
    doStream: async () => {
      if (fail) throw new Error("provider down");
      return {
        stream: simulateReadableStream({
          initialDelayInMs,
          chunkDelayInMs,
          chunks: [
            { type: "text-start" as const, id: "t1" },
            ...chunks.map((delta) => ({ type: "text-delta" as const, id: "t1", delta })),
            ...(failAfterText ? [{ type: "error" as const, error: new Error("connection reset") }] : []),
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
    expect(finished).toEqual({ text: "Sí, OSDE 210 en adelante.", finishReason: "stop", fallback: false });
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

  it("reports usage, served model and latency when it ends (spec 007)", async () => {
    const onSettled = vi.fn();
    const result = streamAnswer({ business, question: "hola", model: streamingModel(["Hola"]), onSettled });
    for await (const piece of result.textStream) void piece;
    await result.finished;
    expect(onSettled).toHaveBeenCalledWith({
      servedModel: "mock-stream",
      usage: { inputTokens: 900, outputTokens: 8, cacheReadTokens: 0, cacheWriteTokens: 0 },
      latencyMs: expect.any(Number),
      finishReason: "stop",
      error: null,
    });
  });

  it("reports the failure too, so failed calls are counted", async () => {
    const onSettled = vi.fn();
    const result = streamAnswer({ business, question: "hola", model: streamingModel([], { fail: true }), onSettled });
    await expect(async () => {
      for await (const piece of result.textStream) void piece;
      await result.finished;
    }).rejects.toThrow();
    expect(onSettled).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining("provider down") }));
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

// Spec 014: when the model fails, times out or answers nothing, the visitor gets the fallback.
describe("streamAnswer with a fallback", () => {
  const fallbackText = "No pude responder su consulta en este momento. Puede comunicarse con el negocio por el teléfono.";
  const read = async (stream: AsyncIterable<string>) => {
    let text = "";
    for await (const piece of stream) text += piece;
    return text;
  };

  it("streams the fallback when the model fails before any text (criterion 1)", async () => {
    const onEnd = vi.fn();
    const onSettled = vi.fn();
    const result = streamAnswer({
      business,
      question: "hola",
      model: streamingModel([], { fail: true }),
      fallbackText,
      onEnd,
      onSettled,
    });
    expect(await read(result.textStream)).toBe(fallbackText);
    await expect(result.finished).resolves.toMatchObject({ text: fallbackText, fallback: true });
    expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ text: fallbackText, fallback: true }));
    // Criterion 10: the failed call is still recorded as such.
    expect(onSettled).toHaveBeenCalledWith(expect.objectContaining({ finishReason: "error", error: expect.stringContaining("provider down") }));
  });

  it("gives up when the first piece takes too long (criterion 2)", async () => {
    const onSettled = vi.fn();
    const result = streamAnswer({
      business,
      question: "hola",
      model: streamingModel(["tarde"], { initialDelayInMs: 300 }),
      fallbackText,
      timeouts: { firstChunkMs: 30, totalMs: 1_000 },
      onSettled,
    });
    expect(await read(result.textStream)).toBe(fallbackText);
    await expect(result.finished).resolves.toMatchObject({ fallback: true });
    expect(onSettled).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining("timed out") }));
  });

  it("gives up when the whole answer takes too long, keeping what arrived (criteria 2 and 4)", async () => {
    const result = streamAnswer({
      business,
      question: "hola",
      model: streamingModel(["Sí, ", "abrimos ", "los ", "domingos."], { chunkDelayInMs: 60 }),
      fallbackText,
      timeouts: { firstChunkMs: 1_000, totalMs: 150 },
    });
    const text = await read(result.textStream);
    expect(text).toMatch(/^Sí, .*\n\nNo pude responder/);
    expect(text).not.toContain("domingos.");
    await expect(result.finished).resolves.toMatchObject({ text, fallback: true });
  });

  it("streams the fallback when the answer is empty (criterion 3)", async () => {
    const onSettled = vi.fn();
    const result = streamAnswer({ business, question: "hola", model: streamingModel(["  "]), fallbackText, onSettled });
    expect(await read(result.textStream)).toBe(`  ${fallbackText}`);
    await expect(result.finished).resolves.toMatchObject({ fallback: true });
    // The call itself worked: its usage counts as usual.
    expect(onSettled).toHaveBeenCalledWith(expect.objectContaining({ error: null, finishReason: "stop" }));
  });

  it("adds the fallback after a partial answer when the model fails midway (criterion 4)", async () => {
    const result = streamAnswer({
      business,
      question: "hola",
      model: streamingModel(["Sí, abrimos "], { failAfterText: true }),
      fallbackText,
    });
    const text = await read(result.textStream);
    expect(text).toBe(`Sí, abrimos \n\n${fallbackText}`);
    await expect(result.finished).resolves.toMatchObject({ text, fallback: true });
  });

  it("does not use the fallback when the model answers", async () => {
    const result = streamAnswer({ business, question: "hola", model: streamingModel(["Hola."]), fallbackText });
    expect(await read(result.textStream)).toBe("Hola.");
    await expect(result.finished).resolves.toMatchObject({ text: "Hola.", fallback: false });
  });

  it("finishes and reports even if nobody reads the stream (the visitor closed the chat)", async () => {
    const onEnd = vi.fn();
    const result = streamAnswer({ business, question: "hola", model: streamingModel(["Hola."]), fallbackText, onEnd });
    await result.finished;
    expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ text: "Hola.", fallback: false }));
  });

  it("serves the answer as a plain text response", async () => {
    const result = streamAnswer({ business, question: "hola", model: streamingModel(["Ho", "la."]), fallbackText });
    const response = result.toTextStreamResponse({ headers: { "Cache-Control": "no-store" } });
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("Hola.");
  });
});
