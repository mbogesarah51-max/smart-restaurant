export const BOOKING_FEE = 2000; // in FCFA
export const CURRENCY = "XAF";
export const PAYMENT_PROVIDER = "placeholder"; // "notchpay" | "cinetpay" | "mtn_momo"
export const PAYMENT_TIMEOUT_MINUTES = 30;
// How long the restaurant has before we nudge them. A pending request is NEVER
// auto-cancelled for non-response — once this passes with no answer, the cron
// sends the owner a single WhatsApp reminder instead.
export const RESPONSE_REMINDER_MINUTES = 10;
export const IS_PAYMENT_SIMULATED = true; // Set to false when real provider is added
