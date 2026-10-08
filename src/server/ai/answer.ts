import { generateText, streamText, type LanguageModel } from "ai";
import { fallbackSuffix } from "@/domain/fallback-reply";
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

/** How long the widget waits for the model before falling back (spec 014, criterion 2). */
export const ANSWER_TIMEOUTS = { firstChunkMs: 15_000, totalMs: 45_000 };

const NO_USAGE: AnswerUsage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
const TIMED_OUT = Symbol("timed out");
const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export type StreamEnd = {
  /** What the visitor got: the model's answer, or what arrived of it plus the fallback. */
  text: string;
  finishReason: AnswerResult["finishReason"];
  /** Whether the fallback was used: the model failed, timed out or answered nothing (spec 014). */
  fallback: boolean;
};

/**
 * Streaming variant of answerQuestion for the chat widget. `finished` settles when the answer
 * is complete, even if nobody reads the stream: it calls `onEnd` with the text the visitor got.
 *
 * With `fallbackText`, a failure, a timeout or an empty answer never leaves the visitor without
 * a reply: the fallback is streamed (after any partial text) and `finished` resolves. Without it,
 * `finished` rejects when the model fails.
 */
export const streamAnswer = ({
  business,
  question,
  history = [],
  model,
  maxOutputTokens = 1024,
  fallbackText,
  timeouts = ANSWER_TIMEOUTS,
  onEnd,
  onSettled,
}: {
  business: BusinessKnowledge;
  question: string;
  history?: ChatTurn[];
  model: LanguageModel;
  maxOutputTokens?: number;
  fallbackText?: string;
  timeouts?: { firstChunkMs: number; totalMs: number };
  onEnd?: (end: StreamEnd) => void | Promise<void>;
  /** Called once when the call ends, successfully or not, with what it cost (spec 007). */
  onSettled?: (report: AnswerReport) => void | Promise<void>;
}) => {
  const startedAt = performance.now();
  const abort = new AbortController();
  let failure: unknown = null;
  const result = streamText({
    model,
    maxOutputTokens,
    abortSignal: abort.signal,
    ...buildPrompt(business, history, question),
    onError: ({ error }) => {
      failure ??= error;
    },
  });

  // Pieces go out as they arrive; the answer is produced and stored even if the visitor stops reading.
  let output!: ReadableStreamDefaultController<string>;
  let reading = true;
  const stream = new ReadableStream<string>({
    start(controller) {
      output = controller;
    },
    cancel() {
      reading = false;
    },
  });
  const emit = (piece: string) => {
    if (!reading) return;
    try {
      output.enqueue(piece);
    } catch {
      reading = false;
    }
  };

  const settle = async (report: Omit<AnswerReport, "latencyMs">) => {
    try {
      await onSettled?.({ ...report, latencyMs: Math.round(performance.now() - startedAt) });
    } catch {
      // Recording usage must never break the answer.
    }
  };

  /** The model's text, or what arrived of it before it failed or ran out of time. */
  const readModel = async () => {
    let text = "";
    let received = false;
    let error: unknown = null;
    const pieces = result.textStream[Symbol.asyncIterator]();
    try {
      for (;;) {
        const limit = received ? timeouts.totalMs : Math.min(timeouts.firstChunkMs, timeouts.totalMs);
        let timer: ReturnType<typeof setTimeout> | undefined;
        const deadline = new Promise<typeof TIMED_OUT>((resolve) => {
          timer = setTimeout(() => resolve(TIMED_OUT), Math.max(0, limit - (performance.now() - startedAt)));
        });
        const next = await Promise.race([pieces.next(), deadline]).finally(() => clearTimeout(timer));
        if (next === TIMED_OUT) {
          abort.abort();
          error = new Error(`Model timed out ${received ? "before finishing" : "before its first piece"}`);
          break;
        }
        if (next.done) break;
        received = true;
        text += next.value;
        emit(next.value);
      }
    } catch (cause) {
      error = cause;
    }
    return { text, error: error ?? failure };
  };

  const finished = (async (): Promise<StreamEnd> => {
    try {
      const read = await readModel();
      let { text, error } = read;
      let finishReason: AnswerResult["finishReason"] = "error";
      if (!error) {
        try {
          const [reason, usage, response] = await Promise.all([result.finishReason, result.totalUsage, result.response]);
          finishReason = reason;
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
        } catch (cause) {
          error = cause;
        }
      }
      if (error) await settle({ servedModel: null, usage: NO_USAGE, finishReason: "error", error: errorMessage(error) });

      const fallback = fallbackText !== undefined && (error !== null || !text.trim());
      if (error && !fallback) throw error;
      if (fallback) {
        const suffix = fallbackSuffix(text, fallbackText);
        text += suffix;
        emit(suffix);
      }
      const end = { text, finishReason, fallback };
      await onEnd?.(end);
      return end;
    } finally {
      if (reading) output.close();
    }
  })();

  const textStream: AsyncIterable<string> = {
    async *[Symbol.asyncIterator]() {
      const reader = stream.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) return;
          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    },
  };

  return {
    textStream,
    finished,
    toTextStreamResponse: (init?: ResponseInit) => {
      const headers = new Headers(init?.headers);
      if (!headers.has("Content-Type")) headers.set("Content-Type", "text/plain; charset=utf-8");
      return new Response(stream.pipeThrough(new TextEncoderStream()), { ...init, headers });
    },
  };
};
