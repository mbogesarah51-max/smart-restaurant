"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  Float,
} from "./motion";
import {
  Search,
  CalendarCheck,
  Bot,
  Eye,
  Settings,
  MessageSquare,
  BarChart3,
  Star,
  MapPin,
  ChefHat,
  UtensilsCrossed,
  Users,
  ArrowRight,
  Sparkles,
  Clock,
  Heart,
  Send,
  Check,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Globe,
  Mail,
  Phone,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════════════ */
export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden">
      {/* Warm ambient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-brand-orange/[0.06] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-400/[0.05] rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-orange-200/[0.08] rounded-full blur-[80px]" />
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Copy */}
          <div className="max-w-xl">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-orange/20 bg-brand-orange/[0.06] mb-8">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                <span className="text-xs font-medium text-brand-orange tracking-wide uppercase">
                  AI-Powered Restaurant Discovery
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-[2.75rem] sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-extrabold font-heading leading-[1.08] tracking-tight text-brand-dark">
                Discover, Reserve
                <br />
                <span className="text-gradient">&amp; Dine</span> — All
                <br className="hidden sm:block" /> in One Place
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mt-6 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-md">
                Find the perfect restaurant for any occasion across Cameroon.
                Book instantly, get AI recommendations, and receive WhatsApp
                confirmations — effortlessly.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link href="/explore">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-semibold px-8 h-13 text-base rounded-xl shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/30 transition-all duration-300 w-full sm:w-auto"
                  >
                    Find a Restaurant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/sign-up?role=owner">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-brand-dark/10 hover:border-brand-orange/30 hover:bg-brand-orange/5 h-13 text-base rounded-xl w-full sm:w-auto text-foreground"
                  >
                    List Your Restaurant
                  </Button>
                </Link>
              </div>
            </FadeIn>

            {/* Trust badges */}
            <FadeIn delay={0.4}>
              <div className="flex items-center gap-6 mt-12">
                <div className="flex -space-x-2">
                  {["bg-brand-orange", "bg-emerald-500", "bg-blue-500", "bg-violet-500"].map(
                    (bg, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full ${bg} border-2 border-white flex items-center justify-center shadow-sm`}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {["MN", "ET", "AK", "SD"][i]}
                        </span>
                      </div>
                    )
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Trusted by 10,000+ diners
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right — App Mockup */}
          <FadeIn delay={0.3} direction="left" className="hidden lg:block">
            <div className="relative">
              {/* Soft glow behind phone */}
              <div className="absolute inset-0 bg-brand-orange/[0.08] rounded-full blur-[80px] scale-75" />

              <Float duration={8} distance={12}>
                {/* Phone Frame */}
                <div className="relative mx-auto w-[280px] rounded-[2.5rem] border-[3px] border-black/[0.08] bg-white shadow-2xl shadow-black/10 overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-7 pt-3 pb-2">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      9:41
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-muted-foreground" />
                      <div className="w-5 h-2.5 rounded-sm border border-muted-foreground/50 relative">
                        <div className="absolute inset-[1.5px] right-[3px] bg-brand-green rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="bg-gradient-to-br from-brand-orange to-amber-500 px-5 pb-6 pt-2">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-white/70 text-[11px]">Good evening</p>
                        <p className="text-white font-semibold text-sm">
                          Marie N.
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">MN</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                      <Search className="w-4 h-4 text-white/70" />
                      <span className="text-[13px] text-white/60">
                        Search restaurants...
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-4 py-5 space-y-4 bg-brand-surface">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-brand-dark">
                        Near You
                      </span>
                      <span className="text-xs text-brand-orange font-medium">
                        See all
                      </span>
                    </div>

                    {[
                      {
                        name: "Le Boukarou",
                        cuisine: "Local & Continental",
                        price: "5,000 FCFA",
                        rating: "4.8",
                      },
                      {
                        name: "Chez Wou",
                        cuisine: "Asian Fusion",
                        price: "8,000 FCFA",
                        rating: "4.6",
                      },
                      {
                        name: "La Terrasse",
                        cuisine: "French Bistro",
                        price: "12,000 FCFA",
                        rating: "4.9",
                      },
                    ].map((r, i) => (
                      <motion.div
                        key={r.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.15 }}
                        className="flex gap-3 p-3 rounded-2xl bg-white border border-black/[0.04] shadow-sm"
                      >
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center flex-shrink-0">
                          <ChefHat className="w-5 h-5 text-brand-orange" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-brand-dark truncate">
                            {r.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {r.cuisine}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[11px] text-brand-orange font-medium">
                              {r.price}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              {r.rating}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bottom nav */}
                  <div className="flex items-center justify-around py-3 border-t border-black/[0.06] bg-white">
                    {[
                      { icon: Search, label: "Explore", active: true },
                      { icon: Heart, label: "Saved", active: false },
                      { icon: CalendarCheck, label: "Bookings", active: false },
                      { icon: Users, label: "Profile", active: false },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col items-center gap-0.5">
                        <item.icon
                          className={`w-4 h-4 ${
                            item.active ? "text-brand-orange" : "text-muted-foreground/50"
                          }`}
                        />
                        <span
                          className={`text-[9px] ${
                            item.active
                              ? "text-brand-orange font-medium"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Float>

              {/* Floating notification cards */}
              <Float duration={7} distance={10} delay={1}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute -right-6 top-28 bg-white border border-black/[0.06] rounded-2xl p-3.5 shadow-xl shadow-black/[0.08] flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-dark">
                      Reservation Confirmed!
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Table for 2 • Tonight 7:30 PM
                    </p>
                  </div>
                </motion.div>
              </Float>

              <Float duration={9} distance={8} delay={2}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="absolute -left-10 bottom-44 bg-white border border-black/[0.06] rounded-2xl p-3.5 shadow-xl shadow-black/[0.08] flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-dark">
                      AI Found 3 Matches
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Within your 5,000 FCFA budget
                    </p>
                  </div>
                </motion.div>
              </Float>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SOCIAL PROOF BAR
   ═══════════════════════════════════════════════════════════════════ */
export function SocialProofSection() {
  const stats = [
    { target: 500, suffix: "+", label: "Restaurants", icon: ChefHat },
    { target: 10000, suffix: "+", label: "Reservations Made", icon: CalendarCheck },
    { target: 4, suffix: ".8★", label: "Average Rating", icon: Star },
    { target: 15, suffix: "+", label: "Cities Covered", icon: MapPin },
  ];

  return (
    <section className="relative py-16 lg:py-20 border-y border-black/[0.04] bg-brand-cream/50">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <StaggerItem key={stat.label} className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-orange/[0.08] mb-4 group-hover:bg-brand-orange/[0.12] transition-colors">
                <stat.icon className="w-5 h-5 text-brand-orange" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-brand-dark font-heading">
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FEATURES SECTION
   ═══════════════════════════════════════════════════════════════════ */
export function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: "Smart Discovery",
      description:
        "Browse restaurants by location, cuisine, budget, and ambience. See them on an interactive map — find hidden gems right around the corner.",
      gradient: "from-blue-50 to-sky-50",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      borderHover: "hover:border-blue-200",
    },
    {
      icon: CalendarCheck,
      title: "Instant Reservations",
      description:
        "Book your table in seconds. Restaurants get notified instantly via WhatsApp and confirm in real-time. No calls, no waiting — just show up and eat.",
      gradient: "from-orange-50 to-amber-50",
      iconBg: "bg-orange-50",
      iconColor: "text-brand-orange",
      borderHover: "hover:border-orange-200",
    },
    {
      icon: Bot,
      title: "AI Recommendations",
      description:
        'Tell us your budget, mood, or occasion — "I have 5,000 FCFA for a date night" — and our AI finds the perfect restaurant with matching menus.',
      gradient: "from-violet-50 to-purple-50",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      borderHover: "hover:border-violet-200",
    },
  ];

  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/[0.06] bg-black/[0.02] mb-6">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-brand-dark">
            Why Choose{" "}
            <span className="text-gradient">ChopWise</span>?
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Everything you need to discover great food and book your table —
            built for the Cameroonian dining experience.
          </p>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div
                className={`group relative h-full rounded-3xl border border-black/[0.06] ${feature.borderHover} bg-white p-8 lg:p-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.04]`}
              >
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6`}
                  >
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-brand-dark mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════════ */
export function HowItWorksSection() {
  const dinerSteps = [
    {
      icon: Search,
      title: "Browse & Discover",
      description:
        "Explore restaurants by location, cuisine, price range, or let our AI recommend the perfect spot for your occasion.",
    },
    {
      icon: CalendarCheck,
      title: "Reserve Instantly",
      description:
        "Pick your date, time, and guests. The restaurant gets a WhatsApp notification and confirms within minutes.",
    },
    {
      icon: Heart,
      title: "Show Up & Enjoy",
      description:
        "Your table is ready when you arrive. Rate your experience and save your favorites for next time.",
    },
  ];

  const ownerSteps = [
    {
      icon: Settings,
      title: "Create Your Profile",
      description:
        "Add your menu, photos, location, and availability. Our AI crafts a compelling description for your listing.",
    },
    {
      icon: MessageSquare,
      title: "Receive Bookings",
      description:
        "Get instant WhatsApp notifications for new reservations. Accept or decline in one tap — no app needed.",
    },
    {
      icon: BarChart3,
      title: "Grow Your Business",
      description:
        "Track bookings, analyze peak hours, and reach thousands of new diners actively searching for restaurants.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 lg:py-32 relative overflow-hidden bg-brand-cream/40"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/[0.06] bg-white/80 mb-6">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              How It Works
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-brand-dark">
            Three Steps to{" "}
            <span className="text-gradient">Great Dining</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Whether you&apos;re booking a table or listing your restaurant, getting started is effortless.
          </p>
        </FadeIn>

        <Tabs defaultValue="diners" className="max-w-5xl mx-auto">
          <div className="flex justify-center mb-14">
            <TabsList className="bg-white border border-black/[0.06] rounded-2xl p-1.5 h-auto shadow-sm">
              <TabsTrigger
                value="diners"
                className="rounded-xl px-6 py-2.5 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-brand-orange/20 transition-all duration-300"
              >
                For Diners
              </TabsTrigger>
              <TabsTrigger
                value="owners"
                className="rounded-xl px-6 py-2.5 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-brand-orange/20 transition-all duration-300"
              >
                For Restaurants
              </TabsTrigger>
            </TabsList>
          </div>

          {[
            { value: "diners", steps: dinerSteps },
            { value: "owners", steps: ownerSteps },
          ].map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <StaggerContainer className="grid md:grid-cols-3 gap-8 lg:gap-12">
                {tab.steps.map((step, i) => (
                  <StaggerItem key={step.title} className="relative">
                    {i < 2 && (
                      <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px">
                        <div className="w-full h-full bg-gradient-to-r from-brand-orange/30 via-brand-orange/10 to-transparent" />
                      </div>
                    )}

                    <div className="text-center">
                      <div className="relative inline-flex mb-6">
                        <div className="w-24 h-24 rounded-3xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                          <step.icon className="w-10 h-10 text-brand-orange" />
                        </div>
                        <span className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 text-white text-sm font-bold flex items-center justify-center shadow-md shadow-brand-orange/25">
                          {i + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold font-heading text-brand-dark mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                        {step.description}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AI SHOWCASE
   ═══════════════════════════════════════════════════════════════════ */
export function AIShowcaseSection() {
  const suggestions = [
    {
      name: "La Terrasse du Lac",
      desc: "Lakeside dining, candlelit ambience",
      price: "4,500 FCFA",
      match: "98%",
    },
    {
      name: "Le Jardin Secret",
      desc: "Garden setting, live jazz on Fridays",
      price: "4,800 FCFA",
      match: "95%",
    },
    {
      name: "Chez Marie-Claire",
      desc: "Rooftop views, authentic local cuisine",
      price: "3,500 FCFA",
      match: "91%",
    },
  ];

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Chat Mockup */}
          <FadeIn direction="right">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-orange/[0.06] rounded-full blur-[60px] scale-75" />
              <div className="relative rounded-3xl border border-black/[0.06] bg-white overflow-hidden shadow-2xl shadow-black/[0.06]">
                {/* Chat header */}
                <div className="flex items-center gap-3 p-5 border-b border-black/[0.06] bg-brand-surface">
                  <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-brand-dark">
                      ChopWise AI
                    </p>
                    <p className="text-xs text-brand-green flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                      Online — ready to help
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-brand-orange/30" />
                </div>

                {/* Messages */}
                <div className="p-5 space-y-4 min-h-[420px] bg-brand-surface/50">
                  {/* User message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 text-sm bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-md shadow-brand-orange/15">
                      I have 5,000 FCFA for a date night in Douala. Something romantic?
                    </div>
                  </motion.div>

                  {/* AI response */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    viewport={{ once: true }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm bg-white border border-black/[0.06] text-brand-dark shadow-sm">
                      <span className="text-brand-orange font-medium">
                        Perfect!
                      </span>{" "}
                      I found 3 romantic restaurants in Douala that match your
                      budget. Here are my top picks:
                    </div>
                  </motion.div>

                  {/* Restaurant suggestions */}
                  <div className="space-y-2.5 pl-2">
                    {suggestions.map((s, i) => (
                      <motion.div
                        key={s.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.15 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-black/[0.06] hover:border-brand-orange/20 hover:shadow-md transition-all duration-300 cursor-pointer group shadow-sm"
                      >
                        <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
                          <MapPin className="w-4 h-4 text-brand-orange" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-brand-dark">
                            {s.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.desc}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-brand-orange">
                            {s.match}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {s.price}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Input bar */}
                <div className="p-4 border-t border-black/[0.06] bg-white">
                  <div className="flex items-center gap-3 bg-brand-surface border border-black/[0.06] rounded-2xl px-4 py-3">
                    <span className="text-sm text-muted-foreground flex-1">
                      Ask about restaurants, menus, or budgets...
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 flex items-center justify-center shadow-md shadow-brand-orange/20">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Copy */}
          <div>
            <FadeIn delay={0.2}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-orange/20 bg-brand-orange/[0.06] mb-6">
                <Bot className="w-3.5 h-3.5 text-brand-orange" />
                <span className="text-xs font-medium text-brand-orange uppercase tracking-wider">
                  AI-Powered
                </span>
              </div>
            </FadeIn>
            <FadeIn delay={0.3}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading leading-tight tracking-tight text-brand-dark">
                Your Personal
                <br />
                <span className="text-gradient">Restaurant Concierge</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Tell ChopWise your budget, mood, or occasion and our AI
                instantly recommends restaurants with matching menus, ambience,
                and availability. It&apos;s like having a local food expert in
                your pocket.
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="mt-8 space-y-4">
                {[
                  {
                    icon: Clock,
                    title: "Budget-Aware Suggestions",
                    desc: "Recommends meals and restaurants within your exact budget",
                  },
                  {
                    icon: Heart,
                    title: "Mood & Occasion Matching",
                    desc: "Date night, business lunch, family gathering — AI adapts",
                  },
                  {
                    icon: Users,
                    title: "Group Optimization",
                    desc: "Finds spots that accommodate your party size perfectly",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-dark">
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="mt-10">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-semibold px-8 rounded-xl shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/30 transition-all duration-300"
                  >
                    Try AI Recommendations
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FOR RESTAURANTS
   ═══════════════════════════════════════════════════════════════════ */
export function ForRestaurantsSection() {
  const benefits = [
    {
      icon: Eye,
      title: "Massive Visibility",
      description:
        "Get discovered by thousands of diners actively searching for restaurants across Cameroon. Stand out with a premium listing.",
    },
    {
      icon: CalendarCheck,
      title: "Effortless Bookings",
      description:
        "Receive and manage reservations without any complex software. Accept or decline bookings in seconds.",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Alerts",
      description:
        "Instant WhatsApp notifications for every new booking. No app downloads required — manage from your phone.",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description:
        "Understand your peak hours, popular dishes, and customer trends with an intuitive analytics dashboard.",
    },
  ];

  return (
    <section
      id="for-restaurants"
      className="py-24 lg:py-32 relative overflow-hidden bg-brand-cream/40"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/[0.06] bg-white/80 mb-6">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              For Restaurant Owners
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-brand-dark">
            Grow Your{" "}
            <span className="text-gradient">Restaurant Business</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Join ChopWise and reach thousands of new diners. Free to sign up,
            easy to manage, powerful for growth.
          </p>
        </FadeIn>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <StaggerItem key={benefit.title}>
              <div className="group h-full rounded-3xl border border-black/[0.06] hover:border-brand-orange/20 bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.04] text-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5 group-hover:bg-orange-100 transition-colors">
                  <benefit.icon className="w-7 h-7 text-brand-orange" />
                </div>
                <h3 className="text-lg font-bold font-heading text-brand-dark mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.4} className="text-center mt-14">
          <Link href="/sign-up?role=owner">
            <Button
              size="lg"
              className="bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-semibold px-10 h-13 text-base rounded-xl shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/30 transition-all duration-300"
            >
              Register Your Restaurant — It&apos;s Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════════════════ */
export function PricingSection() {
  const plans = [
    {
      name: "Diner",
      price: "Free",
      period: "forever",
      description: "For food lovers who want to discover and book restaurants.",
      features: [
        "Browse all restaurants",
        "Instant reservations",
        "AI recommendations",
        "WhatsApp confirmations",
        "Save favorites",
      ],
      cta: "Start Dining",
      href: "/sign-up",
      popular: false,
    },
    {
      name: "Restaurant Basic",
      price: "Free",
      period: "to get started",
      description: "List your restaurant and start receiving bookings today.",
      features: [
        "Restaurant listing",
        "Up to 50 bookings/month",
        "WhatsApp notifications",
        "Basic analytics",
        "Menu management",
      ],
      cta: "List Your Restaurant",
      href: "/sign-up?role=owner",
      popular: true,
    },
    {
      name: "Restaurant Pro",
      price: "15,000",
      currency: "FCFA",
      period: "/month",
      description: "For busy restaurants that want to maximize growth.",
      features: [
        "Everything in Basic",
        "Unlimited bookings",
        "Advanced analytics",
        "Priority listing",
        "AI description generator",
        "Dedicated support",
      ],
      cta: "Go Pro",
      href: "/sign-up?role=owner",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/[0.06] bg-black/[0.02] mb-6">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Pricing
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-brand-dark">
            Simple,{" "}
            <span className="text-gradient">Transparent</span> Pricing
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Start free. No hidden fees. Only pay when you need more power.
          </p>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <StaggerItem key={plan.name}>
              <div
                className={`relative h-full rounded-3xl border p-8 transition-all duration-500 hover:-translate-y-1 ${
                  plan.popular
                    ? "border-brand-orange/30 bg-gradient-to-b from-orange-50/80 to-white shadow-xl shadow-brand-orange/[0.08]"
                    : "border-black/[0.06] bg-white hover:border-black/[0.1] hover:shadow-lg hover:shadow-black/[0.04]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-orange to-amber-500 text-white text-xs font-semibold shadow-md shadow-brand-orange/25">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold font-heading text-brand-dark">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    {plan.currency && (
                      <span className="text-sm text-muted-foreground">
                        {plan.currency}
                      </span>
                    )}
                    <span className="text-4xl font-extrabold font-heading text-brand-dark">
                      {plan.price}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-brand-orange flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className="block">
                  <Button
                    className={`w-full rounded-xl h-12 font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white shadow-md shadow-brand-orange/20 hover:shadow-brand-orange/30"
                        : "bg-brand-surface border border-black/[0.06] hover:bg-orange-50 text-brand-dark"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════════════════ */
export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Aminata Kengne",
      role: "Food Enthusiast, Douala",
      quote:
        "I used to spend 30 minutes calling restaurants to check availability. With ChopWise, I found a perfect spot for my anniversary dinner in under a minute. The AI recommendation was spot-on — my husband was impressed!",
      initials: "AK",
      color: "bg-violet-500",
    },
    {
      name: "Emmanuel Tchinda",
      role: "Owner, Le Boukarou Restaurant",
      quote:
        "Since listing on ChopWise, our bookings have increased by over 40%. The WhatsApp notifications are brilliant — I can accept reservations while cooking. It's changed how we run our business completely.",
      initials: "ET",
      color: "bg-brand-orange",
    },
    {
      name: "Sandrine Mbarga",
      role: "Event Planner, Yaoundé",
      quote:
        "I organize corporate dinners every week. ChopWise saves me hours of research and phone calls. The budget feature is genius — I just type the per-person budget and it shows me exactly where to go.",
      initials: "SM",
      color: "bg-emerald-500",
    },
    {
      name: "Jean-Paul Fotso",
      role: "Student, University of Douala",
      quote:
        "As a student, budget matters. ChopWise's AI told me exactly which restaurants serve a full meal for 1,500 FCFA. I've discovered places I never knew existed right next to campus.",
      initials: "JP",
      color: "bg-blue-500",
    },
    {
      name: "Cécile Atangana",
      role: "Owner, Chez Cécile Bistro",
      quote:
        "The analytics dashboard showed me that Saturdays at 7 PM are my busiest. Now I staff accordingly and never miss a booking. ChopWise pays for itself every single week.",
      initials: "CA",
      color: "bg-pink-500",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 3;

  const next = () =>
    setCurrentIndex((i) => (i + 1) % (testimonials.length - visibleCount + 1));
  const prev = () =>
    setCurrentIndex((i) =>
      i === 0 ? testimonials.length - visibleCount : i - 1
    );

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-brand-cream/40">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/[0.06] bg-white/80 mb-6">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Testimonials
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-brand-dark">
            Loved by{" "}
            <span className="text-gradient">Diners &amp; Owners</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Hear from people who are already transforming how they dine and do
            business.
          </p>
        </FadeIn>

        {/* Desktop grid / Mobile carousel */}
        <div className="relative">
          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.slice(currentIndex, currentIndex + visibleCount).map((t) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-3xl border border-black/[0.06] bg-white p-8 flex flex-col hover:border-black/[0.1] hover:shadow-lg hover:shadow-black/[0.04] transition-all duration-300"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed flex-1 text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-black/[0.06]">
                  <div
                    className={`w-11 h-11 rounded-xl ${t.color} flex items-center justify-center shadow-sm`}
                  >
                    <span className="text-xs font-bold text-white">
                      {t.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile single card */}
          <div className="md:hidden">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-black/[0.06] bg-white p-7 shadow-sm"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                &ldquo;{testimonials[currentIndex].quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${testimonials[currentIndex].color} flex items-center justify-center`}
                >
                  <span className="text-xs font-bold text-white">
                    {testimonials[currentIndex].initials}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-dark">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-xl border border-black/[0.06] bg-white hover:bg-brand-surface flex items-center justify-center transition-all shadow-sm"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(Math.min(i, testimonials.length - visibleCount))}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i >= currentIndex && i < currentIndex + visibleCount
                      ? "w-6 bg-brand-orange"
                      : "w-1.5 bg-black/10"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-xl border border-black/[0.06] bg-white hover:bg-brand-surface flex items-center justify-center transition-all shadow-sm"
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════════════════════════════════ */
export function CTASection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Warm glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-orange/[0.06] rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/30 to-transparent" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-orange-50 mb-8">
            <ChefHat className="w-8 h-8 text-brand-orange" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading leading-tight tracking-tight text-brand-dark">
            Ready to Transform
            <br />
            Your{" "}
            <span className="text-gradient">Dining Experience</span>?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join thousands of diners and restaurant owners already using
            ChopWise across Cameroon. Start for free — no credit card needed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link href="/explore">
              <Button
                size="lg"
                className="bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-semibold px-10 h-13 text-base rounded-xl shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/30 transition-all duration-300 w-full sm:w-auto"
              >
                Explore Restaurants
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sign-up?role=owner">
              <Button
                size="lg"
                variant="outline"
                className="border-brand-orange/30 text-brand-orange hover:bg-brand-orange/5 h-13 text-base rounded-xl w-full sm:w-auto"
              >
                Register Your Restaurant
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════ */
export function Footer() {
  return (
    <footer className="relative border-t border-black/[0.06] bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-5">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center shadow-md shadow-brand-orange/15">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-heading text-brand-dark">
                Chop<span className="text-brand-orange">Wise</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              AI-powered restaurant discovery and reservation platform.
              Connecting diners with the best restaurants across Cameroon.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Globe, label: "Website" },
                { icon: Mail, label: "Email" },
                { icon: Phone, label: "Phone" },
              ].map((social) => (
                <button
                  key={social.label}
                  className="w-9 h-9 rounded-xl border border-black/[0.06] bg-white hover:bg-orange-50 flex items-center justify-center transition-all duration-200 shadow-sm"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="text-sm font-semibold text-brand-dark mb-4">
              Platform
            </h4>
            <ul className="space-y-3">
              {["Features", "How It Works", "Pricing", "For Restaurants"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase().replace(/ /g, "-")}`}
                      className="text-sm text-muted-foreground hover:text-brand-dark transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="text-sm font-semibold text-brand-dark mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {["About Us", "Careers", "Privacy Policy", "Terms of Service"].map(
                (link) => (
                  <li key={link}>
                    <span className="text-sm text-muted-foreground hover:text-brand-dark transition-colors duration-200 cursor-pointer">
                      {link}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-4 lg:col-span-3">
            <h4 className="text-sm font-semibold text-brand-dark mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-orange/50" />
                hello@chopwise.cm
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-orange/50" />
                Douala, Cameroon
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/[0.06] mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ChopWise. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ in Cameroon
          </p>
        </div>
      </div>
    </footer>
  );
}
