"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, UtensilsCrossed, LayoutDashboard } from "lucide-react";

const navLinks = [
  { label: "Explore", href: "/explore" },
  { label: "Featured", href: "#featured" },
  { label: "AI Concierge", href: "#ai" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Restaurants", href: "#for-restaurants" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-2xl border-b border-black/[0.06] shadow-[0_1px_24px_rgba(26,20,17,0.07)]"
          : "bg-black/20 backdrop-blur-sm"
      }`}
    >
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-brand-orange via-amber-500 to-brand-orange origin-left transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%`, opacity: scrolled ? 1 : 0 }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="sheen w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center shadow-[0_4px_14px_-2px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-all duration-300">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold font-heading tracking-tight ${scrolled ? "text-brand-dark" : "text-white"}`}>
              Chop<span className="text-brand-orange">Wise</span>
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm transition-colors duration-200 group ${
                  scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-brand-orange group-hover:w-4/5 transition-all duration-300 rounded-full" />
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {isLoaded && isSignedIn ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-brand-orange to-amber-500 text-white font-semibold px-6 rounded-xl gap-2">
                  <LayoutDashboard className="size-4" /> Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className={scrolled ? "text-muted-foreground" : "text-white hover:bg-white/10 hover:text-white"}>Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-gradient-to-r from-brand-orange to-amber-500 text-white font-semibold px-6 rounded-xl">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className={`lg:hidden inline-flex items-center justify-center rounded-xl h-10 w-10 ${scrolled ? "text-foreground" : "text-white"}`}>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white/95 backdrop-blur-2xl border-black/[0.06]">
              <div className="flex flex-col gap-2 mt-12">
                <AnimatePresence>
                  {navLinks.map((link, index) => (
                    <motion.div key={link.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }}>
                      <a href={link.href} onClick={() => setOpen(false)} className="block px-4 py-3 text-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.03] rounded-xl">
                        {link.label}
                      </a>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="flex flex-col gap-3 mt-8 px-4">
                  {isLoaded && isSignedIn ? (
                    <Link href="/dashboard" onClick={() => setOpen(false)}><Button className="w-full bg-gradient-to-r from-brand-orange to-amber-500 text-white font-semibold rounded-xl h-12 gap-2"><LayoutDashboard className="size-4" />Dashboard</Button></Link>
                  ) : (
                    <>
                      <Link href="/sign-in" onClick={() => setOpen(false)}><Button variant="outline" className="w-full rounded-xl h-12">Sign In</Button></Link>
                      <Link href="/sign-up" onClick={() => setOpen(false)}><Button className="w-full bg-gradient-to-r from-brand-orange to-amber-500 text-white font-semibold rounded-xl h-12">Get Started</Button></Link>
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
