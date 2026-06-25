# ChopWise

ChopWise is a Cameroon-focused restaurant discovery, AI recommendation and reservation platform built with Next.js, React, TypeScript, Prisma, PostgreSQL, Clerk, Cloudinary, OpenAI and Twilio WhatsApp.

## Main capabilities

- Restaurant discovery by city, food, budget and amenities
- Realistic food-rich restaurant profiles and menu prices in FCFA
- AI restaurant concierge using approved database records
- Diner and restaurant-owner authentication flows
- Restaurant onboarding, menu management and approval workflow
- Reservation creation, owner response, payment state and cancellation workflow
- WhatsApp notification service with Cameroon `+237` phone-number normalization
- Admin dashboard for restaurant and user management
- Public backend health endpoint at `/api/health`

## Public pages

- `/` — homepage
- `/explore` — restaurant directory
- `/features` — product features
- `/ai-concierge` — AI recommendation explanation and entry point
- `/how-it-works` — diner and reservation workflow
- `/for-restaurants` — restaurant-owner onboarding page
- `/contact` — contact page
- `/api/health` — database and catalogue status

## Presentation catalogue

When fewer than eight approved restaurants exist and `ENABLE_DEMO_DATA` is not set to `false`, ChopWise creates a realistic demonstration catalogue for:

- Douala
- Yaoundé
- Limbe
- Buea

The catalogue contains affordable, mid-range, premium and luxury examples with food images, locations, menus, FCFA prices and opening hours. These records are presentation data and must not be described as independently verified real-world businesses.

Disable automatic demo records in production with:

```env
ENABLE_DEMO_DATA=false
```

## Environment variables

Create a `.env` file with the following values:

```env
# Database
DATABASE_URL=

# Clerk authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Cloudinary images
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# OpenAI recommendations
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CHOPWISE_PHONE=+2376XXXXXXXX
CRON_SECRET=
ENABLE_DEMO_DATA=true

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## Local setup

```bash
npm install
npx prisma generate
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npx prisma generate
npx tsc --noEmit
npm run lint
npm run build
```

## Currency

Customer-facing prices are displayed as **FCFA**. Payment integrations continue to use **XAF**, the ISO code for the Central African CFA franc.

## External-service status

The application backend and database workflows are implemented. The following services still require valid deployment credentials to work in a live environment:

- Clerk authentication
- Neon/PostgreSQL database
- Cloudinary uploads
- OpenAI recommendations
- Twilio WhatsApp notifications
- Real payment provider such as NotchPay, CinetPay or MTN MoMo

The current payment provider remains simulated until real provider keys and webhook handling are configured.
