# Payment Integration Guide

## Current Status: SIMULATED (no real charges)

The payment system is fully functional in terms of UI, status transitions, and database records. The only simulated part is the actual money transfer. Switching to a real provider requires changing **2 files**.

## To integrate a real payment provider:

### Step 1: Choose a provider
- **NotchPay** (recommended for Cameroon): https://docs.notchpay.co
- **CinetPay**: https://docs.cinetpay.com
- **MTN MoMo API**: https://momodeveloper.mtn.com

### Step 2: Get credentials
- Sign up for the provider
- Get API keys (public key, secret key)
- Set up webhook URL: `https://yourdomain.com/api/payments/webhook`

### Step 3: Update environment variables
Add to `.env`:
```
PAYMENT_PROVIDER_PUBLIC_KEY=pk_xxx
PAYMENT_PROVIDER_SECRET_KEY=sk_xxx
PAYMENT_WEBHOOK_SECRET=whsec_xxx
```

### Step 4: Update `lib/config.ts`
```ts
export const IS_PAYMENT_SIMULATED = false;
export const PAYMENT_PROVIDER = "notchpay"; // or "cinetpay" or "mtn_momo"
```

### Step 5: Update `lib/services/payment.ts`
- Replace `initializePayment()` with real API call to create payment session
- Replace `verifyPayment()` with real verification call
- The `confirmSimulatedPayment()` function is no longer needed — webhook handles this

### Step 6: Create webhook handler
Create `/api/payments/webhook/route.ts`:
- Verify webhook signatures for security
- Process payment status updates (success, failed)
- Update reservation status accordingly

### Step 7: Remove simulated elements
- Remove the dev mode banner from checkout page (controlled by `IS_PAYMENT_SIMULATED`)
- Remove "SIMULATED" watermark from receipts (also controlled by `IS_PAYMENT_SIMULATED`)
- Remove `/api/payments/confirm-simulated` route

### Files to modify:
| File | Change |
|------|--------|
| `lib/config.ts` | Toggle `IS_PAYMENT_SIMULATED` to `false` |
| `lib/services/payment.ts` | Replace placeholder with real API calls |
| `app/api/payments/webhook/route.ts` | New file — handle provider callbacks |
| `.env` | Add provider API keys |

### Files that DON'T need changes:
- Checkout page UI (adapts automatically via `IS_PAYMENT_SIMULATED`)
- Receipt component (watermark controlled by config)
- My Reservations page
- Reservation status transitions
- Database schema
