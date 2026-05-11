# Chopwise - Project Status & Handoff Document

**Project:** Smart Restaurant Reservation & AI Recommendation Platform
**Date:** 2026-04-14
**Stack:** Next.js 16.2.1, React 19, TypeScript, Tailwind CSS 4, Prisma + Neon (PostgreSQL), Clerk Auth, Cloudinary, OpenAI

---

## 1. WHAT IS BUILT (Completed Features)

### 1.1 Authentication & User Management
- **Clerk-based auth** with sign-up, sign-in, and session management
- **Role-based registration:** separate sign-up flows for Diners (`/sign-up/diner`) and Restaurant Owners (`/sign-up/owner`)
- **3 roles:** CLIENT, RESTAURANT_OWNER, ADMIN — each with distinct dashboards
- **Profile management:** users can update name, phone, and profile image
- **Password change** functionality
- **User context provider** (`UserProvider`) that wraps the authenticated app and provides current user data via `useCurrentUser()` hook

### 1.2 Restaurant Onboarding (Owner Flow)
- **Multi-step setup wizard** (`setup-wizard.tsx`) for new restaurant owners
- **Fields:** name, description, banner image, gallery images, phone, WhatsApp, email, address, city, coordinates, price range, amenities
- **AI-generated descriptions** via OpenAI (gpt-4o-mini) — generates optimized restaurant and menu item descriptions
- **Image upload** to Cloudinary with transformations
- **Slug auto-generation** for unique restaurant URLs
- **Edit restaurant** page for updating details after initial setup
- **Restaurant approval workflow:** new restaurants go to PENDING, admin must approve before they appear publicly

### 1.3 Menu Management
- **Full CRUD** for menu items (add, edit, delete)
- **Categories:** FOOD, DRINK, DESSERT, OTHER
- **Fields:** name, description, price, image, category, availability toggle
- **Bulk toggle** availability for all items at once
- **AI-generated descriptions** for menu items

### 1.4 Restaurant Discovery (Client/Public)
- **Public explore page** (`/explore`) — browse restaurants without login
- **Authenticated explore** (`/dashboard/explore`) — browse within dashboard
- **Search & filter:** by name, city, price range
- **Pagination** (server-side)
- **Restaurant detail page** with full info: gallery, menu, amenities, map location, availability hours
- **Restaurant cards** with banner, name, city, price range, amenities preview

### 1.5 Reservation System
- **Reservation form:** select date, time, guest count, special preferences
- **8-state workflow:** PENDING → AWAITING_RESPONSE → ACCEPTED → PAYMENT_PENDING → CONFIRMED (or REJECTED/CANCELLED at various stages)
- **State machine** (`reservation-status.ts`) with `canTransitionTo()`, `isTerminal()`, `isCancellable()` validation
- **Response deadline:** restaurants must respond within 15 minutes (configurable)
- **Payment deadline:** clients must pay within 30 minutes after acceptance
- **Auto-expiration** via Vercel Cron job (`/api/cron/check-expired-reservations`) — cancels unresponded bookings automatically
- **Client dashboard:** view all reservations with status filters (All, Pending, Confirmed, Cancelled)
- **Owner dashboard:** view incoming reservations, accept/reject with reasons
- **Reservation polling** (`useReservationPolling` hook) — polls every 30s for real-time updates, pauses on inactive tab
- **Countdown timer** component for deadlines

### 1.6 Payment System (Simulated)
- **Payment flow works end-to-end** but uses a simulated/placeholder provider
- **Booking fee:** 500 XAF (configured in `src/lib/config.ts`)
- **Flow:** Accept reservation → Payment pending → Client pays → Reservation confirmed
- **Payment checkout page** with simulated form
- **Payment confirmation page** with receipt
- **Payment receipt component** for display
- **Ready for real provider:** code has detailed comments for integrating NotchPay, CinetPay, or MTN MoMo

### 1.7 Admin Panel
- **Admin dashboard** with stats: total users, restaurants, reservations, pending approvals
- **Restaurant management:** list all restaurants with filters (status, search), approve/reject/suspend/activate restaurants
- **Restaurant review page:** detailed view for admin to review and approve pending restaurants
- **User management:** list all users with filters (role, status, search), suspend/activate user accounts

### 1.8 Landing Page & Marketing
- **Landing page** (`/`) with animated sections using Framer Motion
- **Public navbar** with navigation and auth buttons
- **404 Not Found** page

