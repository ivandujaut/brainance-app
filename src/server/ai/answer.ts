import { generateText, type LanguageModel } from "ai";
import { buildAnswerSystemPrompt, type BusinessKnowledge } from "@/domain/answer-prompt";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AnswerUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
};

export type AnswerResult = {
  text: string;
  /** Model id reported by the provider, which may differ from the requested alias. */
  servedModel: string;
  usage: AnswerUsage;
  latencyMs: number;
  finishReason: "stop" | "length" | "content-filter" | "tool-calls" | "error" | "other";
};

/**
 * Answers a visitor's question using only the business knowledge base.
 * `model` is a Vercel AI Gateway id (e.g. "anthropic/claude-haiku-4.5") or a LanguageModel instance.
 */
export const answerQuestion = async ({
  business,
  question,
  history = [],
  model,
  maxOutputTokens = 1024,
}: {
  business: BusinessKnowledge;
  question: string;
  history?: ChatTurn[];
  model: LanguageModel;
  maxOutputTokens?: number;
}): Promise<AnswerResult> => {
  const startedAt = performance.now();
  const result = await generateText({
    model,
    instructions: {
      role: "system",
      content: buildAnswerSystemPrompt(business),
      // The system prompt is the stable, per-business prefix: cache it where supported.
      providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
    },
    messages: [...history, { role: "user", content: question }],
    maxOutputTokens,
  });

  return {
    text: result.text,
    servedModel: result.response.modelId,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
      cacheReadTokens: result.usage.inputTokenDetails.cacheReadTokens ?? 0,
      cacheWriteTokens: result.usage.inputTokenDetails.cacheWriteTokens ?? 0,
    },
    latencyMs: performance.now() - startedAt,
    finishReason: result.finishReason,
  };
};
