import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChefHat,
  Heart,
  MessageCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function CoreFeatures() {
  const items = [
    [Search, "Search by city and budget", "Filter restaurants by city, price range and useful amenities."],
    [CalendarCheck, "Reserve without calling", "Choose the date, time and guest count, then track the booking status."],
    [MessageCircle, "WhatsApp communication", "Owners and diners receive reservation updates using +237-compatible formatting."],
  ] as const;

  return (
    <section id="features" className="bg-[#fffaf5] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Built for local dining</p>
          <h2 className="mt-3 font-heading text-3xl font-black text-slate-950 sm:text-4xl">Less searching. Less calling. More eating.</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map(([Icon, title, text]) => (
            <article key={title} className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5">
              <Icon className="size-7 text-orange-600" />
              <h3 className="mt-5 font-heading text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CompactHowItWorks() {
  const steps = [
    [Search, "Tell us what you want", "Search directly or describe your budget and city."],
    [CalendarCheck, "Choose and reserve", "Select a restaurant, date, time and number of guests."],
    [Heart, "Get confirmed and dine", "Follow the status and receive clear updates."],
  ] as const;

  return (
    <section id="how-it-works" className="bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Three simple steps</p>
          <h2 className="mt-3 font-heading text-4xl font-black text-slate-950">From craving to confirmed table.</h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-500">The redesigned page removes unnecessary empty space and keeps the strongest actions close together.</p>
        </div>
        <div className="space-y-4">
          {steps.map(([Icon, title, text], index) => (
            <div key={title} className="flex gap-5 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white"><Icon className="size-5" /></div>
              <div><p className="text-xs font-black text-orange-600">0{index + 1}</p><h3 className="mt-1 font-heading text-xl font-black text-slate-950">{title}</h3><p className="mt-2 text-sm text-slate-500">{text}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhatsAppFlow() {
  return (
    <section id="whatsapp" className="bg-emerald-950 py-16 text-white lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300"><MessageCircle className="size-4" />Built for how Cameroon communicates</div>
          <h2 className="mt-5 font-heading text-4xl font-black sm:text-5xl">Reservations that continue on WhatsApp.</h2>
          <p className="mt-5 text-lg leading-relaxed text-emerald-100/75">Local nine-digit numbers are normalized to Cameroon&apos;s +237 format before notifications are sent.</p>
          <div className="mt-7 space-y-3">
            {["Customer submits a booking", "Restaurant receives a direct action link", "Diner receives the updated status"].map((item) => <p key={item} className="flex items-center gap-3"><CheckCircle2 className="size-5 text-emerald-300" />{item}</p>)}
          </div>
        </div>
        <div className="mx-auto w-full max-w-md rounded-[2rem] bg-[#e9f7ef] p-5 text-slate-900 shadow-2xl">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold text-emerald-700">🍽️ ChopWise — New Booking Request</p>
            <p className="mt-4 text-sm leading-7 text-slate-700">A diner wants to book your restaurant.</p>
            <div className="mt-3 space-y-1 text-sm text-slate-600"><p>📅 Saturday, 7:30 PM</p><p>👥 2 guests</p><p>💰 Budget: 15,000 FCFA</p></div>
            <div className="mt-5 rounded-xl bg-emerald-600 py-3 text-center text-sm font-bold text-white">Open reservation</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RestaurantOwnerSection() {
  const benefits = ["Professional restaurant profile", "Food and interior photo galleries", "Menus and prices in FCFA", "Reservation dashboard", "WhatsApp notifications"];

  return (
    <section id="for-restaurants" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-slate-950 lg:grid-cols-2">
        <div className="relative min-h-[430px]"><img src="https://commons.wikimedia.org/wiki/Special:FilePath/Goat_meat_soya.jpg?width=1200" alt="Grilled soya skewers, a Cameroonian street-food classic" className="absolute inset-0 h-full w-full object-cover" /></div>
        <div className="p-8 text-white sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">For restaurant owners</p>
          <h2 className="mt-3 font-heading text-4xl font-black">Turn hungry searches into confirmed tables.</h2>
          <div className="mt-7 space-y-3">{benefits.map((item) => <p key={item} className="flex items-center gap-3 text-sm text-slate-200"><CheckCircle2 className="size-5 text-emerald-400" />{item}</p>)}</div>
          <Link href="/sign-up/owner" className="mt-8 inline-flex"><Button className="h-12 rounded-xl bg-orange-600 px-6 font-bold text-white">List your restaurant <ArrowRight className="ml-2 size-4" /></Button></Link>
        </div>
      </div>
    </section>
  );
}

export function HonestProofSection() {
  const items = [
    [ShieldCheck, "Controlled recommendations", "AI results are checked against approved restaurant IDs."],
    [ChefHat, "Food-first presentation", "Food, ambience and menu information are visible early."],
    [CalendarCheck, "Traceable reservations", "Booking status is stored and shown in the dashboard."],
  ] as const;

  return (
    <section className="bg-[#fffaf5] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Honest trust signals</p><h2 className="mt-3 font-heading text-3xl font-black text-slate-950 sm:text-4xl">Useful product proof instead of invented testimonials.</h2></div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">{items.map(([Icon, title, text]) => <article key={title} className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5"><Icon className="size-7 text-orange-600" /><h3 className="mt-5 font-heading text-xl font-black text-slate-950">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{text}</p></article>)}</div>
      </div>
    </section>
  );
}