### 1.9 Infrastructure & Developer Experience
- **Prisma schema** with 5 models: User, Restaurant, MenuItem, Reservation, AvailabilitySlot
- **Server actions** for all data mutations (no raw API calls from client)
- **Zod validation schemas** for all forms
- **Error boundaries** and loading states in dashboard
- **TypeScript types** for all entities (`SafeUser`, `RestaurantWithDetails`, `ReservationWithDetails`, etc.)
- **Cloudinary integration** for image uploads with delete support
- **Vercel deployment config** (`vercel.json`)

---

## 2. WHAT IS PARTIALLY BUILT (Started but Incomplete)

### 2.1 WhatsApp Notifications
- **Database field exists:** `Restaurant.whatsapp` is stored in the schema
- **Stub functions exist:** `notifyRestaurant()` in reservation actions has placeholder logic
- **TODO comments** at every notification point (reservation created, accepted, rejected, confirmed, cancelled)
- **NOT connected** to any WhatsApp API (Twilio, WhatsApp Business API, etc.)

### 2.2 Payment Integration
- **Full flow works** with simulated payments
- **NOT connected** to a real payment provider
- **Code comments** outline exactly how to integrate NotchPay, CinetPay, or MTN MoMo
- **Missing:** webhook handler at `/api/payments/webhook` for real provider callbacks

### 2.3 AI Recommendation
- **Link exists** in client dashboard pointing to `/dashboard/ai-recommend`
- **Page NOT built** — route returns 404
- **No recommendation engine** — no budget-based or intent-based suggestion logic exists yet

---

## 3. WHAT IS NOT BUILT (Features from Spec Not Started)

### 3.1 AI Recommendation System
Per the spec (Section 6), the following are not implemented:
- **Budget-based suggestions** (e.g., "Show me restaurants for 2000 FCFA")
- **Intent-based suggestions** (e.g., "romantic dinner", "casual lunch", "family outing")
- **AI chat interface** for natural language restaurant discovery
- **Recommendation page/UI** at `/dashboard/ai-recommend`

### 3.2 WhatsApp Notifications (Full Integration)
Per the spec (Section 8), none of these notifications are actually sent:
- Notify restaurant on new booking
- Notify user on approval/rejection
- Notify both parties on confirmation
- Notify on cancellation

### 3.3 Real Payment Processing
Per the spec (Section 5.5-5.6):
- Actual payment gateway integration (NotchPay, CinetPay, MTN MoMo)
- Payment webhook handler for async confirmations
- Payment failure handling and retry

### 3.4 Ratings & Reviews
Per the spec (Section 9.1):
- No rating/review model in database
- No UI for submitting or viewing reviews
- No average rating display on restaurant cards

### 3.5 Availability/Capacity Validation
- `AvailabilitySlot` model exists with `maxCapacity` field
- **Not enforced** — reservations don't check if a time slot is full or if the restaurant is open at the requested time

---

## 4. DATABASE SCHEMA REFERENCE

```
User (id, clerkId, name, email, phone, passwordHash, profileImage, role, isActive)
Restaurant (id, ownerId, name, slug, description, bannerImage, galleryImages[], phone, whatsapp, email, address, city, lat, lng, priceRange, amenities[], isApproved, isActive)
MenuItem (id, restaurantId, name, description, price, category, image, isAvailable)
Reservation (id, userId, restaurantId, date, time, guestCount, preferences, status, responseDeadline, paymentDeadline, paymentReference, paymentId, paymentMethod, paidAt, totalAmount, bookingFee, rejectionReason, cancelledBy, cancellationReason)
AvailabilitySlot (id, restaurantId, dayOfWeek, openTime, closeTime, maxCapacity, isActive)
```

---

## 5. KEY CONFIGURATION

| Setting | Value | File |
|---------|-------|------|
| Booking Fee | 500 XAF | `src/lib/config.ts` |
| Currency | XAF (Central African Franc) | `src/lib/config.ts` |
| Payment Provider | placeholder (simulated) | `src/lib/config.ts` |
| Payment Timeout | 30 minutes | `src/lib/config.ts` |
| Response Deadline | 15 minutes | `src/app/actions/reservation.ts` |
| Polling Interval | 30 seconds | `src/hooks/use-reservation-polling.ts` |
| AI Model | gpt-4o-mini | `src/app/api/ai/generate-description/route.ts` |

---

## 6. ENVIRONMENT VARIABLES REQUIRED

```
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database (Neon PostgreSQL)
DATABASE_URL=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
CRON_SECRET=
```

---

## 7. FILE STRUCTURE OVERVIEW

