"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Sparkles,
  Send,
  Loader2,
  MapPin,
  ArrowRight,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { getAIRecommendations } from "@/app/actions/ai";
import { formatPrice } from "@/lib/utils";
import type {
  AIRecommendation,
  AIRecommendationResponse,
  ConversationTurn,
} from "@/types";

const QUICK_STARTS = [
  "I have 5,000 FCFA for dinner",
  "Romantic dinner for 2",
  "Casual lunch with friends",
  "Best restaurants in Douala",
  "Family celebration this weekend",
  "Somewhere with outdoor seating",
];

export function AIRecommend() {
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new turn / loading change
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns]);

  const submit = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || submitting) return;

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newTurn: ConversationTurn = {
        id,
        userMessage: trimmed,
        response: null,
        isLoading: true,
        timestamp: new Date(),
      };

      setTurns((prev) => [...prev, newTurn]);
      setInput("");
      setSubmitting(true);

      try {
        const res = await getAIRecommendations(trimmed);
        setTurns((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  isLoading: false,
                  response: res.success ? res.data ?? null : null,
                  error: res.success ? undefined : res.message,
                }
              : t
          )
        );
        if (!res.success) toast.error(res.message);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setTurns((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, isLoading: false, error: msg } : t
          )
        );
        toast.error(msg);
      } finally {
        setSubmitting(false);
        // Refocus input for follow-up
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    },
    [submitting]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  const handleQuickStart = (text: string) => {
    setInput(text);
    submit(text);
  };

  const isEmpty = turns.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] -mx-4 sm:-mx-6 lg:-mx-8 -my-6 bg-[#FFF8F0] rounded-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-amber-100/80 bg-[#FFF8F0]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 shadow-sm shadow-brand-orange/30">
            <ShoppingBag className="size-4.5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-foreground leading-tight">
              ChopWise AI
            </h1>
            <p className="flex items-center gap-1.5 text-[11px] text-emerald-600 leading-tight">
              <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online — ready to help
            </p>
          </div>
        </div>
        <Sparkles className="size-5 text-brand-orange/70" />
      </div>

      {/* Chat scroll area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6"
      >
        {isEmpty ? (
          <WelcomeState onQuickStart={handleQuickStart} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {turns.map((turn) => (
              <TurnView
                key={turn.id}
                turn={turn}
                onRetry={() => submit(turn.userMessage)}
                onSuggest={(text) => submit(text)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-amber-100/80 bg-[#FFF8F0]/95 backdrop-blur-sm px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about restaurants, menus, or budgets..."
              maxLength={500}
              disabled={submitting}
              className="w-full h-11 pl-4 pr-3 rounded-full border border-amber-200/70 bg-white text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-brand-orange/60 focus:ring-2 focus:ring-brand-orange/20 transition-all disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !input.trim()}
            className="flex items-center justify-center size-11 rounded-full bg-gradient-to-br from-brand-orange to-amber-500 text-white shadow-md shadow-brand-orange/30 hover:shadow-lg hover:shadow-brand-orange/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
            aria-label="Send"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Welcome State ─────────────────────────────────────────────────────────

function WelcomeState({ onQuickStart }: { onQuickStart: (text: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center max-w-2xl mx-auto text-center pt-8 sm:pt-12"
    >
      <div className="flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 shadow-lg shadow-brand-orange/30 mb-5">
        <Sparkles className="size-8 text-white" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
        What are you in the mood for?
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-8">
        Tell me your budget, occasion, or cravings and I&apos;ll find the perfect restaurant.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 w-full">
        {QUICK_STARTS.map((text, i) => (
          <motion.button
            key={text}
            type="button"
            onClick={() => onQuickStart(text)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * i }}
            className="px-3 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/60 text-xs sm:text-sm font-medium text-brand-orange transition-colors text-center"
          >
            {text}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Conversation Turn ────────────────────────────────────────────────────

function TurnView({
  turn,
  onRetry,
  onSuggest,
}: {
  turn: ConversationTurn;
  onRetry: () => void;
  onSuggest: (text: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* User bubble */}
      <UserBubble message={turn.userMessage} />

      {/* AI response or loading */}
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

// ─── Bubbles ─────────────────────────────────────────────────────────────

function UserBubble({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl rounded-br-md bg-gradient-to-br from-brand-orange to-amber-500 text-white text-sm leading-relaxed shadow-sm shadow-brand-orange/20">
        {message}
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-amber-100 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-brand-orange/70 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="size-2 rounded-full bg-brand-orange/70 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="size-2 rounded-full bg-brand-orange/70 animate-bounce" style={{ animationDelay: "300ms" }} />
          <span className="ml-2 text-xs text-muted-foreground">ChopWise AI is thinking...</span>
        </div>
      </div>
    </motion.div>
  );
}

function ErrorBubble({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-amber-100 shadow-sm">
        <p className="text-sm text-foreground mb-2.5">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/60 text-xs font-medium text-brand-orange transition-colors"
        >
          <RefreshCw className="size-3" />
          Retry
        </button>
      </div>
    </motion.div>
  );
}

// ─── AI Response ─────────────────────────────────────────────────────────

function AIResponse({
  response,
  onSuggest,
}: {
  response: AIRecommendationResponse;
  onSuggest: (text: string) => void;
}) {
  const understanding = highlightOpening(response.understanding);
  const hasResults = response.recommendations.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start"
    >
      <div className="max-w-[92%] sm:max-w-[80%] w-full space-y-3">
        {/* Text bubble */}
        <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-amber-100 shadow-sm">
          <p className="text-sm text-foreground leading-relaxed">{understanding}</p>
        </div>

        {/* Recommendation cards */}
        {hasResults && (
          <div className="space-y-2.5">
            <AnimatePresence>
              {response.recommendations.map((rec, i) => (
                <RecommendationCard key={rec.restaurantId} rec={rec} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Tips */}
        {response.tips && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60"
          >
            <Lightbulb className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">{response.tips}</p>
          </motion.div>
        )}

        {/* Follow-up suggestion */}
        {response.followUp && (
          <motion.button
            type="button"
            onClick={() => onSuggest(response.followUp!)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-amber-50 border border-amber-200/60 text-xs font-medium text-brand-orange transition-colors"
          >
            <Sparkles className="size-3" />
            {response.followUp}
          </motion.button>
        )}

        {/* Empty results — suggest alternatives */}
        {!hasResults && (
          <div className="flex flex-wrap gap-2">
            {["Lower budget", "Different city", "Casual spot"].map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => onSuggest(text)}
                className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/60 text-xs font-medium text-brand-orange transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Wrap the opening interjection ("Perfect!", "Great choice!", etc.) in a brand color.
function highlightOpening(text: string): React.ReactNode {
  const match = text.match(/^([A-Z][a-z]+!|[A-Z][a-z]+ [a-z]+!)/);
  if (!match) return text;
  return (
    <>
      <span className="font-semibold text-brand-orange">{match[1]}</span>
      {text.slice(match[1].length)}
    </>
  );
}

// ─── Recommendation Card ─────────────────────────────────────────────────

function RecommendationCard({ rec, index }: { rec: AIRecommendation; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
    >
      <Link
        href={`/dashboard/restaurants/${rec.slug}`}
        className="group block relative overflow-hidden rounded-2xl bg-white border border-amber-100/80 hover:border-brand-orange/40 shadow-sm hover:shadow-md transition-all"
      >
        {/* Left accent */}
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-orange to-amber-500" />

        <div className="flex items-start gap-3 px-4 py-3.5 pl-5">
          {/* Icon */}
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-brand-orange/10 to-amber-100 shrink-0">
            <MapPin className="size-4.5 text-brand-orange" />
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground group-hover:text-brand-orange transition-colors truncate">
                  {rec.restaurantName}
                </h3>
                {rec.shortDescription && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {rec.shortDescription}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold text-brand-orange leading-none">
                  {rec.matchScore}%
                </p>
                {rec.estimatedCostPerPerson > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {formatPrice(rec.estimatedCostPerPerson)}
                  </p>
                )}
              </div>
            </div>

            {rec.bestFor && (
              <p className="text-[11px] text-muted-foreground mt-1.5 italic">
                {rec.bestFor}
              </p>
            )}

            {rec.reason && (
              <p className="text-xs text-foreground/80 mt-2 leading-relaxed line-clamp-2">
                {rec.reason}
              </p>
            )}

            {/* Suggested items pills */}
            {rec.suggestedItems.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {rec.suggestedItems.slice(0, 3).map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/60 text-[10px] font-medium text-amber-900"
                  >
                    {item.name}
                    {item.price > 0 && (
                      <span className="text-amber-700/70">· {formatPrice(item.price)}</span>
                    )}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 mt-2.5 text-[11px] font-semibold text-brand-orange opacity-0 group-hover:opacity-100 transition-opacity">
              View details <ArrowRight className="size-3" />
            </div>
          </div>
        </div>

        {/* Match score progress bar */}
        <div className="h-1 bg-amber-50">
          <div
            className="h-full bg-gradient-to-r from-brand-orange to-amber-500"
            style={{ width: `${rec.matchScore}%` }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
