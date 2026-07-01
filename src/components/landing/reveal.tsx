"use client";

/**
 * Premium scroll-reveal + animation primitives, powered by GSAP + ScrollTrigger.
 *
 * Public API (unchanged): Reveal, Stagger, StaggerItem, Counter, Float.
 * Animations are React-safe via @gsap/react's useGSAP (auto-cleanup of tweens
 * and ScrollTriggers on unmount). All primitives respect prefers-reduced-motion.
 */

import {
  useRef,
  type ReactNode,
  type CSSProperties,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * ScrollTrigger computes each trigger's scroll position at creation time. In
 * this app the hero is `min-h-[100dvh]` with fonts + images that load after
 * hydration, so the first measurement is stale — triggers below the fold can
 * fail to fire until a reload reads a warm layout. We recompute positions once
 * fonts/images settle so reveals fire reliably on the FIRST load. Idempotent.
 */
let scrollHealthInit = false;
function ensureScrollHealth() {
  if (scrollHealthInit || typeof window === "undefined") return;
  scrollHealthInit = true;
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh);
  if (typeof document !== "undefined" && "fonts" in document) {
    document.fonts.ready.then(refresh).catch(() => {});
  }
  // After hydration + layout has settled (covers the case where `load`
  // already fired before React mounted these components).
  setTimeout(refresh, 400);
}

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 32 },
  down: { x: 0, y: -32 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

/* ── Reveal: fade/slide a single block into view on scroll ─────────── */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
  once = true,
  duration = 0.8,
}: {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
  once?: boolean;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return; // visible by default
      ensureScrollHealth();
      const { x, y } = OFFSET[direction];
      gsap.from(el, {
        opacity: 0,
        x,
        y,
        duration,
        delay,
        ease: "power3.out",
        clearProps: "opacity,transform",
        overwrite: "auto",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: once ? "play none none none" : "play none none reverse",
        },
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ── Stagger: orchestrate children entering in sequence ───────────── */
export function Stagger({
  children,
  className = "",
  step = 0.09,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  step?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const items = el.querySelectorAll<HTMLElement>("[data-stagger-item]");
      if (!items.length || prefersReducedMotion()) return; // visible by default
      ensureScrollHealth();
      gsap.from(items, {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: "power3.out",
        stagger: step,
        clearProps: "opacity,transform",
        overwrite: "auto",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: once ? "play none none none" : "play none none reverse",
        },
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  /** Accepted for API compatibility; ordering is handled automatically. */
  index?: number;
}) {
  return (
    <div data-stagger-item className={className}>
      {children}
    </div>
  );
}
StaggerItem.__isStaggerItem = true;

/* ── Counter: animated number count-up on scroll ──────────────────── */
export function Counter({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
  className = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const render = (v: number) => {
        el.textContent = `${prefix}${Math.floor(v).toLocaleString()}${suffix}`;
      };
      if (prefersReducedMotion()) {
        render(target);
        return;
      }
      ensureScrollHealth();
      const counter = { value: 0 };
      render(0);
      gsap.to(counter, {
        value: target,
        duration: duration / 1000,
        ease: "power2.out",
        onUpdate: () => render(counter.value),
        scrollTrigger: { trigger: el, start: "top 95%", once: true },
      });
    },
    { scope: ref, dependencies: [target, prefix, suffix, duration] }
  );

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {(0).toLocaleString()}
      {suffix}
    </span>
  );
}

/* ── Float: gentle perpetual floating motion ──────────────────────── */
export function Float({
  children,
  className = "",
  distance = 14,
  duration = 7,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap.to(el, {
        y: -distance,
        duration,
        delay,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: ref, dependencies: [distance, duration, delay] }
  );

  const style: CSSProperties = { willChange: "transform" };
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
