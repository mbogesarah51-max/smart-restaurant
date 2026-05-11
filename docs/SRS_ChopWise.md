# Software Requirements Specification (SRS)

# ChopWise — Smart Restaurant Reservation & AI Recommendation Platform

**Version:** 1.0  
**Date:** April 1, 2026  
**Prepared by:** ChopWise Development Team  
**Project Cost:** $20,000 USD  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Actors & Roles](#3-system-actors--roles)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Database Design](#6-database-design)
7. [API Specification](#7-api-specification)
8. [User Interface Specifications](#8-user-interface-specifications)
9. [Business Logic & Workflows](#9-business-logic--workflows)
10. [Technology Stack](#10-technology-stack)
11. [Security Requirements](#11-security-requirements)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)
13. [Project Cost Breakdown](#13-project-cost-breakdown)
14. [Future Enhancements](#14-future-enhancements)
15. [Glossary](#15-glossary)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the ChopWise platform — a web-based restaurant discovery, reservation, and AI recommendation system designed for the Cameroonian market. It details all functional and non-functional requirements, system architecture, database design, API specifications, and user interface designs.

### 1.2 Scope

ChopWise enables:
- **Diners** to discover restaurants, browse menus, make reservations, and receive AI-powered recommendations based on budget and preferences.
- **Restaurant Owners** to digitize their restaurant presence, manage menus, receive and respond to booking requests, and track reservations.
- **Administrators** to oversee the platform, approve restaurants, manage users, and monitor platform activity.

The system facilitates the complete booking lifecycle: from discovery to reservation, restaurant response, payment commitment, and confirmation — with WhatsApp notification integration planned for future releases.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|-----------|
| FCFA | Central African CFA Franc (XAF) — the currency used in Cameroon |
| SRS | Software Requirements Specification |
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| JWT | JSON Web Token |
| ORM | Object-Relational Mapping |
| SSR | Server-Side Rendering |
| AI | Artificial Intelligence |

### 1.4 References

- Product Flow Document: `.claude/application.md`
- Payment Integration Guide: `docs/PAYMENT_INTEGRATION.md`
- Prisma Schema: `prisma/schema.prisma`

---

## 2. Overall Description

### 2.1 Product Perspective

ChopWise is a standalone web application that operates as a marketplace connecting diners with restaurants in Cameroon. The platform addresses the lack of structured booking systems in the Cameroonian restaurant industry by providing a digital-first reservation experience with AI-enhanced discovery.

### 2.2 Product Features Summary

| Feature | Status |
|---------|--------|
| User Registration & Authentication | Implemented |
| Role-Based Dashboards (Client, Owner, Admin) | Implemented |
| Restaurant Profile Creation & Management | Implemented |
| Menu Management (CRUD + AI Descriptions) | Implemented |
| Restaurant Discovery & Search | Implemented |
| Public Restaurant Browsing (No Login Required) | Implemented |
| Reservation Booking Flow (4-Step Wizard) | Implemented |
| Real-Time Countdown Timers | Implemented |
| Restaurant Reservation Management (Accept/Reject) | Implemented |
| Simulated Payment System | Implemented |
| Admin Restaurant Approval | Implemented |
| Admin User Management | Implemented |
| Image Upload via Cloudinary | Implemented |
| Map Integration (Leaflet/OpenStreetMap) | Implemented |
| AI Restaurant Description Generation (OpenAI) | Implemented |
| Automated Reservation Expiry (Cron) | Implemented |
| WhatsApp Notifications | Planned |
| Real Payment Provider Integration | Planned |
| AI Budget-Based Recommendations | Planned |
| Reviews & Ratings | Planned |

### 2.3 Operating Environment

- **Client:** Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Server:** Node.js runtime (Vercel serverless)
- **Database:** PostgreSQL (Neon serverless)
- **Image Storage:** Cloudinary CDN
- **Authentication:** Clerk managed service

### 2.4 Design and Implementation Constraints

- The application must be responsive and work on mobile devices (minimum 320px width)
- All prices are displayed in FCFA (Central African CFA Franc)
- Restaurant locations are centered on Cameroonian cities
- Payment processing is currently simulated; real integration requires only a 2-file change

---

## 3. System Actors & Roles

### 3.1 Client (Diner)

A registered user who browses restaurants, views menus, makes reservations, and pays booking fees.

**Capabilities:**
- Register an account (email, phone, password)
- Browse and search restaurants with filters (price range, city, amenities)
- View restaurant details (menu, photos, hours, location, amenities)
- Make reservations with date, time, guest count, and optional pre-orders
- Track reservation status in real-time with countdown timers
- Pay booking fees (simulated) to confirm reservations
- Cancel reservations before confirmation
- Update profile (name, phone, profile picture)
- Change password

### 3.2 Restaurant Owner

A registered user who manages a restaurant profile, menu, and incoming reservations.

**Capabilities:**
- Register an account with "Restaurant Owner" role
- Complete multi-step restaurant setup wizard (7 steps)
- Manage restaurant profile (info, images, description, amenities, hours)
- Manage menu items (add, edit, delete, toggle availability, bulk operations)
- Generate AI-powered descriptions for restaurant and menu items
- Receive reservation requests with countdown timers
- Accept or reject reservations (with reasons for rejection)
- View reservation history and statistics
- Contact clients via WhatsApp or phone
- Cancel confirmed reservations (with reason)

### 3.3 Administrator

A platform administrator who oversees all operations.

**Capabilities:**
- View platform statistics (users, restaurants, reservations)
- Approve or reject restaurant registrations
- Suspend or activate restaurants
- Manage users (view, suspend, activate)
- View all restaurants with filtering and search
- Review restaurant details before approval
- Monitor pending approvals

---

## 4. Functional Requirements

### 4.1 Authentication & User Management

#### FR-001: User Registration
- **Description:** Users can create an account by providing name, email, phone number, and password
- **Input:** Name (2-100 chars), email (valid format), phone (9-15 digits), password (8+ chars with uppercase, lowercase, and digit), role (CLIENT or RESTAURANT_OWNER)
- **Process:** Validate input with Zod schema → check for duplicate email/phone → hash password with bcrypt (12 rounds) → create local DB user → create Clerk user → link Clerk ID → generate sign-in token
- **Output:** User account created, automatically signed in, redirected to dashboard
- **Error Handling:** Duplicate email/phone returns field-specific errors; Clerk password breach detection maps to password field error; Clerk failure triggers DB rollback

#### FR-002: User Login
- **Description:** Users can sign in with email and password
- **Input:** Email, password
- **Process:** Find user by email → verify password with bcrypt → create Clerk sign-in token
- **Output:** Clerk session established via ticket strategy, redirect to role-appropriate dashboard
- **Error Handling:** Invalid email returns "No account found"; wrong password returns "Incorrect password"

#### FR-003: Automatic Session Management
- **Description:** After registration, users are automatically signed in without visiting the login page
- **Implementation:** Server generates Clerk sign-in token → client creates session via `clerk.client.signIn.create({ strategy: "ticket", ticket })` → `clerk.setActive()` → redirect to dashboard

#### FR-004: Profile Management
- **Description:** Users can update their name, phone number, and profile picture
- **Input:** Name (2+ chars), phone (9+ digits, unique), profile image (Cloudinary URL)
- **Process:** Validate uniqueness of phone → update DB → return updated user
- **Output:** Profile updated, toast notification

#### FR-005: Password Change
- **Description:** Users can change their password
- **Input:** Current password, new password (8+ chars with complexity), confirm password
- **Process:** Verify current password → hash new password → update both Clerk and local DB
- **Output:** Password updated in both systems

#### FR-006: Sign Out
- **Description:** Users can sign out from any dashboard page
- **Implementation:** `clerk.signOut()` → redirect to `/sign-in`

### 4.2 Restaurant Management

#### FR-007: Restaurant Onboarding Wizard
- **Description:** Restaurant owners complete a 7-step wizard to create their restaurant profile
- **Steps:**
  1. **Basic Information:** Name, phone, WhatsApp, email, address, city (10 Cameroon cities), price range (BUDGET/MODERATE/PREMIUM/LUXURY)
  2. **Location:** Interactive map (Leaflet/OpenStreetMap) with click-to-pin, manual lat/lng input
  3. **Images:** Banner image (required), gallery images (up to 6), uploaded to Cloudinary
  4. **Description:** Textarea with "Generate with AI" button (OpenAI GPT-4o-mini)
  5. **Amenities:** Multi-select from 12 predefined options
  6. **Schedule:** Weekly opening hours with per-day toggle (default Mon-Sat 10:00-22:00)
  7. **Review:** Summary of all entered data → "Submit for Approval"
- **Data Persistence:** Auto-saved to localStorage as draft between steps
- **Validation:** Each step validated before advancing
- **Output:** Restaurant created with `isApproved=false`, availability slots created in transaction, slug auto-generated

#### FR-008: Restaurant Profile Editing
- **Description:** Owners can edit any restaurant detail after creation
- **Implementation:** Tabbed interface (Basic Info, Location, Images, Description, Amenities, Schedule)
- **Behavior:** Pre-populated with existing data, single "Save Changes" button
- **Slug Handling:** Automatically regenerated if restaurant name changes, with uniqueness guarantee

#### FR-009: AI Description Generation
- **Description:** AI generates professional descriptions for restaurants and menu items
- **Restaurant:** 2-3 sentences, under 50 words, based on name/city/price range/amenities
- **Menu Item:** 1 sentence, under 20 words, based on name/category
- **Provider:** OpenAI GPT-4o-mini
- **Fallback:** Template descriptions if API key is not configured

#### FR-010: Slug Generation
- **Description:** URL-friendly slugs are automatically generated from restaurant names
- **Algorithm:** Lowercase → remove special chars → replace spaces with hyphens → deduplicate with numeric suffix (e.g., "chez-maurice-2")

### 4.3 Menu Management

#### FR-011: Menu Item CRUD
- **Description:** Restaurant owners can create, read, update, and delete menu items
- **Fields:** Name (required, 1-100 chars), description (optional, AI-generable), price in FCFA (required), category (FOOD/DRINK/DESSERT/OTHER), image (optional)
- **Validation:** Zod schema on both client and server

#### FR-012: Menu Item Availability Toggle
- **Description:** Owners can toggle individual items as available/unavailable
- **Implementation:** Single-click toggle, immediate DB update, toast confirmation
- **Bulk Operation:** "Mark all available" and "Mark all unavailable" buttons

#### FR-013: Menu Display
- **Description:** Menu items displayed by category with filtering
- **Categories:** Food, Drinks, Desserts, Other — with count badges
- **Preview Mode:** Shows menu as customers would see it

### 4.4 Restaurant Discovery

#### FR-014: Restaurant Search & Filtering
- **Description:** Users can search and filter restaurants
- **Search:** Text search on name and description (case-insensitive)
- **Filters:** Price range (multi-select), city, amenities (AND logic — must have all selected)
- **Sort:** Newest, Price Low→High, Price High→Low
- **Pagination:** 12 restaurants per page
- **URL Params:** Filters encoded in URL for shareable/bookmarkable results
- **Scope:** Only approved and active restaurants shown

#### FR-015: Restaurant Grid & Map Views
- **Description:** Toggle between grid card view and interactive map view
- **Grid:** Responsive (1/2/3 columns), card hover animations, skeleton loading
- **Map:** Leaflet/OpenStreetMap with restaurant pins, popup cards with name/image/link
- **Preference:** View mode saved in localStorage

#### FR-016: Public Restaurant Browsing
- **Description:** Unauthenticated users can browse restaurants from the landing page
- **Routes:** `/explore` (public search), `/restaurants/[slug]` (public detail)
- **Limitation:** Reservation requires authentication

#### FR-017: Restaurant Detail Page
- **Sections:** Hero banner, image gallery with lightbox, about/description, amenities with icons, full menu by category, weekly hours (today highlighted), location map, contact (phone/WhatsApp/email), reserve button
- **SEO:** Dynamic metadata (title, description, OpenGraph)
- **Mobile:** Sticky "Reserve a Table" bar at bottom

### 4.5 Reservation System

#### FR-018: Reservation Booking Flow
- **Description:** 4-step reservation wizard in a side drawer
- **Step 1 — Date & Time:**
  - Date picker: future dates only (max 30 days ahead)
  - Validates against restaurant availability schedule
  - Shows "Closed on [day]" for unavailable days
  - Time picker: 30-minute intervals within opening hours
  - Same-day bookings require at least 1 hour from now
- **Step 2 — Guest Details:**
  - Guest count: 1-20 with +/- counter
  - Special occasion: None, Birthday, Anniversary, Business Meeting, Date Night, Other
  - Special requests: Optional textarea
- **Step 3 — Pre-order (Optional):**
  - Restaurant menu by category with +/- quantity selectors
  - Running total displayed
  - Skippable
- **Step 4 — Review & Confirm:**
  - Full summary of all selections
  - Booking fee notice (500 FCFA)
  - Terms acceptance checkbox
  - Submit button

#### FR-019: Reservation Status Lifecycle

```
AWAITING_RESPONSE (created, 15-min deadline)
    ├── Restaurant Accepts → PAYMENT_PENDING (30-min deadline)
    │       ├── Client Pays → CONFIRMED
    │       ├── Deadline Expires → CANCELLED (SYSTEM)
    │       └── Client Cancels → CANCELLED (CLIENT)
    ├── Restaurant Rejects → REJECTED (with reason)
    ├── Deadline Expires → CANCELLED (SYSTEM)
    └── Client Cancels → CANCELLED (CLIENT)

CONFIRMED
    ├── Restaurant Cancels → CANCELLED (RESTAURANT, with reason)
    └── Client Cancels → CANCELLED (CLIENT)

REJECTED → Terminal
CANCELLED → Terminal
```

#### FR-020: Restaurant Response to Reservations
- **Accept:** Validates deadline not passed → status to PAYMENT_PENDING → sets 30-min payment deadline → notifies client
- **Reject:** Requires reason selection (Fully booked, Time slot unavailable, Kitchen closed, Other) → status to REJECTED → notifies client
- **Cancel Confirmed:** Requires reason → status to CANCELLED → future: triggers refund

#### FR-021: Reservation Countdown Timers
- **Response Timer:** 15 minutes for restaurant to respond (MM:SS format)
- **Payment Timer:** 30 minutes for client to pay
- **Visual Alerts:** Red text under 2 minutes, pulsing animation under 1 minute
- **Expiry:** Fires callback on zero, used for UI updates

#### FR-022: Automated Reservation Expiry
- **Implementation:** Cron job running every minute (`/api/cron/check-expired-reservations`)
- **Logic:** Cancels AWAITING_RESPONSE past responseDeadline; cancels PAYMENT_PENDING past paymentDeadline
- **Attribution:** `cancelledBy: SYSTEM`, with descriptive reason
- **Security:** Protected by `CRON_SECRET` bearer token

#### FR-023: Reservation Polling
- **Description:** Real-time-like updates via polling
- **Interval:** 15 seconds for new requests (owner), 30 seconds for other tabs
- **Tab Awareness:** Pauses when browser tab is inactive, resumes with immediate fetch when active

### 4.6 Payment System

#### FR-024: Payment Initialization
- **Trigger:** Client clicks "Pay Now" on PAYMENT_PENDING reservation
- **Process:** Generate payment reference → store in reservation → redirect to checkout
- **Current Implementation:** Simulated (reference format: `SIM_xxxxxxxxxxxx`)

#### FR-025: Simulated Payment Checkout
- **Layout:** Order summary, payment method selection (MTN MoMo, Orange Money, Card), phone number input
- **Dev Mode Banner:** Yellow warning showing "No real payment will be charged"
- **Process:** 2-second simulated processing delay → confirm via API → redirect to success page
- **Timeout:** Payment deadline countdown timer, disabled pay button when expired

#### FR-026: Payment Confirmation
- **Success State:** Green checkmark animation, booking summary, payment receipt
- **Receipt Fields:** Amount, reference, method, date, status
- **SIMULATED Watermark:** Shown when `IS_PAYMENT_SIMULATED=true`
- **Print:** "Download Receipt" opens browser print dialog

#### FR-027: Payment Architecture (Swap-Ready)
- **Interface:** `lib/services/payment.ts` with `initializePayment()` and `verifyPayment()`
- **Config:** `lib/config.ts` with `IS_PAYMENT_SIMULATED` toggle
- **Provider Swap:** Change 2 files to integrate NotchPay, CinetPay, or MTN MoMo API
- **Documentation:** `docs/PAYMENT_INTEGRATION.md` with step-by-step guide

### 4.7 Admin Panel

#### FR-028: Admin Dashboard
- **Statistics (Real Data):** Total users (by role breakdown), total restaurants (approved vs pending), total reservations, pending approvals count
- **Recent Activity:** Last 10 registered users, last 5 pending restaurants
- **Quick Actions:** "Review Pending" button

#### FR-029: Restaurant Moderation
- **Tabs:** Pending Approval, Approved, Suspended, All
- **Search:** By restaurant name or city
- **Pagination:** 20 per page
- **Review Page:** Full restaurant details read-only (images, menu, hours, owner info)
- **Actions:** Approve (isApproved=true), Reject (isApproved=false, isActive=false), Suspend (isActive=false), Activate (isActive=true)

#### FR-030: User Management
- **Filters:** By role (Client, Restaurant Owner, Admin, All)
- **Search:** By name or email
- **Pagination:** 20 per page
- **Actions:** Suspend user (isActive=false), Activate user (isActive=true)
- **Safety:** Cannot suspend own admin account

### 4.8 Client Dashboard

#### FR-031: Client My Reservations
- **Tabs:** Pending (AWAITING_RESPONSE/PAYMENT_PENDING), Upcoming (CONFIRMED, future), Past (CONFIRMED, past), Cancelled
- **Card Features:** Restaurant image/name, date/time/guests, status badge, countdown timer for pending, expandable details (occasion, pre-orders, location)
- **Actions:** Cancel (with confirmation), Pay (for PAYMENT_PENDING), View Details

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **Page Load:** All dashboard pages load within 3 seconds on 3G connections
- **Image Optimization:** Cloudinary auto-quality and format, max 1200px width, Next.js Image component with responsive sizes
- **Database:** Prisma queries optimized with selective includes and pagination

### 5.2 Scalability
- **Serverless Architecture:** Deployed on Vercel with auto-scaling
- **Database:** Neon PostgreSQL with connection pooling
- **Image CDN:** Cloudinary with global edge delivery

### 5.3 Usability
- **Mobile-First:** All pages responsive from 320px to desktop
- **Accessibility:** Semantic HTML, ARIA labels on interactive elements, keyboard navigable
- **Loading States:** Skeleton loaders for page transitions, spinners for actions
- **Error States:** Toast notifications for all operations, field-level form errors, error boundary for crash recovery
- **Empty States:** Helpful messages with action CTAs for all list views

### 5.4 Reliability
- **Error Recovery:** Dashboard error boundary with "Try Again" functionality
- **Draft Persistence:** Restaurant setup wizard saves progress to localStorage
- **Transaction Safety:** Database operations use Prisma transactions for data consistency
- **Status Validation:** Reservation status transitions validated server-side with state machine

### 5.5 Maintainability
- **Code Organization:** Feature-based folder structure, server/client component separation
- **Type Safety:** Full TypeScript with strict mode, Prisma-generated types, Zod validation schemas
- **Swap-Ready Architecture:** Payment service interface allows provider swap with 2-file change

---

## 6. Database Design

### 6.1 Entity-Relationship Model

```
User (1) ──────── (N) Restaurant
  │                      │
  │                      ├── (N) MenuItem
  │                      ├── (N) AvailabilitySlot
  │                      │
  └── (N) Reservation (N) ──┘
```

### 6.2 Models

#### User
| Field | Type | Constraints |
|-------|------|------------|
| id | String | PK, CUID |
| clerkId | String | Unique, nullable |
| name | String | Required |
| email | String | Unique |
| phone | String | Unique |
| passwordHash | String | bcrypt hash |
| role | Enum | CLIENT, RESTAURANT_OWNER, ADMIN |
| profileImage | String | Nullable, Cloudinary URL |
| isActive | Boolean | Default: true |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

#### Restaurant
| Field | Type | Constraints |
|-------|------|------------|
| id | String | PK, CUID |
| ownerId | String | FK → User |
| name | String | Required |
| slug | String | Unique, auto-generated |
| description | String | Nullable |
| bannerImage | String | Nullable, Cloudinary URL |
| galleryImages | String[] | Array of Cloudinary URLs |
| phone | String | Required |
| whatsapp | String | Nullable |
| email | String | Nullable |
| address | String | Required |
| city | String | Required |
| latitude | Float | Nullable |
| longitude | Float | Nullable |
| priceRange | Enum | BUDGET, MODERATE, PREMIUM, LUXURY |
| amenities | String[] | Array of amenity names |
| isApproved | Boolean | Default: false |
| isActive | Boolean | Default: true |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

#### MenuItem
| Field | Type | Constraints |
|-------|------|------------|
| id | String | PK, CUID |
| restaurantId | String | FK → Restaurant |
| name | String | Required |
| description | String | Nullable |
| price | Float | Required, >= 0 |
| category | Enum | FOOD, DRINK, DESSERT, OTHER |
| image | String | Nullable, Cloudinary URL |
| isAvailable | Boolean | Default: true |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

#### Reservation
| Field | Type | Constraints |
|-------|------|------------|
| id | String | PK, CUID |
| userId | String | FK → User |
| restaurantId | String | FK → Restaurant |
| date | DateTime | Required |
| time | String | HH:MM format |
| guestCount | Int | 1-20 |
| preferences | String | Nullable, JSON |
| status | Enum | 7 states (see §9) |
| responseDeadline | DateTime | Nullable, 15 min from creation |
| paymentDeadline | DateTime | Nullable, 30 min from acceptance |
| paymentReference | String | Nullable, payment provider ref |
| paymentMethod | String | Nullable |
| paidAt | DateTime | Nullable |
| bookingFee | Float | Nullable, default 500 FCFA |
| rejectionReason | String | Nullable |
| cancelledBy | Enum | CLIENT, RESTAURANT, SYSTEM |
| cancellationReason | String | Nullable |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

#### AvailabilitySlot
| Field | Type | Constraints |
|-------|------|------------|
| id | String | PK, CUID |
| restaurantId | String | FK → Restaurant |
| dayOfWeek | Int | 0=Monday to 6=Sunday |
| openTime | String | HH:MM format |
| closeTime | String | HH:MM format |
| maxCapacity | Int | Nullable |
| isActive | Boolean | Default: true |

### 6.3 Enumerations

| Enum | Values |
|------|--------|
| Role | CLIENT, RESTAURANT_OWNER, ADMIN |
| PriceRange | BUDGET, MODERATE, PREMIUM, LUXURY |
| MenuCategory | FOOD, DRINK, DESSERT, OTHER |
| ReservationStatus | PENDING, AWAITING_RESPONSE, ACCEPTED, REJECTED, PAYMENT_PENDING, CONFIRMED, CANCELLED |
| CancelledBy | CLIENT, RESTAURANT, SYSTEM |

---

## 7. API Specification

### 7.1 Authentication Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/auth/register | Public | Create new user account |
| POST | /api/auth/login | Public | Sign in and get session token |
| GET | /api/auth/me | Protected | Get current authenticated user |
| PUT | /api/auth/profile | Protected | Update user profile |
| PUT | /api/auth/password | Protected | Change password |

### 7.2 Payment Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/payments/initialize | Protected | Start payment for reservation |
| POST | /api/payments/confirm-simulated | Protected | Confirm simulated payment |
| GET | /api/payments/verify | Protected | Check payment status by reference |

### 7.3 Upload Endpoint

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/upload | Protected | Upload images to Cloudinary |
| DELETE | /api/upload | Protected | Delete image from Cloudinary |

### 7.4 AI Endpoint

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/ai/generate-description | Protected | Generate AI description (restaurant or menu item) |

### 7.5 System Endpoint

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/cron/check-expired-reservations | Bearer Token | Cancel expired reservations |

---

## 8. User Interface Specifications

### 8.1 Landing Page
- **Navbar:** Logo, nav links (Explore, Features, How It Works, For Restaurants), auth buttons (Sign In / Get Started when logged out, Dashboard when logged in)
- **Hero Section:** Headline, two CTAs ("Find a Restaurant" → /explore, "List Your Restaurant" → /sign-up)
- **Feature Sections:** Social proof, features grid, how it works, AI showcase, restaurant benefits, pricing, testimonials

### 8.2 Dashboard Shell
- **Desktop:** Fixed sidebar (260px) with role-based navigation + main content area with topbar
- **Mobile:** Collapsible sidebar via sheet/drawer with hamburger menu trigger
- **Topbar:** Search (placeholder), notification bell (placeholder), user dropdown with name/role/settings/sign-out
- **User Footer:** Avatar, name, role badge in sidebar bottom

### 8.3 Navigation by Role

**Client:**
- Dashboard (overview)
- Explore Restaurants
- My Reservations
- AI Recommend (planned)
- Settings

**Restaurant Owner:**
- Dashboard (overview)
- My Restaurant (edit)
- Reservations (manage)
- Menu Management
- Settings

**Admin:**
- Dashboard (stats)
- Restaurants (moderation)
- Users (management)
- Settings

---

## 9. Business Logic & Workflows

### 9.1 Complete Reservation Lifecycle

```
1. CLIENT browses restaurants → selects one → clicks "Reserve a Table"
2. CLIENT fills 4-step form → submits → status: AWAITING_RESPONSE
3. SYSTEM sets responseDeadline = now + 15 minutes
4. RESTAURANT_OWNER receives notification (polling every 15 seconds)
5. RESTAURANT_OWNER reviews request:
   a. ACCEPTS → status: PAYMENT_PENDING, paymentDeadline = now + 30 minutes
   b. REJECTS (with reason) → status: REJECTED → flow ends
   c. NO RESPONSE (15 min) → SYSTEM auto-cancels → flow ends
6. CLIENT receives notification to pay (polling every 30 seconds)
7. CLIENT clicks "Pay Now" → checkout page → selects payment method
8. CLIENT completes payment → status: CONFIRMED
   - If 30 min passes without payment → SYSTEM auto-cancels → flow ends
9. Both parties see CONFIRMED reservation in their dashboards
10. Either party can cancel with reason at any time
```

### 9.2 Payment Flow

```
1. Reservation moves to PAYMENT_PENDING
2. Client clicks "Pay Now" → API initializes payment → generates reference
3. Checkout page shows: summary, method selection, countdown timer
4. Client clicks "Pay 500 FCFA" → 2-sec processing delay → confirm API
5. Server validates: ownership, reference match, status, deadline
6. On success: status=CONFIRMED, paidAt=now, method recorded
7. Redirect to confirmation page with receipt
```

### 9.3 Restaurant Onboarding

```
1. Owner registers → redirected to /dashboard/restaurant
2. No restaurant found → redirect to /dashboard/restaurant/setup
3. 7-step wizard (draft auto-saved to localStorage)
4. Submit → restaurant created with isApproved=false
5. Admin reviews → approves/rejects
6. If approved → restaurant visible to diners
```

---

## 10. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | Next.js (App Router) | 16.2 |
| UI Library | React | 19.2 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui (Base UI primitives) | Latest |
| Animation | Framer Motion | 12.x |
| Icons | Lucide React | 1.7 |
| Toast Notifications | Sonner | 2.x |
| Authentication | Clerk | 7.x |
| Password Hashing | bcryptjs | 3.x |
| Database | PostgreSQL (Neon serverless) | 16 |
| ORM | Prisma | 7.6 |
| Validation | Zod | 4.3 |
| Image Upload | Cloudinary | 2.9 |
| Maps | Leaflet + react-leaflet | 1.9 |
| AI | OpenAI (GPT-4o-mini) | Latest |
| Payment | Simulated (NotchPay-ready) | — |

---

## 11. Security Requirements

### 11.1 Authentication
- Clerk manages JWT sessions with automatic token refresh
- Passwords hashed with bcrypt (12 rounds) stored locally
- Dual auth: Clerk for sessions, local DB for password verification

### 11.2 Authorization
- Route-level protection via Clerk middleware
- Server actions verify user role before execution
- Ownership checks on all data modification operations
- Admin actions require `role === "ADMIN"` validation

### 11.3 Data Protection
- Password hashes never exposed in API responses (SafeUser type)
- Cron endpoints protected by bearer token (CRON_SECRET)
- File upload limited to 5MB, image types only (JPEG, PNG, WebP)
- Input validation with Zod on both client and server

### 11.4 API Security
- All protected endpoints require Clerk JWT
- Payment references validated against stored records
- Status transitions validated via state machine

---

## 12. Deployment & Infrastructure

### 12.1 Hosting
- **Application:** Vercel (serverless, edge-optimized)
- **Database:** Neon PostgreSQL (serverless, auto-scaling)
- **Images:** Cloudinary CDN (global edge delivery)
- **Authentication:** Clerk managed service

### 12.2 Environment Variables

| Variable | Purpose |
|----------|---------|
| DATABASE_URL | Neon PostgreSQL connection string |
| CLERK_SECRET_KEY | Clerk backend authentication |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Clerk frontend authentication |
| CLOUDINARY_API_KEY / SECRET | Image upload credentials |
| OPENAI_API_KEY | AI description generation |
| CRON_SECRET | Cron job authorization |

### 12.3 Scheduled Jobs

| Job | Schedule | Endpoint |
|-----|----------|----------|
| Check Expired Reservations | Every minute | /api/cron/check-expired-reservations |

---

## 13. Project Cost Breakdown

**Total Project Cost: $20,000 USD**

| Phase | Description | Cost |
|-------|-------------|------|
| Phase 1 | Authentication, Dashboard Shell, User Management, Settings | $3,000 |
| Phase 2 | Restaurant Onboarding, Menu Management, Admin Panel | $4,000 |
| Phase 3 | Restaurant Discovery, Search, Filtering, Map Integration | $3,500 |
| Phase 4 | Reservation Booking Flow, Real-Time Timers, Status Management | $4,000 |
| Phase 5 | Payment System (Architecture + Simulated), Cron Jobs | $2,500 |
| Phase 6 | Restaurant Owner Reservation Management, Polling | $2,000 |
| Phase 7 | Polish, Error Handling, 404 Page, Loading States | $1,000 |
| **Total** | | **$20,000** |

### Excluded from Current Scope (Future Phases):
- Real Payment Provider Integration (NotchPay/CinetPay): ~$2,000
- WhatsApp Notification Integration: ~$1,500
- AI Budget Recommendation Engine: ~$3,000
- Reviews & Ratings System: ~$1,500
- Mobile App (React Native): ~$15,000

---

## 14. Future Enhancements

### 14.1 Planned Features
1. **WhatsApp Notifications** — Notify restaurants of new reservations, confirm bookings to clients
2. **Real Payment Provider** — NotchPay or CinetPay integration (2-file swap)
3. **AI Budget Recommendations** — "I have 2,000 FCFA" → restaurant and meal suggestions
4. **Reviews & Ratings** — Post-dining reviews with star ratings
5. **Favorites/Wishlist** — Save restaurants for later
6. **Advanced Analytics** — Owner dashboard with revenue and booking trends

### 14.2 Technical Debt
1. Replace polling with Server-Sent Events or WebSocket for real-time updates
2. Add comprehensive test suite (unit, integration, e2e)
3. Implement proper error logging service (Sentry)
4. Add rate limiting to API endpoints
5. Implement proper image optimization pipeline

---

## 15. Glossary

| Term | Definition |
|------|-----------|
| Booking Fee | A small fee (500 FCFA) charged to confirm a reservation |
| Response Deadline | 15-minute window for a restaurant to respond to a reservation request |
| Payment Deadline | 30-minute window for a client to complete payment after restaurant acceptance |
| Slug | URL-friendly version of a restaurant name (e.g., "chez-maurice") |
| Pre-order | Optional menu items selected during reservation for advance preparation |
| Simulated Payment | Development-mode payment that mimics real payment flow without actual charges |
| Polling | Periodic API calls to check for updates (used instead of WebSocket) |

---

*End of Software Requirements Specification*

*Document prepared for ChopWise — Smart Restaurant Reservation & AI Recommendation Platform*
*© 2026 ChopWise. All rights reserved.*
