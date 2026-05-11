import type { ReservationStatus } from "@/generated/prisma/client";

// Valid transitions: from → allowed targets
const VALID_TRANSITIONS: Record<string, ReservationStatus[]> = {
  PENDING: ["AWAITING_RESPONSE", "CANCELLED"],
  AWAITING_RESPONSE: ["ACCEPTED", "PAYMENT_PENDING", "REJECTED", "CANCELLED"],
  ACCEPTED: ["PAYMENT_PENDING", "CANCELLED"],
  PAYMENT_PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  REJECTED: [], // terminal
  CANCELLED: [], // terminal
};

export function canTransitionTo(from: string, to: ReservationStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isTerminal(status: string): boolean {
  return status === "REJECTED" || status === "CANCELLED";
}

export function isCancellable(status: string): boolean {
  return ["AWAITING_RESPONSE", "ACCEPTED", "PAYMENT_PENDING", "CONFIRMED", "PENDING"].includes(status);
}
