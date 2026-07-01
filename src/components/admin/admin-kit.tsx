"use client";

/**
 * Shared premium building blocks for the admin area:
 * page headers, KPI cards, section cards, filter tabs, status pills,
 * a destructive confirm dialog, and dependency-free charts
 * (sparkline, bar-trend, donut, horizontal bars).
 */

import { useId, type ReactNode } from "react";
import Link from "next/link";
import { Loader2, Trash2, Search, type LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Accents ────────────────────────────────────────────────────────────────

export type Accent = "orange" | "emerald" | "blue" | "violet" | "amber" | "rose";

const ACCENTS: Record<Accent, { chip: string; stroke: string; fill: string; bar: string }> = {
  orange: { chip: "from-brand-orange to-amber-500", stroke: "#F97316", fill: "#FDBA74", bar: "from-orange-400 to-amber-500" },
  emerald: { chip: "from-emerald-500 to-teal-500", stroke: "#10B981", fill: "#6EE7B7", bar: "from-emerald-400 to-teal-500" },
  blue: { chip: "from-blue-500 to-indigo-500", stroke: "#3B82F6", fill: "#93C5FD", bar: "from-blue-400 to-indigo-500" },
  violet: { chip: "from-violet-500 to-purple-500", stroke: "#8B5CF6", fill: "#C4B5FD", bar: "from-violet-400 to-purple-500" },
  amber: { chip: "from-amber-500 to-orange-500", stroke: "#F59E0B", fill: "#FCD34D", bar: "from-amber-400 to-orange-500" },
  rose: { chip: "from-rose-500 to-pink-500", stroke: "#F43F5E", fill: "#FDA4AF", bar: "from-rose-400 to-pink-500" },
};

// ─── Page header ──────────────────────────────────────────────────────────────

export function AdminPageHeader({ title, subtitle, icon: Icon, actions }: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 text-white shadow-[0_6px_18px_-4px_rgba(249,115,22,0.5)]">
            <Icon className="size-5" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-brand-dark">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── KPI card ────────────────────────────────────────────────────────────────

export function KpiCard({ label, value, icon: Icon, accent = "orange", sub, spark, href, onClick, highlight }: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: Accent;
  sub?: string;
  spark?: number[];
  href?: string;
  onClick?: () => void;
  highlight?: boolean;
}) {
  const a = ACCENTS[accent];
  const cls = cn(
    "card-premium block w-full p-5 text-left transition-all duration-300",
    (href || onClick) && "cursor-pointer hover:shadow-lift hover:-translate-y-0.5",
    highlight && "ring-1 ring-amber-300/60 bg-gradient-to-br from-amber-50/60 to-white"
  );
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-bold font-heading tabular-nums text-brand-dark">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground truncate">{sub}</p>}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm", a.chip)}>
          <Icon className="size-5" />
        </div>
      </div>
      {spark && spark.length > 1 && (
        <div className="mt-3 h-8">
          <Sparkline data={spark} stroke={a.stroke} fill={a.fill} />
        </div>
      )}
    </>
  );

  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

// ─── Section card ────────────────────────────────────────────────────────────

export function SectionCard({ title, description, action, children, className, bodyClassName }: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={cn("card-premium overflow-hidden", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.05] px-5 py-4">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold font-heading text-brand-dark">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn(bodyClassName ?? "p-5")}>{children}</div>
    </div>
  );
}

// ─── Filter tabs ─────────────────────────────────────────────────────────────

