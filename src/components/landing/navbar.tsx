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
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Restaurants", href: "#for-restaurants" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
          ? "bg-white/80 backdrop-blur-2xl border-b border-black/[0.06] shadow-[0_1px_20px_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center shadow-md shadow-brand-orange/20 group-hover:shadow-brand-orange/30 transition-shadow duration-300">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-heading text-brand-dark tracking-tight">
              Chop<span className="text-brand-orange">Wise</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-brand-orange group-hover:w-4/5 transition-all duration-300 rounded-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoaded && isSignedIn ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-semibold px-6 rounded-xl shadow-md shadow-brand-orange/20 hover:shadow-brand-orange/30 transition-all duration-300 gap-2">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hover:bg-black/[0.04] rounded-xl"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-semibold px-6 rounded-xl shadow-md shadow-brand-orange/20 hover:shadow-brand-orange/30 transition-all duration-300">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="lg:hidden inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors hover:bg-black/[0.04] h-10 w-10 text-foreground">
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 bg-white/95 backdrop-blur-2xl border-black/[0.06]"
            >
              <div className="flex flex-col gap-2 mt-12">
                <AnimatePresence>
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <a
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 text-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.03] rounded-xl transition-all duration-200"
                      >
                        {link.label}
                      </a>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="flex flex-col gap-3 mt-8 px-4">
                  {isLoaded && isSignedIn ? (
                    <Link href="/dashboard" onClick={() => setOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-semibold rounded-xl h-12 shadow-md shadow-brand-orange/20 gap-2">
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/sign-in" onClick={() => setOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full border-black/10 hover:bg-black/[0.03] rounded-xl h-12"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up" onClick={() => setOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-semibold rounded-xl h-12 shadow-md shadow-brand-orange/20">
                          Get Started
                        </Button>
                      </Link>
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
