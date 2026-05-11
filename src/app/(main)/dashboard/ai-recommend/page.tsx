import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { AIRecommend } from "@/components/dashboard/ai-recommend";

export const metadata: Metadata = {
  title: "AI Recommendations | ChopWise",
  description: "Tell ChopWise AI what you're craving and get personalized restaurant picks.",
};

export default async function AIRecommendPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role === "RESTAURANT_OWNER") redirect("/dashboard/restaurant");
  if (user.role === "ADMIN") redirect("/dashboard/admin");

  return <AIRecommend />;
}
