"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Loader2, Send, Bot, MapPin, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAIRecommendations } from "@/app/actions/ai";
import type { AIRecommendationResponse, AIRecommendation } from "@/types";

const EXAMPLES = [
  "Quiet dinner for two in Douala, budget 15,000 FCFA",
  "Cheap tasty lunch in Buea under 3,000 FCFA",
  "Grilled fish by the water in Limbe",
  "Family Sunday lunch in Yaoundé with Ndolé",
];

export function AIProductDemo() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AIRecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(message: string) {
    const m = message.trim();
    if (!m || loading) return;
    setQuery(m);
    setLoading(true);
    setError(null);
    setData(null);
    const result = await getAIRecommendations(m);
    setLoading(false);
    if (result.success && result.data) setData(result.data);
    else setError(result.message || "Something went wrong. Please try again.");
  }

  return (
    <section id="ai" className="bg-slate-950 py-16 text-white lg:py-20">
      <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Pitch + input */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 px-4 py-2 text-sm font-bold text-orange-300">
            <Sparkles className="size-4" /> ChopWise AI concierge · free to try
          </div>
          <h2 className="mt-6 font-heading text-4xl font-black sm:text-5xl">Describe the moment. We find the table.</h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            Tell the AI your budget, city, cuisine or occasion — it recommends real approved restaurants from ChopWise.
            No sign-up needed, try it right here.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); run(query); }} className="mt-7">
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 p-2 ring-1 ring-white/10 transition focus-within:ring-orange-400/50">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Romantic dinner in Douala under 20,000 FCFA"
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none"
                maxLength={500}
              />
              <Button type="submit" disabled={loading || !query.trim()} className="h-11 shrink-0 rounded-xl bg-orange-600 px-5 font-bold text-white hover:bg-orange-500">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                <span className="hidden sm:inline">{loading ? "Thinking" : "Ask AI"}</span>
              </Button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => run(ex)}
                disabled={loading}
                className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-orange-400/40 hover:text-white disabled:opacity-50"
              >
                {ex}
              </button>
            ))}
          </div>

          <Link href="/ai-concierge/chat" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-orange-300 transition-colors hover:text-orange-200">
            Open the full chat experience <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Results */}
        <div className="min-h-[440px] rounded-[2rem] bg-white p-5 text-slate-900 shadow-2xl">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={() => run(query)} />
          ) : data ? (
            <Results data={data} />
          ) : (
            <IdleState />
          )}
        </div>
      </div>
    </section>
  );
}

function IdleState() {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
        <Bot className="size-7" />
      </div>
      <h3 className="mt-4 font-heading text-xl font-black">Your AI matches appear here</h3>
      <p className="mt-2 max-w-xs text-sm text-slate-500">
        Type what you&rsquo;re craving or tap an example — ChopWise AI reads your budget, city and mood and finds real tables.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Wallet className="size-3" /> Budget-aware</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><MapPin className="size-3" /> Cameroon cities</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Sparkles className="size-3" /> Occasion & mood</span>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div>
      <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-6 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border p-3">
            <div className="flex justify-between">
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-14 animate-pulse rounded-full bg-slate-200" />
            </div>
            <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-slate-100" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
        <Loader2 className="size-3.5 animate-spin" /> ChopWise AI is matching restaurants…
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
      <h3 className="font-heading text-lg font-black text-slate-900">Hmm, that didn&rsquo;t work</h3>
      <p className="mt-2 max-w-xs text-sm text-slate-500">{message}</p>
      <Button onClick={onRetry} className="mt-5 h-10 rounded-xl bg-orange-600 px-5 font-bold text-white hover:bg-orange-500">
        Try again
      </Button>
    </div>
  );
}

function Results({ data }: { data: AIRecommendationResponse }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">ChopWise AI</p>
      {data.understanding && <p className="mt-2 text-sm leading-relaxed text-slate-700">{data.understanding}</p>}

      {data.recommendations.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
          No matching restaurants yet — try a different city or budget.
          <div className="mt-3">
            <Link href="/explore" className="font-bold text-orange-600">Browse all restaurants →</Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {data.recommendations.slice(0, 3).map((rec) => (
            <RecCard key={rec.restaurantId} rec={rec} />
          ))}
        </div>
      )}

      {data.tips && (
        <p className="mt-4 rounded-xl bg-orange-50 px-3 py-2 text-xs leading-relaxed text-orange-800">💡 {data.tips}</p>
      )}
      <Link href="/explore" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-orange-600">
        See all restaurants <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function RecCard({ rec }: { rec: AIRecommendation }) {
  return (
    <Link
      href={`/restaurants/${rec.slug}`}
      className="block rounded-2xl border border-slate-200 p-3 transition hover:border-orange-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-heading text-base font-black text-slate-950">{rec.restaurantName}</h4>
          {(rec.shortDescription || rec.bestFor) && (
            <p className="truncate text-xs text-slate-500">{rec.shortDescription || rec.bestFor}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
          {rec.matchScore}% match
        </span>
      </div>
      {rec.reason && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">{rec.reason}</p>}
      <div className="mt-2 flex items-center justify-between">
        {rec.estimatedCostPerPerson > 0 && (
          <span className="text-xs font-bold text-orange-600">≈ {rec.estimatedCostPerPerson.toLocaleString()} FCFA / person</span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-slate-500">View <ArrowRight className="size-3" /></span>
      </div>
      {rec.suggestedItems?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {rec.suggestedItems.slice(0, 3).map((it, i) => (
            <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{it.name}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
