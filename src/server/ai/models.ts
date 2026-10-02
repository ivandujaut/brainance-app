import type { LanguageModel } from "ai";
import { MockLanguageModelV4, simulateReadableStream } from "ai/test";

export const DEFAULT_ANSWER_MODEL = "anthropic/claude-haiku-4.5";

/** Deterministic, free model for E2E runs: streams back "Respuesta de prueba a: <last question>". */
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
      const words = `Respuesta de prueba a: ${question}`.split(/(?<= )/);
      return {
        stream: simulateReadableStream({
          chunkDelayInMs: 20,
          chunks: [
            { type: "text-start" as const, id: "echo" },
            ...words.map((delta) => ({ type: "text-delta" as const, id: "echo", delta })),
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
export const resolveAnswerModel = (): LanguageModel => {
  const id = process.env.AI_ANSWER_MODEL || DEFAULT_ANSWER_MODEL;
  if (id === "mock/echo") {
    if (process.env.AI_ALLOW_MOCK_MODEL !== "true") throw new Error("The mock model needs AI_ALLOW_MOCK_MODEL=true");
    return echoModel();
  }
  return id;
};