export function FilterTabs<T extends string>({ tabs, value, onChange }: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1">
      {tabs.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer",
              active
                ? "bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-[0_2px_10px_-2px_rgba(249,115,22,0.5)]"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={cn("rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums", active ? "bg-white/25 text-white" : "bg-brand-orange/10 text-brand-orange")}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Search box ──────────────────────────────────────────────────────────────

export function SearchBox({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 h-10 rounded-xl bg-white/70"
      />
    </div>
  );
}

// ─── Status pills ────────────────────────────────────────────────────────────

const RES_STATUS: Record<string, { label: string; cls: string }> = {
  AWAITING_RESPONSE: { label: "Awaiting", cls: "bg-amber-100 text-amber-700" },
  ACCEPTED: { label: "Accepted", cls: "bg-teal-100 text-teal-700" },
  PAYMENT_PENDING: { label: "Payment", cls: "bg-blue-100 text-blue-700" },
  CONFIRMED: { label: "Confirmed", cls: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelled", cls: "bg-rose-100 text-rose-600" },
  REJECTED: { label: "Rejected", cls: "bg-rose-100 text-rose-600" },
  PENDING: { label: "Pending", cls: "bg-muted text-muted-foreground" },
};

export function ReservationStatusPill({ status }: { status: string }) {
  const s = RES_STATUS[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", s.cls)}>
      {s.label}
    </span>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 mb-3">
        <Icon className="size-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

// ─── Destructive confirm dialog ──────────────────────────────────────────────

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Delete", loading, onConfirm, icon: Icon = Trash2 }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  icon?: LucideIcon;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Icon className="size-5" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-1 leading-relaxed">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="lg" />}>Cancel</DialogClose>
          <Button
            size="lg"
            variant="ghost"
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-white hover:bg-destructive/90 hover:text-white shadow-[0_2px_10px_-2px_rgba(220,38,38,0.5)]"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Deleting…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Charts (dependency-free) ────────────────────────────────────────────────

export function Sparkline({ data, stroke = "#F97316", fill = "#FDBA74", className }: {
  data: number[];
  stroke?: string;
  fill?: string;
  className?: string;
}) {
  const id = useId();
  if (data.length < 2) return null;
  const w = 100, h = 32;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 4) - 2,
  ]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("w-full h-full", className)} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.4" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function tickLabels(labels: string[], count = 5): string[] {
  if (labels.length <= count) return labels;
  const step = (labels.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => labels[Math.round(i * step)]);
}

export function BarTrend({ data, accent = "orange", height = 200, valueSuffix = "" }: {
  data: { label: string; value: number }[];
  accent?: Accent;
  height?: number;
  valueSuffix?: string;
}) {
  const a = ACCENTS[accent];
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="group/bar relative flex h-full flex-1 items-end">
            <div
              className={cn("w-full rounded-t-[3px] bg-gradient-to-t transition-[filter] duration-200 group-hover/bar:brightness-110", a.bar)}
              style={{ height: `${d.value > 0 ? Math.max((d.value / max) * 100, 3) : 0}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-brand-dark px-2 py-1 text-[10px] font-medium text-white shadow-lg group-hover/bar:block">
              {d.label} · <span className="tabular-nums">{d.value.toLocaleString()}{valueSuffix}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground tabular-nums">
        {tickLabels(data.map((d) => d.label)).map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}

export function Donut({ segments, size = 150, thickness = 18, centerLabel, centerSub }: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string | number;
  centerSub?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness} className="stroke-black/[0.05]" />
        {total > 0 &&
          segments.map((s, i) => {
            const len = (s.value / total) * circ;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums text-brand-dark font-heading">
          {centerLabel !== undefined ? centerLabel : total.toLocaleString()}
        </span>
        {centerSub && <span className="text-[10px] text-muted-foreground">{centerSub}</span>}
      </div>
    </div>
  );
}

export function Legend({ items }: { items: { label: string; value: number; color: string }[] }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: it.color }} />
          <span className="flex-1 text-muted-foreground">{it.label}</span>
          <span className="font-semibold tabular-nums text-brand-dark">{it.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function HBars({ items, accent = "orange", formatter }: {
  items: { label: string; sub?: string; value: number }[];
  accent?: Accent;
  formatter?: (v: number) => string;
}) {
  const a = ACCENTS[accent];
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-3.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-28 shrink-0 min-w-0">
            <p className="truncate text-xs font-medium text-brand-dark">{it.label}</p>
            {it.sub && <p className="truncate text-[10px] text-muted-foreground">{it.sub}</p>}
          </div>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/[0.05]">
            <div className={cn("h-full rounded-full bg-gradient-to-r", a.bar)} style={{ width: `${(it.value / max) * 100}%` }} />
          </div>
          <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-brand-dark">
            {formatter ? formatter(it.value) : it.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export const CHART_COLORS = {
  confirmed: "#10B981",
  awaiting: "#F59E0B",
  payment: "#3B82F6",
  cancelled: "#F43F5E",
  neutral: "#A8A29E",
  client: "#3B82F6",
  owner: "#10B981",
  admin: "#8B5CF6",
};
