import type { LanguageModel } from "ai";
import { MockLanguageModelV4, simulateReadableStream } from "ai/test";

export const DEFAULT_ANSWER_MODEL = "anthropic/claude-haiku-4.5";

/**
 * Deterministic, free model for E2E runs: streams back "Respuesta de prueba a: <last question>".
 * Markers in the question simulate failures (spec 014): "[falla]" fails before any text, "[vacio]"
 * answers nothing and "[corte]" fails after the first words.
 */
const echoModel = () =>
  new MockLanguageModelV4({
    provider: "mock",
    modelId: "echo",
    doStream: async ({ prompt }) => {
      const lastUser = [...prompt].reverse().find((m) => m.role === "user");
      const question =
        lastUser?.role === "user"
          ? lastUser.content.map((part) => (part.type === "text" ? part.text : "")).join("")
          : "";
      if (question.includes("[falla]")) throw new Error("Mock model failure");
      const empty = question.includes("[vacio]");
      const cut = question.includes("[corte]");
      const all = `Respuesta de prueba a: ${question}`.split(/(?<= )/);
      const words = empty ? [] : cut ? all.slice(0, 2) : all;
      return {
        stream: simulateReadableStream({
          chunkDelayInMs: 20,
          chunks: [
            { type: "text-start" as const, id: "echo" },
            ...words.map((delta) => ({ type: "text-delta" as const, id: "echo", delta })),
            ...(cut ? [{ type: "error" as const, error: new Error("Mock model failure") }] : []),
            { type: "text-end" as const, id: "echo" },
            {
              type: "finish" as const,
              finishReason: { unified: "stop" as const, raw: "stop" },
              usage: {
                inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 },
                outputTokens: { total: words.length, text: words.length, reasoning: 0 },
              },
            },
          ],
        }),
      };
    },
  });

/**
 * Model used to answer widget visitors: AI_ANSWER_MODEL (a Vercel AI Gateway id) or the default.
 * "mock/echo" is only allowed when AI_ALLOW_MOCK_MODEL=true (E2E runs), never by accident.
 */
export const answerModelId = () => process.env.AI_ANSWER_MODEL || DEFAULT_ANSWER_MODEL;

export const resolveAnswerModel = (): LanguageModel => {
  const id = answerModelId();
  if (id === "mock/echo") {
    if (process.env.AI_ALLOW_MOCK_MODEL !== "true") throw new Error("The mock model needs AI_ALLOW_MOCK_MODEL=true");
    return echoModel();
  }
  return id;
};
