# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # dev server (http://localhost:3000)
npm run build    # prisma generate + next build
npm run start    # production server
npm run lint     # eslint (flat config in eslint.config.mjs)

# Prisma (no migrations dir committed yet — schema is pushed directly)
npx prisma generate              # regenerate client into src/generated/prisma (run after schema edits)
npx prisma db push               # sync schema to the Neon database
npx prisma studio                # inspect data
```

There is **no test runner configured** — no `test` script, no Jest/Vitest. Don't assume one exists.

All `npm` scripts prepend `NODE_OPTIONS='--dns-result-order=ipv4first'`. See "IPv4-first DNS" below — this is load-bearing, not cosmetic.

## ChopWise — what it is

A restaurant reservation + AI-recommendation platform for Cameroon (currency XAF/FCFA, phone defaults to +237). Three roles — `CLIENT` (diner), `RESTAURANT_OWNER`, `ADMIN` — each with a distinct dashboard. Owners onboard restaurants (admin-approved before going public); diners discover and book; bookings move through a payment-gated state machine with WhatsApp notifications at every step.

`docs/SRS_ChopWise.md` is the spec. `docs/PROJECT_STATUS.md` is a handoff doc but is **partially stale** (e.g. it lists WhatsApp notifications and availability validation as "not built" — both are now implemented). Trust the code over that doc.

## Critical conventions (break these and things silently fail)

- **Middleware lives in `src/proxy.ts`, not `middleware.ts`.** This Next.js version renamed the convention (see `AGENTS.md` — read `node_modules/next/dist/docs/` before touching framework-level files). `proxy.ts` runs Clerk route protection; the `isPublicRoute` matcher there is the allowlist of unauthenticated routes.
- **Prisma client is generated to `src/generated/prisma`** (custom `output` in `schema.prisma`), so import types/client from `@/generated/prisma/client` — **not** `@prisma/client`. The generated dir is gitignored; run `prisma generate` after any schema change (the build does this automatically).
- **DB access goes through the Neon serverless adapter** (`PrismaNeon` over WebSockets), not a plain TCP `DATABASE_URL`. Always import the singleton from `@/lib/prisma` (`import prisma from "@/lib/prisma"`) — never `new PrismaClient()`.
- **IPv4-first DNS** is forced in four places (`src/instrumentation.ts`, `src/lib/prisma.ts`, `src/app/actions/auth.ts`, and `NODE_OPTIONS` in package scripts). The deploy network can't route IPv6 to AWS/Cloudflare, so without this every Neon query and Clerk call hangs ~5s then times out. Do not remove these lines.

## Architecture

### Auth — hybrid Clerk + local DB

Auth is **not** vanilla Clerk. Each user exists in **both** the local `User` table (canonical record, with a bcrypt `passwordHash`) and Clerk (session provider), linked by `User.clerkId`.

- Sign-up/sign-in forms POST to `/api/auth/register` and `/api/auth/login`, which are thin wrappers around the server actions in `src/app/actions/auth.ts`.
- The server validates/creates the user locally, mirrors to Clerk, and returns a short-lived Clerk **sign-in ticket** in `ActionResponse.token`.
- The client then activates the session with `clerk.client.signIn.create({ strategy: "ticket", ticket })` + `clerk.setActive(...)`. See `src/app/(auth)/sign-in/page.tsx` and `sign-up/_components/register-form.tsx`.
- **Resolving the current user server-side:** `auth()` → `userId` (Clerk id) → `prisma.user.findUnique({ where: { clerkId } })`. Use the `getCurrentUser()` helper in `actions/auth.ts`. On the client, use `useCurrentUser()` from `src/context/user-context.tsx`, which fetches `/api/auth/me`.

### Data layer — server actions first

Mutations and most reads run through **server actions** in `src/app/actions/` (`auth`, `restaurant`, `menu`, `reservation`, `admin`, `ai`). Pages are mostly async Server Components that call actions directly. `src/app/api/` is reserved for things that genuinely need an HTTP endpoint: client-side `fetch` (`/api/auth/*`), external callbacks (`/api/payments/*`, `/api/cron/*`), and uploads (`/api/upload`). Prefer adding a server action over an API route.

Shared TS types (`SafeUser`, `RestaurantWithDetails`, `ReservationWithDetails`, `ActionResponse<T>`, AI types) live in `src/types/index.ts`. `SafeUser` is `User` minus `passwordHash` — strip the hash before returning any user object. Zod schemas for all forms are in `src/lib/validations.ts`.

### Reservation state machine — the core domain logic

Reservations move through `ReservationStatus`: `PENDING → AWAITING_RESPONSE → ACCEPTED → PAYMENT_PENDING → CONFIRMED`, with `REJECTED`/`CANCELLED` as terminal exits. (In practice `createReservation` opens directly at `AWAITING_RESPONSE`.)

- **Always gate transitions** through `canTransitionTo(from, to)` in `src/lib/reservation-status.ts` — `acceptReservation`/`rejectReservation`/`cancelConfirmedReservation` all check it. Don't write a raw `status` update that bypasses this.
- **Two deadlines** drive expiry: restaurants must respond within `RESPONSE_DEADLINE_MINUTES` (15), clients must pay within `PAYMENT_TIMEOUT_MINUTES` (30), both in `src/lib/config.ts`. Expired reservations are swept to `CANCELLED` (by `SYSTEM`) by the cron route `src/app/api/cron/check-expired-reservations/route.ts`, scheduled in `vercel.json` and protected by `CRON_SECRET`.
- Clients poll `useReservationPolling` (`src/hooks/`) every 30s for near-real-time status updates.

### Payments — simulated behind a swappable service

`src/lib/services/payment.ts` is a **placeholder** provider (`IS_PAYMENT_SIMULATED = true`, `PAYMENT_PROVIDER = "placeholder"` in `config.ts`). The full flow (accept → `PAYMENT_PENDING` → pay → `CONFIRMED`) works end-to-end via `confirmSimulatedPayment`. To wire a real provider (NotchPay/CinetPay/MoMo), implement `initializePayment`/`verifyPayment`, add a `/api/payments/webhook` handler, and flip the config flags — **the UI and state machine should not need to change.** Booking fee is `BOOKING_FEE` (500 XAF) in `config.ts`. See `docs/PAYMENT_INTEGRATION.md`.

### Notifications — fire-and-forget WhatsApp

`src/lib/services/whatsapp.ts` sends Twilio WhatsApp messages at every reservation lifecycle event. It **never throws** — missing Twilio creds just log one warning and skip. Always send via the `fireWhatsApp(...)` helper in `reservation.ts` (or the equivalent in `payment.ts`): don't `await` it in the critical path. Message bodies come from the `build*Message` template functions; deep links are built with `getAppUrl(path)` (needs `NEXT_PUBLIC_APP_URL`).

### AI

Both AI features use OpenAI `gpt-4o-mini`: `getAIRecommendations` (`actions/ai.ts`) feeds approved restaurants + menus as JSON and returns ranked picks — it **validates every returned `restaurantId` against the DB and drops hallucinated ones**; and `/api/ai/generate-description` generates restaurant/menu copy. Requires `OPENAI_API_KEY`.

### Routing & UI

App Router with route groups: `(auth)` (sign-in/up), `(main)` (authenticated dashboards), `(marketing)` (public landing/explore/restaurant pages). `/dashboard` redirects by role (`actions` → `getCurrentUser` → redirect owners/admins to their sub-dashboards). UI is shadcn/ui (`components/ui/`) on Tailwind v4 + `@base-ui/react`, Framer Motion for animation, Sonner for toasts, Leaflet for maps. Images upload to Cloudinary (`lib/cloudinary.ts`, `next.config.ts` allowlists `res.cloudinary.com`).

## Environment

Copy `.env.example` to `.env.local`. Required: `DATABASE_URL` (Neon), Clerk keys, Cloudinary keys, `OPENAI_API_KEY`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`. Optional: `TWILIO_*` (WhatsApp sends are skipped if absent).
