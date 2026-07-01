"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Send,
  Loader2,
  MapPin,
  ArrowRight,
  Lightbulb,
  RefreshCw,
  Plus,
  Bot,
  Utensils,
} from "lucide-react";
import { getAIRecommendations } from "@/app/actions/ai";
import { formatPrice } from "@/lib/utils";
import type { AIRecommendation, AIRecommendationResponse, ConversationTurn } from "@/types";

const QUICK_STARTS = [
  "Romantic dinner for two in Douala under 20,000 FCFA",
  "Where can I eat Ndolé in Yaoundé?",
  "Cheap tasty lunch in Buea under 3,000 FCFA",
  "Fresh grilled fish by the water in Limbe",
  "Family Sunday lunch with traditional food",
  "Somewhere with outdoor seating and good drinks",
];

export function AiChatExperience() {
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const submit = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || submitting) return;

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setTurns((prev) => [...prev, { id, userMessage: trimmed, response: null, isLoading: true, timestamp: new Date() }]);
      setInput("");
      setSubmitting(true);

      try {
        const res = await getAIRecommendations(trimmed);
        setTurns((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, isLoading: false, response: res.success ? res.data ?? null : null, error: res.success ? undefined : res.message }
              : t
          )
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, isLoading: false, error: msg } : t)));
      } finally {
        setSubmitting(false);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    },
    [submitting]
  );

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  }

  const isEmpty = turns.length === 0;

  return (
    <div className="flex h-[100dvh] flex-col bg-[#FFF9F3]">
      {/* Top bar */}
      <header className="z-10 flex items-center justify-between border-b border-amber-100/80 bg-white/80 px-4 py-2.5 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-2.5">
          <Link href="/ai-concierge" className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-amber-50 hover:text-brand-orange" aria-label="Back">
            <ArrowLeft className="size-4.5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 shadow-sm shadow-brand-orange/30">
              <Utensils className="size-4.5 text-white" strokeWidth={2.4} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">ChopWise AI</p>
              <p className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-emerald-500" /> Online · free to use
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEmpty && (
            <button
              onClick={() => setTurns([])}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-200/70 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-orange/40 hover:text-brand-orange"
            >
              <Plus className="size-3.5" /> New chat
            </button>
          )}
          <Link href="/explore" className="hidden rounded-full bg-brand-orange px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-orange-hover sm:inline-flex">
            Browse restaurants
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {isEmpty ? (
          <WelcomeState onPick={submit} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            {turns.map((turn) => (
              <TurnView key={turn.id} turn={turn} onRetry={() => submit(turn.userMessage)} onSuggest={submit} />
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-amber-100/80 bg-white/85 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:px-6">
        <form
          onSubmit={(e) => { e.preventDefault(); submit(input); }}
          className="mx-auto flex max-w-3xl items-end gap-2 rounded-[1.75rem] border border-amber-200/70 bg-white p-2 shadow-sm transition focus-within:border-brand-orange/50 focus-within:ring-2 focus-within:ring-brand-orange/15"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message ChopWise AI — budget, city, cuisine or occasion…"
            rows={1}
            maxLength={500}
            disabled={submitting}
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={submitting || !input.trim()}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-amber-500 text-white shadow-md shadow-brand-orange/30 transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            aria-label="Send"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-slate-400">
          ChopWise AI recommends real approved restaurants. It can make mistakes — always confirm details.
        </p>
      </div>
    </div>
  );
}

function WelcomeState({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center pt-6 text-center sm:pt-12">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 shadow-lg shadow-brand-orange/30">
        <Bot className="size-8 text-white" />
      </div>
      <h1 className="font-heading text-2xl font-black text-slate-900 sm:text-3xl">Hi, I&rsquo;m ChopWise AI 👋</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 sm:text-base">
        Tell me your budget, city, cravings or the occasion — I&rsquo;ll find real restaurants across Cameroon that fit.
      </p>
      <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-2">
        {QUICK_STARTS.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onPick(text)}
            className="group flex items-center gap-3 rounded-2xl border border-amber-200/60 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:border-brand-orange/40 hover:shadow-md"
          >
            <Sparkles className="size-4 shrink-0 text-brand-orange" />
            <span className="flex-1">{text}</span>
            <ArrowRight className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-brand-orange" />
          </button>
        ))}
      </div>
    </div>
  );
}

