import Link from "next/link";
import { Mail, MapPin, Phone, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FoodieCTA() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-gradient-to-r from-orange-700 to-amber-500 px-6 py-14 text-center text-white">
        <UtensilsCrossed className="mx-auto size-10" />
        <h2 className="mx-auto mt-5 max-w-3xl font-heading text-4xl font-black sm:text-5xl">Your next favourite meal may be one search away.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">Explore restaurants, compare budgets in FCFA and reserve with less stress.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/explore"><Button className="h-12 rounded-xl bg-white px-7 font-bold text-orange-700 hover:bg-orange-50">Explore restaurants</Button></Link>
          <Link href="/sign-up"><Button variant="outline" className="h-12 rounded-xl border-white/30 bg-white/10 px-7 font-bold text-white hover:bg-white/20 hover:text-white">Create an account</Button></Link>
        </div>
      </div>
    </section>
  );
}

export function FoodieFooter() {
  const configuredPhone = process.env.NEXT_PUBLIC_CHOPWISE_PHONE;

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2 text-white"><div className="flex size-10 items-center justify-center rounded-xl bg-orange-600"><UtensilsCrossed className="size-5" /></div><span className="font-heading text-2xl font-black">ChopWise</span></Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">A Cameroon-focused platform for restaurant discovery, AI recommendations, reservations and restaurant visibility.</p>
        </div>
        <div>
          <h3 className="font-bold text-white">Navigate</h3>
          <div className="mt-4 space-y-3 text-sm">
            <Link href="/explore" className="block hover:text-white">Explore restaurants</Link>
            <Link href="/features" className="block hover:text-white">Features</Link>
            <Link href="/ai-concierge" className="block hover:text-white">AI concierge</Link>
            <Link href="/how-it-works" className="block hover:text-white">How it works</Link>
            <Link href="/for-restaurants" className="block hover:text-white">For restaurant owners</Link>
            <Link href="/contact" className="block hover:text-white">Contact</Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-white">Cameroon contact</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            {configuredPhone ? <a href={`tel:${configuredPhone}`} className="flex items-center gap-2 hover:text-white"><Phone className="size-4 text-orange-400" />{configuredPhone}</a> : <p className="flex items-center gap-2"><Phone className="size-4 text-orange-400" />+237 phone configured in Vercel</p>}
            <a href="mailto:hello@chopwise.cm" className="flex items-center gap-2 hover:text-white"><Mail className="size-4 text-orange-400" />hello@chopwise.cm</a>
            <p className="flex items-center gap-2"><MapPin className="size-4 text-orange-400" />Douala · Yaoundé · Limbe · Buea</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} ChopWise. Customer-facing prices use FCFA; payment integrations use the ISO code XAF.</div>
    </footer>
  );
}