```
src/
├── app/
│   ├── (auth)/          # Sign-in, sign-up pages
│   ├── (main)/          # Authenticated dashboard pages
│   ├── (marketing)/     # Public landing, explore, restaurant detail
│   ├── actions/         # Server actions (auth, restaurant, menu, reservation, admin)
│   ├── api/             # API routes (auth, payments, AI, upload, cron)
│   └── layout.tsx       # Root layout with Clerk + UserProvider
├── components/
│   ├── admin/           # Admin dashboard, restaurant review, user management
│   ├── dashboard/       # Shell, sidebar, topbar, settings
│   ├── landing/         # Navbar, landing sections, animations
│   ├── reservation/     # My reservations, restaurant reservations, payment
│   ├── restaurant/      # Setup wizard, edit, menu, cards, detail, explore
│   ├── shared/          # Image upload, lightbox, reservation form, countdown, receipt
│   └── ui/              # shadcn/ui components
├── context/             # UserProvider context
├── hooks/               # useReservationPolling
├── lib/                 # Prisma, Cloudinary, config, utils, validations, services/
├── types/               # TypeScript type definitions
└── proxy.ts             # Auth proxy (Clerk route protection)
```

---

## 8. ACTIONABLE PROMPTS FOR REMAINING WORK

Use these prompts sequentially with an LLM to implement the remaining features:

---

### PROMPT 1: Availability & Capacity Validation

```
I have a Next.js 16 restaurant reservation app using Prisma with PostgreSQL.

The AvailabilitySlot model already exists:
- Fields: id, restaurantId, dayOfWeek (0-6), openTime, closeTime, maxCapacity, isActive

The Reservation model has: date, time, guestCount, status

TASK: Update the reservation creation logic in `src/app/actions/reservation.ts` (the `createReservation` function) to:
1. Check if the restaurant has an active AvailabilitySlot for the requested day of week
2. Verify the requested time falls within openTime-closeTime
3. Count existing confirmed/pending reservations for that date+time slot and check against maxCapacity
4. Return a clear error message if the slot is unavailable or full
5. Do NOT change the reservation form UI — just add server-side validation

Read the existing createReservation function and the Prisma schema before making changes.
```

---

### PROMPT 2: WhatsApp Notifications via Twilio

```
I have a Next.js 16 restaurant reservation app. WhatsApp notifications are stubbed but not implemented.

TASK: Implement WhatsApp notifications using the Twilio WhatsApp API.

1. Create a WhatsApp service at `src/lib/services/whatsapp.ts` with a function `sendWhatsAppMessage(to: string, message: string)` that sends messages via Twilio's WhatsApp sandbox/API.

2. Replace the TODO stubs in these files with actual calls to the WhatsApp service:
   - `src/app/actions/reservation.ts` — the `notifyRestaurant()` function (called on new reservation)
   - After `acceptReservation()` — notify client their reservation was accepted
   - After `rejectReservation()` — notify client their reservation was rejected
   - After `cancelConfirmedReservation()` — notify client of cancellation
   - In `src/lib/services/payment.ts` after `confirmSimulatedPayment()` — notify both parties

3. Add these env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM

4. Make the WhatsApp calls non-blocking (don't await them — fire and forget with error logging) so they don't slow down the main flow.

Read the existing stub code before implementing.
```

---

### PROMPT 3: Real Payment Integration (NotchPay)

```
I have a Next.js 16 restaurant reservation app with a simulated payment system.

The payment flow already works end-to-end with a placeholder. The payment service is at `src/lib/services/payment.ts` and config at `src/lib/config.ts`.

TASK: Replace the simulated payment with NotchPay (https://notchpay.co) integration.

1. Update `src/lib/services/payment.ts`:
   - `initializePayment()`: Call NotchPay's API to create a payment session. Return the NotchPay checkout URL.
   - `verifyPayment()`: Call NotchPay's verify endpoint to check payment status.
   - Remove `confirmSimulatedPayment()` (no longer needed with real payments).

2. Create a webhook handler at `src/app/api/payments/webhook/route.ts`:
   - Verify the webhook signature from NotchPay
   - On successful payment: update reservation to CONFIRMED, set paidAt, bookingFee, paymentMethod
   - On failed payment: update reservation back to ACCEPTED

3. Update `src/lib/config.ts`: set `IS_PAYMENT_SIMULATED = false`, `PAYMENT_PROVIDER = "notchpay"`

4. Add env vars: NOTCHPAY_PUBLIC_KEY, NOTCHPAY_SECRET_KEY, NOTCHPAY_WEBHOOK_SECRET

5. Update the payment checkout page (`src/components/reservation/payment-checkout.tsx`) to redirect to NotchPay's hosted checkout instead of showing the simulated form.

Read all existing payment code before making changes.
```

