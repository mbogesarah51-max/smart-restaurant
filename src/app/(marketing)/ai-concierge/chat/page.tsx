import type { Metadata } from "next";
import { AiChatExperience } from "@/components/landing/ai-chat";

export const metadata: Metadata = {
  title: "Chat with ChopWise AI",
  description:
    "Chat with ChopWise AI to discover restaurants across Cameroon by budget, city, cuisine and occasion — no sign-up needed.",
};

export default function AIChatPage() {
  return <AiChatExperience />;
}
