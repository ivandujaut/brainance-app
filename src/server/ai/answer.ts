import { generateText, streamText, type LanguageModel } from "ai";
import { buildAnswerSystemPrompt, type BusinessKnowledge } from "@/domain/answer-prompt";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AnswerUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
};

export type AnswerReport = {
  servedModel: string | null;
  usage: AnswerUsage;
  latencyMs: number;
  finishReason: AnswerResult["finishReason"];
  error: string | null;
};

export type AnswerResult = {
  text: string;
  /** Model id reported by the provider, which may differ from the requested alias. */
  servedModel: string;
  usage: AnswerUsage;
  latencyMs: number;
  finishReason: "stop" | "length" | "content-filter" | "tool-calls" | "error" | "other";
};

const buildPrompt = (business: BusinessKnowledge, history: ChatTurn[], question: string) => ({
  instructions: {
    role: "system" as const,
    content: buildAnswerSystemPrompt(business),
    // The system prompt is the stable, per-business prefix: cache it where supported.
    providerOptions: { anthropic: { cacheControl: { type: "ephemeral" as const } } },
  },
  messages: [...history, { role: "user" as const, content: question }],
});

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
  const result = await generateText({ model, maxOutputTokens, ...buildPrompt(business, history, question) });

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

/**
 * Streaming variant of answerQuestion for the chat widget. `finished` settles when the answer
 * is complete: it calls `onEnd` with the full text, or rejects if the model failed.
 */
export const streamAnswer = ({
  business,
  question,
  history = [],
  model,
  maxOutputTokens = 1024,
  onEnd,
  onSettled,
}: {
  business: BusinessKnowledge;
  question: string;
  history?: ChatTurn[];
  model: LanguageModel;
  maxOutputTokens?: number;
  onEnd?: (end: { text: string; finishReason: AnswerResult["finishReason"] }) => void | Promise<void>;
  /** Called once when the call ends, successfully or not, with what it cost (spec 007). */
  onSettled?: (report: AnswerReport) => void | Promise<void>;
}) => {
  const startedAt = performance.now();
  let failure: unknown;
  const result = streamText({
    model,
    maxOutputTokens,
    ...buildPrompt(business, history, question),
    onError: ({ error }) => {
      failure = error;
    },
  });

  let settled = false;
  const settle = async (report: Omit<AnswerReport, "latencyMs">) => {
    // Once per call, even if onEnd fails after a successful answer.
    if (settled) return;
    settled = true;
    try {
      await onSettled?.({ ...report, latencyMs: Math.round(performance.now() - startedAt) });
    } catch {
      // Recording usage must never break the answer.
    }
  };

  const finished = (async () => {
    try {
      const [text, finishReason, usage, response] = await Promise.all([
        result.text,
        result.finishReason,
        result.totalUsage,
        result.response,
      ]);
      if (failure) throw failure;
      await settle({
        servedModel: response.modelId,
        usage: {
          inputTokens: usage.inputTokens ?? 0,
          outputTokens: usage.outputTokens ?? 0,
          cacheReadTokens: usage.inputTokenDetails.cacheReadTokens ?? 0,
          cacheWriteTokens: usage.inputTokenDetails.cacheWriteTokens ?? 0,
        },
        finishReason,
        error: null,
      });
      await onEnd?.({ text, finishReason });
    } catch (error) {
      const cause = failure ?? error;
      await settle({
        servedModel: null,
        usage: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 },
        finishReason: "error",
        error: cause instanceof Error ? cause.message : String(cause),
      });
      throw cause;
    }
  })();

  return {
    textStream: result.textStream,
    finished,
    toTextStreamResponse: (init?: ResponseInit) => result.toTextStreamResponse(init),
  };
};