---

### PROMPT 4: AI Recommendation Engine

```
I have a Next.js 16 restaurant reservation app using Prisma with PostgreSQL and OpenAI.

The app already has an AI description generator at `src/app/api/ai/generate-description/route.ts` using gpt-4o-mini.

TASK: Build an AI-powered restaurant recommendation feature.

1. Create the page at `src/app/(main)/dashboard/ai-recommend/page.tsx`

2. Create the component at `src/components/dashboard/ai-recommend.tsx` with:
   - A chat-like interface where the user types what they want
   - Support for budget queries: "I have 5000 FCFA for dinner"
   - Support for intent queries: "romantic dinner", "casual lunch with friends", "family celebration"
   - Support for preference queries: "somewhere with outdoor seating and good drinks"
   - Display recommended restaurants as cards (reuse the existing `restaurant-card.tsx` component)

3. Create a server action at `src/app/actions/ai.ts`:
   - `getAIRecommendations(userMessage: string)` function
   - Query the database for all active/approved restaurants with their menu items and amenities
   - Send the restaurant data + user message to OpenAI
   - Ask OpenAI to select and rank the best matches, explaining why each is recommended
   - Return structured data: restaurant IDs, match reasons, suggested menu items

4. The AI should consider: price range, menu prices, amenities, cuisine type, location, and the user's stated preferences/budget.

Read the existing restaurant schema, actions, and components before building.
```

---

### PROMPT 5: Ratings & Reviews

```
I have a Next.js 16 restaurant reservation app using Prisma with PostgreSQL.

TASK: Add a ratings and reviews system.

1. Add a new Prisma model `Review`:
   - id, userId, restaurantId, reservationId (optional — link to a completed reservation)
   - rating (Int, 1-5), comment (String), createdAt, updatedAt
   - Relations: user (User), restaurant (Restaurant)
   - Unique constraint: one review per user per restaurant

2. Run `npx prisma migrate dev --name add-reviews`

3. Create server actions at `src/app/actions/review.ts`:
   - `createReview(restaurantId, rating, comment)` — only allowed if user has a CONFIRMED reservation at that restaurant
   - `getRestaurantReviews(restaurantId, page)` — paginated reviews with user info
   - `getAverageRating(restaurantId)` — returns average rating and count

4. Create a review form component at `src/components/restaurant/review-form.tsx`:
   - Star rating selector (1-5)
   - Comment textarea
   - Submit button

5. Create a reviews list component at `src/components/restaurant/reviews-list.tsx`:
   - Shows all reviews with user avatar, name, rating stars, comment, date
   - Paginated

6. Add the review form and reviews list to the restaurant detail page (`src/components/restaurant/restaurant-detail.tsx`)

7. Add average rating display to restaurant cards (`src/components/restaurant/restaurant-card.tsx`)

Read the existing Prisma schema and restaurant components before implementing.
```

---

### PROMPT 6: Owner Analytics Dashboard

```
I have a Next.js 16 restaurant reservation app. The restaurant owner dashboard currently shows basic stats.

TASK: Enhance the owner dashboard at `src/components/dashboard/owner-dashboard.tsx` with:

1. Reservation stats: total, confirmed, cancelled, rejection rate
2. Revenue summary: total booking fees collected, this month vs last month
3. Popular time slots: which days/times get the most reservations
4. Guest count trends: average party size over time
5. A simple bar chart showing reservations per day for the last 30 days (use recharts library)

Create a new server action `getOwnerAnalytics(restaurantId)` in `src/app/actions/reservation.ts` that queries and aggregates this data.

Read the existing owner dashboard and reservation schema before implementing.
```

---

## 9. IMPLEMENTATION PRIORITY ORDER

| Priority | Feature | Complexity | Impact |
|----------|---------|-----------|--------|
| 1 | Availability & Capacity Validation | Low | High — prevents overbooking |
| 2 | WhatsApp Notifications | Medium | High — core to the product spec |
| 3 | Real Payment Integration | Medium | High — required for production |
| 4 | AI Recommendation Engine | Medium | High — key differentiator |
| 5 | Ratings & Reviews | Medium | Medium — improves discovery |
| 6 | Owner Analytics Dashboard | Low | Medium — improves owner experience |
