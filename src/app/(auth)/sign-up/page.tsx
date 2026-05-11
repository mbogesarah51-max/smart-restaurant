"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Store,
  ArrowRight,
  Sparkles,
  CalendarCheck,
  BarChart3,
  Bot,
  MessageSquare,
} from "lucide-react";

const roles = [
  {
    id: "diner",
    title: "I'm a Diner",
    subtitle: "Find & reserve restaurants",
    icon: UtensilsCrossed,
    href: "/sign-up/diner",
    color: "from-brand-orange to-amber-500",
    lightBg: "bg-orange-50",
    borderActive: "border-brand-orange",
    perks: [
      { icon: Bot, text: "AI-powered recommendations" },
      { icon: CalendarCheck, text: "Instant table reservations" },
      { icon: Sparkles, text: "Personalized dining experience" },
    ],
  },
  {
    id: "owner",
    title: "I'm a Restaurant Owner",
    subtitle: "List & manage your restaurant",
    icon: Store,
    href: "/sign-up/owner",
    color: "from-emerald-500 to-teal-500",
    lightBg: "bg-emerald-50",
    borderActive: "border-emerald-500",
    perks: [
      { icon: BarChart3, text: "Analytics & booking dashboard" },
      { icon: MessageSquare, text: "WhatsApp booking alerts" },
      { icon: Sparkles, text: "AI-generated descriptions" },
    ],
  },
];

export default function SignUpRolePage() {
  return (
    <>
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center shadow-md shadow-brand-orange/15">
          <UtensilsCrossed className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold font-heading text-brand-dark">
          Chop<span className="text-brand-orange">Wise</span>
        </span>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold text-brand-dark">
            Join ChopWise
          </h1>
          <p className="text-muted-foreground">
            How would you like to use ChopWise?
          </p>
        </div>

        <div className="space-y-4">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Link href={role.href}>
                <div className="group relative rounded-2xl border-2 border-black/[0.06] bg-white p-6 transition-all duration-300 hover:border-brand-orange/30 hover:shadow-lg hover:shadow-black/[0.04] hover:-translate-y-0.5 cursor-pointer">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-2xl ${role.lightBg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}
                    >
                      <role.icon className="w-7 h-7 text-brand-dark/70" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold font-heading text-brand-dark">
                          {role.title}
                        </h3>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {role.subtitle}
                      </p>

                      {/* Perks */}
                      <div className="space-y-2">
                        {role.perks.map((perk) => (
                          <div
                            key={perk.text}
                            className="flex items-center gap-2.5"
                          >
                            <perk.icon className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              {perk.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground pt-2">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-brand-orange hover:text-brand-orange-hover font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
