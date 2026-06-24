import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  ChefHat,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  Users,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";
import type { LandingStats } from "@/app/actions/landing";

const images = {
  hero: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=88",
  grilled: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=86",
  pasta: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=86",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=86",
  interior: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=86",
  dessert: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=86",
};

const cities = ["Douala", "Yaoundé", "Buea", "Limbe", "Bamenda"];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#120b07] pt-20 text-white">
      <div className="absolute inset-0">
        <Image
          src={images.hero}
          alt="A generous table of appetising dishes"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#120b07] via-[#120b07]/90 to-[#120b07]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120b07] via-transparent to-black/10" />
        <div className="absolute inset-x-0 top-0 h-20 bg-white/95 backdrop-blur" />
      </div>

      <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-black/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-200 backdrop-blur">
            <Sparkles className="h-4 w-4" /> AI dining guide for Cameroon
          </div>

          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Find food that makes you
            <span className="block bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 bg-clip-text text-transparent">
              hungry at first sight.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Discover restaurants by city, budget and occasion, reserve without calling,
            and receive booking updates directly on WhatsApp.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/explore"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-500 px-7 text-base font-bold text-[#1a0d05] transition hover:bg-amber-400"
            >
              Explore restaurants <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/ai-recommend"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Ask ChopWise AI <Bot className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="mt-9">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Search by city
            </p>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <Link
                  key={city}
                  href={`/explore?city=${encodeURIComponent(city)}`}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur transition hover:border-amber-300/60 hover:bg-amber-400/15"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="relative ml-auto max-w-[520px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl shadow-black/40">
              <Image
                src={images.grilled}
                alt="Grilled food served with colourful sides"
                fill
                priority
                sizes="45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-7">
                <p className="text-sm font-semibold text-amber-300">Food worth going out for</p>
                <p className="mt-2 text-2xl font-bold">Taste Cameroon, one table at a time.</p>
              </div>
            </div>

            <div className="absolute -left-12 top-12 w-48 overflow-hidden rounded-2xl border-4 border-[#120b07] bg-white shadow-2xl">
              <div className="relative h-36">
                <Image src={images.pasta} alt="Creamy pasta dish" fill sizes="200px" className="object-cover" />
              </div>
              <p className="px-4 py-3 text-sm font-bold text-[#2b1810]">Dinner ideas from 5,000 FCFA</p>
            </div>

            <div className="absolute -right-8 bottom-16 rounded-2xl border border-white/15 bg-black/70 p-4 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/20">
                  <MessageCircle className="h-5 w-5 text-green-300" />
                </div>
                <div>
                  <p className="text-sm font-bold">Booking update</p>
                  <p className="text-xs text-white/60">Delivered through WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SocialProofSection({ stats }: { stats: LandingStats }) {
  const items = [
    { value: stats.restaurants, label: "Active restaurants", icon: ChefHat },
    { value: stats.reservations, label: "Reservations recorded", icon: CalendarCheck },
    { value: stats.diners, label: "Registered diners", icon: Users },
    { value: stats.cities, label: "Cities represented", icon: MapPin },
  ];

  return (
    <section className="border-b border-black/5 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Live platform data</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#29170f]">Growing across Cameroon</h2>
          </div>
          <p className="text-sm text-muted-foreground">These values come from the ChopWise database.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="rounded-2xl border border-black/5 bg-[#fffaf3] p-5 shadow-sm">
              <item.icon className="mb-3 h-5 w-5 text-orange-500" />
              <p className="text-3xl font-extrabold text-[#29170f]">{item.value.toLocaleString()}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        {stats.cityNames.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-[#29170f]">Currently listed:</span>
            {stats.cityNames.slice(0, 8).map((city) => (
              <Link
                key={city}
                href={`/explore?city=${encodeURIComponent(city)}`}
                className="rounded-full bg-orange-50 px-3 py-1.5 text-orange-700 hover:bg-orange-100"
              >
                {city}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function AIShowcaseSection() {
  return (
    <section className="bg-[#1b0f09] py-16 text-white lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">ChopWise AI concierge</p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold sm:text-5xl">
            Describe the moment. We narrow down the table.
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-white/70">
            Tell ChopWise your budget, city and occasion in ordinary language. Recommendations are limited to approved restaurants stored on the platform.
          </p>
          <div className="mt-7 flex flex-wrap gap-2 text-sm">
            {["5,000 FCFA", "Date night", "Douala", "Quiet ambience"].map((item) => (
              <span key={item} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white/80">
                {item}
              </span>
            ))}
          </div>
          <Link href="/dashboard/ai-recommend" className="mt-8 inline-flex items-center font-bold text-amber-300 hover:text-amber-200">
            Try the AI recommendation tool <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur sm:p-6">
          <div className="rounded-2xl bg-white p-5 text-[#29170f]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                <Search className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-600">Example request</p>
                <p className="mt-2 font-semibold">“I have 5,000 FCFA for a quiet date night in Douala.”</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {[
              { title: "Within budget", detail: "Matches affordable menu items", icon: WalletCards },
              { title: "Right atmosphere", detail: "Suitable for a calm date", icon: Heart },
              { title: "Correct location", detail: "Approved restaurants in Douala", icon: MapPin },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
                <item.icon className="h-5 w-5 text-amber-300" />
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-white/60">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: "Restaurant discovery",
      text: "Search by city, budget, amenities and restaurant name without opening many unrelated pages.",
    },
    {
      icon: WalletCards,
      title: "Budget-aware choices",
      text: "Prices are displayed in FCFA and the AI can consider a diner’s spending limit.",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp updates",
      text: "Restaurant owners and diners can receive reservation updates through a familiar channel.",
    },
  ];

  return (
    <section id="features" className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Why ChopWise</p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold text-[#29170f] sm:text-5xl">
            Built around how Cameroon actually books.
          </h2>
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {features.map((item) => (
            <div key={item.title} className="rounded-3xl border border-black/5 bg-[#fffaf3] p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
                <item.icon className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-[#29170f]">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    "The diner selects a restaurant, date, time and number of guests.",
    "The restaurant receives the request and accepts or declines it.",
    "The diner receives the status update and completes confirmation.",
  ];

  return (
    <section id="how-it-works" className="bg-[#fff7ed] py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="relative min-h-[430px] overflow-hidden rounded-[2rem]">
          <Image src={images.interior} alt="Warm restaurant interior" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <p className="absolute bottom-0 p-7 text-2xl font-extrabold text-white">
            From discovery to confirmation, without unnecessary calls.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">WhatsApp reservation flow</p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold text-[#29170f] sm:text-5xl">
            Three clear steps to a confirmed table.
          </h2>
          <div className="mt-7 space-y-4">
            {steps.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500 font-bold text-white">
                  {index + 1}
                </span>
                <p className="font-semibold leading-relaxed text-[#29170f]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ForRestaurantsSection() {
  return (
    <section id="for-restaurants" className="bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">For restaurant owners</p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold text-[#29170f] sm:text-5xl">
            Turn your menu and atmosphere into a digital storefront.
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Add real photographs, menu prices, opening hours, location and amenities. Receive organized booking requests instead of losing them inside calls and chats.
          </p>
          <ul className="mt-6 space-y-3 text-[#29170f]">
            {[
              "Publish restaurant and menu information",
              "Receive and manage reservation requests",
              "Use FCFA pricing and Cameroon phone numbers",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">✓</span>
                <span className="font-semibold">{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/sign-up?role=owner" className="mt-7 inline-flex items-center font-bold text-orange-600 hover:text-orange-500">
            Register your restaurant <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative min-h-72 overflow-hidden rounded-2xl sm:min-h-96">
            <Image src={images.burger} alt="Burger and chips" fill sizes="25vw" className="object-cover" />
          </div>
          <div className="relative mt-10 min-h-72 overflow-hidden rounded-2xl sm:min-h-96">
            <Image src={images.dessert} alt="Restaurant dessert" fill sizes="25vw" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const cards = [
    { src: images.pasta, title: "Comfort food" },
    { src: images.burger, title: "Casual favourites" },
    { src: images.dessert, title: "Sweet endings" },
  ];

  return (
    <section className="bg-[#1a0f09] py-16 text-white lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">A visual dining experience</p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold sm:text-5xl">Food should speak before the first bite.</h2>
          <p className="mt-4 text-white/60">
            Restaurant cards and profiles prioritize real food, interior and atmosphere photographs. Verified diner reviews can be displayed after the review module is activated.
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="group relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image src={card.src} alt={card.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <p className="absolute bottom-0 p-5 text-xl font-bold">{card.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="bg-gradient-to-r from-orange-600 to-amber-500 py-14 text-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">Your next meal starts here</p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Explore, reserve and receive confirmation.</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/explore" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1b0f09] px-7 font-bold text-white hover:bg-black">
            Explore restaurants
          </Link>
          <Link href="/sign-up?role=owner" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-7 font-bold text-white hover:bg-white hover:text-orange-700">
            List a restaurant
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+237 6XX XXX XXX";
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@chopwise.cm";
  const telHref = phone.replace(/[^+\d]/g, "");

  return (
    <footer className="bg-[#100a07] py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-extrabold">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
                <UtensilsCrossed className="h-5 w-5" />
              </span>
              Chop<span className="text-orange-400">Wise</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              AI-powered restaurant discovery and reservations designed for the Cameroonian dining market.
            </p>
          </div>

          <div>
            <p className="font-bold">Explore</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/60">
              <Link href="/explore" className="hover:text-white">Restaurants</Link>
              <Link href="/dashboard/ai-recommend" className="hover:text-white">AI recommendations</Link>
              <Link href="/sign-up?role=owner" className="hover:text-white">For restaurant owners</Link>
            </div>
          </div>

          <div>
            <p className="font-bold">Contact in Cameroon</p>
            <div className="mt-4 space-y-3 text-sm text-white/60">
              <a href={`tel:${telHref}`} className="flex items-center gap-2 hover:text-white">
                <Phone className="h-4 w-4 text-orange-400" /> {phone}
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4 text-orange-400" /> {email}
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-400" /> Cameroon
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} ChopWise. All rights reserved.</p>
          <p className="flex items-center gap-1.5">Made with <Heart className="h-3.5 w-3.5 fill-orange-500 text-orange-500" /> in Cameroon</p>
        </div>
      </div>
    </footer>
  );
}