function TurnView({ turn, onRetry, onSuggest }: { turn: ConversationTurn; onRetry: () => void; onSuggest: (t: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-brand-orange to-amber-500 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm shadow-brand-orange/20 sm:max-w-[75%]">
          {turn.userMessage}
        </div>
      </div>
      {turn.isLoading ? (
        <TypingBubble />
      ) : turn.error ? (
        <ErrorBubble message={turn.error} onRetry={onRetry} />
      ) : turn.response ? (
        <AIResponse response={turn.response} onSuggest={onSuggest} />
      ) : null}
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-amber-100 bg-white px-4 py-3 shadow-sm">
        <span className="size-2 animate-bounce rounded-full bg-brand-orange/70" style={{ animationDelay: "0ms" }} />
        <span className="size-2 animate-bounce rounded-full bg-brand-orange/70" style={{ animationDelay: "150ms" }} />
        <span className="size-2 animate-bounce rounded-full bg-brand-orange/70" style={{ animationDelay: "300ms" }} />
        <span className="ml-2 text-xs text-slate-400">Finding restaurants…</span>
      </div>
    </div>
  );
}

function ErrorBubble({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-amber-100 bg-white px-4 py-3 shadow-sm sm:max-w-[75%]">
        <p className="mb-2.5 text-sm text-slate-800">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-200/60 bg-amber-50 px-3 py-1.5 text-xs font-medium text-brand-orange transition-colors hover:bg-amber-100"
        >
          <RefreshCw className="size-3" /> Retry
        </button>
      </div>
    </div>
  );
}

function AIResponse({ response, onSuggest }: { response: AIRecommendationResponse; onSuggest: (t: string) => void }) {
  const hasResults = response.recommendations.length > 0;
  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[92%] space-y-3 sm:max-w-[82%]">
        {response.understanding && (
          <div className="rounded-2xl rounded-bl-md border border-amber-100 bg-white px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed text-slate-800">{response.understanding}</p>
          </div>
        )}

        {hasResults && (
          <div className="space-y-2.5">
            {response.recommendations.map((rec) => (
              <RecommendationCard key={rec.restaurantId} rec={rec} />
            ))}
          </div>
        )}

        {response.tips && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/80 px-3.5 py-2.5">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-amber-900">{response.tips}</p>
          </div>
        )}

        {response.followUp && (
          <button
            type="button"
            onClick={() => onSuggest(response.followUp!)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-200/60 bg-white px-3.5 py-2 text-xs font-medium text-brand-orange transition-colors hover:bg-amber-50"
          >
            <Sparkles className="size-3" /> {response.followUp}
          </button>
        )}

        {!hasResults && (
          <div className="flex flex-wrap gap-2">
            {["Lower my budget", "Try another city", "Somewhere casual"].map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => onSuggest(text)}
                className="cursor-pointer rounded-full border border-amber-200/60 bg-amber-50 px-3 py-1.5 text-xs font-medium text-brand-orange transition-colors hover:bg-amber-100"
              >
                {text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: AIRecommendation }) {
  return (
    <Link
      href={`/restaurants/${rec.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-amber-100/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-orange/40 hover:shadow-md"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-orange to-amber-500" />
      <div className="flex items-start gap-3 px-4 py-3.5 pl-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-orange/10 to-amber-100">
          <MapPin className="size-4.5 text-brand-orange" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-brand-orange">{rec.restaurantName}</h3>
              {rec.shortDescription && <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{rec.shortDescription}</p>}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-base font-bold leading-none text-brand-orange tabular-nums">{rec.matchScore}%</p>
              {rec.estimatedCostPerPerson > 0 && <p className="mt-1 text-[11px] text-slate-500 tabular-nums">{formatPrice(rec.estimatedCostPerPerson)}</p>}
            </div>
          </div>
          {rec.bestFor && <p className="mt-1.5 text-[11px] italic text-slate-500">{rec.bestFor}</p>}
          {rec.reason && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-700">{rec.reason}</p>}
          {rec.suggestedItems.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {rec.suggestedItems.slice(0, 3).map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900">
                  {item.name}
                  {item.price > 0 && <span className="text-amber-700/70">· {formatPrice(item.price)}</span>}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-brand-orange opacity-0 transition-opacity group-hover:opacity-100">
            View details <ArrowRight className="size-3" />
          </div>
        </div>
      </div>
      <div className="h-1 bg-amber-50">
        <div className="h-full bg-gradient-to-r from-brand-orange to-amber-500" style={{ width: `${rec.matchScore}%` }} />
      </div>
    </Link>
  );
}
