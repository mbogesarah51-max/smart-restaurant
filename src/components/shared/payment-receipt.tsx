"use client";

import { formatPrice } from "@/lib/utils";
import { IS_PAYMENT_SIMULATED } from "@/lib/config";
import { Receipt, Printer } from "lucide-react";

interface PaymentReceiptProps {
  amount: number;
  reference: string;
  method: string;
  date: string;
  status: "success" | "failed" | "pending";
  restaurantName?: string;
}

export function PaymentReceipt({ amount, reference, method, date, status, restaurantName }: PaymentReceiptProps) {
  function handlePrint() {
    window.print();
  }

  const methodLabel = {
    simulated: "Simulated Payment",
    mtn_momo: "MTN Mobile Money",
    orange_money: "Orange Money",
    card: "Card Payment",
  }[method] || method;

  return (
    <div className="relative rounded-xl border border-border/50 bg-white p-5 text-sm">
      {/* Simulated watermark */}
      {IS_PAYMENT_SIMULATED && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-muted/10 -rotate-12 select-none">SIMULATED</span>
        </div>
      )}

      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="size-4 text-brand-orange" />
            <span className="font-semibold text-foreground">Payment Receipt</span>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            status === "success" ? "bg-emerald-100 text-emerald-700" :
            status === "failed" ? "bg-red-100 text-red-700" :
            "bg-amber-100 text-amber-700"
          }`}>
            {status === "success" ? "Paid" : status === "failed" ? "Failed" : "Pending"}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          {restaurantName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Restaurant</span>
              <span className="font-medium text-foreground">{restaurantName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold text-foreground">{formatPrice(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-mono text-xs text-foreground">{reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Method</span>
            <span className="text-foreground">{methodLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="text-foreground">{new Date(date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-xs font-medium text-brand-orange hover:underline mt-2 print:hidden"
        >
          <Printer className="size-3" />
          Download Receipt
        </button>
      </div>
    </div>
  );
}
