"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, UtensilsCrossed, LayoutDashboard } from "lucide-react";

const navLinks = [
  { label: "Explore", href: "/explore" },
  { label: "Features", href: "/features" },
  { label: "AI Concierge", href: "/ai-concierge" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "For Restaurants", href: "/for-restaurants" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-black/[0.06] bg-white/90 shadow-[0_1px_24px_rgba(26,20,17,0.07)] backdrop-blur-2xl"
          : "bg-slate-950/80 backdrop-blur-xl"
      }`}
    >
      <div
        className="absolute bottom-0 left-0 h-[2px] origin-left bg-gradient-to-r from-brand-orange via-amber-500 to-brand-orange transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%`, opacity: scrolled ? 1 : 0 }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="sheen flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 shadow-[0_4px_14px_-2px_rgba(249,115,22,0.4)] transition-all duration-300 group-hover:scale-105">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className={`font-heading text-xl font-bold tracking-tight ${scrolled ? "text-brand-dark" : "text-white"}`}>
              Chop<span className="text-brand-orange">Wise</span>
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 xl:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    scrolled
                      ? active
                        ? "bg-orange-50 text-orange-700"
                        : "text-muted-foreground hover:text-foreground"
                      : active
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-brand-orange transition-all duration-300 ${active ? "w-4/5" : "w-0 group-hover:w-4/5"}`} />
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {isLoaded && isSignedIn ? (
              <Link href="/dashboard">
                <Button className="gap-2 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 px-6 font-semibold text-white">
                  <LayoutDashboard className="size-4" /> Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className={scrolled ? "text-muted-foreground" : "text-white hover:bg-white/10 hover:text-white"}>Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 px-6 font-semibold text-white">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className={`inline-flex h-10 w-10 items-center justify-center rounded-xl lg:hidden ${scrolled ? "text-foreground" : "text-white"}`} aria-label="Open navigation menu">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-black/[0.06] bg-white/95 backdrop-blur-2xl">
              <div className="mt-12 flex flex-col gap-2">
                <AnimatePresence>
                  {navLinks.map((link, index) => (
                    <motion.div key={link.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }}>
                      <Link href={link.href} onClick={() => setOpen(false)} className={`block rounded-xl px-4 py-3 text-lg ${pathname === link.href ? "bg-orange-50 font-bold text-orange-700" : "text-muted-foreground hover:bg-black/[0.03] hover:text-foreground"}`}>
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="mt-8 flex flex-col gap-3 px-4">
                  {isLoaded && isSignedIn ? (
                    <Link href="/dashboard" onClick={() => setOpen(false)}><Button className="h-12 w-full gap-2 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 font-semibold text-white"><LayoutDashboard className="size-4" />Dashboard</Button></Link>
                  ) : (
                    <>
                      <Link href="/sign-in" onClick={() => setOpen(false)}><Button variant="outline" className="h-12 w-full rounded-xl">Sign In</Button></Link>
                      <Link href="/sign-up" onClick={() => setOpen(false)}><Button className="h-12 w-full rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 font-semibold text-white">Get Started</Button></Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
