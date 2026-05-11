import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-surface px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-orange/10 mb-6">
        <UtensilsCrossed className="size-8 text-brand-orange" />
      </div>
      <h1 className="text-6xl font-bold font-heading text-brand-dark mb-2">404</h1>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-md">
        This page doesn&apos;t exist. It might have been moved or the URL is incorrect.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white transition-colors shadow-md shadow-brand-orange/20"
        >
          Go Home
        </Link>
        <Link
          href="/explore"
          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-border/60 text-foreground hover:bg-muted/80 transition-colors"
        >
          Explore Restaurants
        </Link>
      </div>
    </div>
  );
}
