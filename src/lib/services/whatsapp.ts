// ============================================================
// WHATSAPP NOTIFICATION SERVICE — TWILIO WHATSAPP BUSINESS API
// ============================================================
// Fire-and-forget messaging layer for reservation lifecycle events.
// Never throws to callers — all errors are logged and swallowed so
// notification failures cannot break the critical path.
//
// Configuration (env):
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_WHATSAPP_FROM   e.g. "whatsapp:+14155238886" (sandbox)
// ============================================================

import twilio, { Twilio } from "twilio";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

const CAMEROON_COUNTRY_CODE = "237";

let missingCredsWarned = false;
let client: Twilio | null = null;

function isConfigured(): boolean {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    if (!missingCredsWarned) {
      console.warn(
        "[ChopWise] WhatsApp notifications disabled: Twilio credentials not configured"
      );
      missingCredsWarned = true;
    }
    return false;
  }
  return true;
}

function getClient(): Twilio | null {
  if (client) return client;
  if (!isConfigured()) return null;
  client = twilio(TWILIO_ACCOUNT_SID!, TWILIO_AUTH_TOKEN!);
  return client;
}

// Normalize a phone number to E.164 format, defaulting to Cameroon (+237)
// when no country code is present.
function formatToE164(phone: string): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned) return null;

  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith(CAMEROON_COUNTRY_CODE)) return `+${cleaned}`;
  // Cameroon mobile numbers are 9 digits without country code
  if (cleaned.length === 9) return `+${CAMEROON_COUNTRY_CODE}${cleaned}`;
  // Fallback: assume digits already include a country code
  return `+${cleaned}`;
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<void> {
  if (!to || !to.trim()) return;
  const formatted = formatToE164(to);
  if (!formatted) return;

  const tw = getClient();
  if (!tw) return;

  try {
    const result = await tw.messages.create({
      from: TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${formatted}`,
      body: message,
    });
    console.log(
      `[WhatsApp] Sent to ${formatted} (sid: ${result.sid})`
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[WhatsApp] Failed to send to ${formatted}: ${msg}`);
  }
}

// ─── App URL Helper ────────────────────────────────────────────────────────
// Builds tappable absolute URLs so recipients can jump straight to the
// relevant page from WhatsApp without typing anything.

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");

export function getAppUrl(path: string): string {
  if (!APP_URL) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${APP_URL}${normalized}`;
}

// ─── Message Templates ─────────────────────────────────────────────────────
// Concise, mobile-friendly WhatsApp messages in English.
// All ChopWise-branded and self-contained so recipients don't need the app.
// Each template ends with a tappable URL that opens the relevant page.

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function buildNewReservationMessage(
  clientName: string,
  date: Date | string,
  time: string,
  guestCount: number,
  restaurantName: string,
  actionUrl: string
): string {
  return (
    `🍽️ ChopWise — New Booking Request\n\n` +
    `A client wants to book ${restaurantName}:\n\n` +
    `👤 ${clientName}\n` +
    `📅 ${formatDate(date)}\n` +
    `🕐 ${time}\n` +
    `👥 ${guestCount} guest${guestCount > 1 ? "s" : ""}\n\n` +
    `⏰ Respond within 15 minutes:\n${actionUrl}`
  );
}

export function buildReservationAcceptedMessage(
  restaurantName: string,
  date: Date | string,
  time: string,
  paymentDeadlineMinutes: number,
  actionUrl: string
): string {
  return (
    `✅ ChopWise — Booking Accepted!\n\n` +
    `${restaurantName} accepted your reservation for ${formatDate(date)} at ${time}.\n\n` +
    `💳 Pay the booking fee within ${paymentDeadlineMinutes} minutes to confirm your table:\n${actionUrl}`
  );
}

export function buildReservationRejectedMessage(
  restaurantName: string,
  reason: string,
  actionUrl: string
): string {
  return (
    `❌ ChopWise — Booking Declined\n\n` +
    `${restaurantName} was unable to accept your reservation.\n\n` +
    `Reason: ${reason || "No reason provided"}\n\n` +
    `Explore other restaurants:\n${actionUrl}`
  );
}

export function buildReservationConfirmedMessage(
  restaurantName: string,
  clientName: string,
  date: Date | string,
  time: string,
  guestCount: number,
  actionUrl: string
): string {
  return (
    `🎉 ChopWise — Reservation Confirmed!\n\n` +
    `Table booked at ${restaurantName}.\n\n` +
    `👤 ${clientName}\n` +
    `📅 ${formatDate(date)}\n` +
    `🕐 ${time}\n` +
    `👥 ${guestCount} guest${guestCount > 1 ? "s" : ""}\n\n` +
    `View details:\n${actionUrl}`
  );
}

export function buildReservationCancelledMessage(
  restaurantName: string,
  cancelledBy: "CLIENT" | "RESTAURANT" | "SYSTEM",
  reason: string,
  actionUrl: string
): string {
  const actor =
    cancelledBy === "CLIENT"
      ? "The client"
      : cancelledBy === "RESTAURANT"
        ? restaurantName
        : "ChopWise";

  return (
    `⚠️ ChopWise — Reservation Cancelled\n\n` +
    `${actor} cancelled the reservation${
      cancelledBy === "RESTAURANT" ? "" : ` at ${restaurantName}`
    }.\n\n` +
    `Reason: ${reason || "No reason provided"}\n\n` +
    `View details:\n${actionUrl}`
  );
}
