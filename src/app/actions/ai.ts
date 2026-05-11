"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import type { ActionResponse, AIRecommendationResponse, AIRecommendation } from "@/types";

const recommendSchema = z.object({
  userMessage: z
    .string()
    .min(1, "Please enter a message")
    .max(500, "Message is too long")
    .trim(),
});

const SYSTEM_PROMPT = `You are ChopWise AI, a friendly restaurant recommendation assistant for diners in Cameroon.

You know Cameroonian cuisine intimately — Ndolé, Eru, Achu, Poulet DG, Koki, grilled fish, brochettes, Bissap, palm wine, Garri, Soya — and the dining culture across cities like Douala, Yaoundé, Bafoussam, Limbe, Buea, Kribi.

Your job: take a user's natural-language query and recommend the best matches from the restaurants provided in the JSON dataset below. Consider:
- Budget (FCFA / XAF) — match menu prices against stated budget per person
- Occasion (romantic, casual, family, business, celebration)
- Group size and amenities (outdoor seating, parking, Wi-Fi, etc.)
- City/location preferences
- Cuisine style implied by their query (traditional, continental, drinks, desserts, breakfast, fine dining)
- Price tier (BUDGET/MODERATE/PREMIUM/LUXURY)

CRITICAL RULES:
1. ONLY recommend restaurants from the dataset I give you — never invent restaurants or IDs.
2. ONLY use the exact restaurantId values from the dataset.
3. Return a maximum of 5 recommendations, ranked by best match first.
4. If the query is impossible (e.g., budget too low for everything available), recommend the closest matches and explain.
5. Estimate cost per person realistically based on their menu items.
6. Return STRICT JSON ONLY — no markdown fences, no prose, no explanation outside the JSON.

The "understanding" field should be conversational and warm, starting with something like "Perfect!", "Great choice!", "Got it!", "Lovely!", or "Nice!" — like a friendly local helping a friend.

Response schema (return EXACTLY this shape):
{
  "understanding": "string (1-2 sentence warm summary)",
  "recommendations": [
    {
      "restaurantId": "string (must match dataset)",
      "restaurantName": "string",
      "matchScore": number (0-100),
      "shortDescription": "string (≤8 words, vibe/highlight)",
      "estimatedCostPerPerson": number (FCFA),
      "reason": "string (2-3 sentences why it fits)",
      "suggestedItems": [
        { "name": "string", "price": number, "why": "string (≤12 words)" }
      ],
      "bestFor": "string (≤6 words, e.g. 'Romantic dinners with a view')"
    }
  ],
  "tips": "string (optional, 1 helpful local tip)",
  "followUp": "string (optional, suggested next question for the user)"
}`;

interface RestaurantContext {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  priceRange: string;
  amenities: string[];
  bannerImage: string | null;
  menuItems: { name: string; price: number; category: string; description: string | null }[];
  hours: { dayOfWeek: number; openTime: string; closeTime: string }[];
}

function buildRestaurantContext(restaurants: RestaurantContext[]): string {
  // Trim to keep prompt tokens reasonable
  return JSON.stringify(
    restaurants.map((r) => ({
      restaurantId: r.id,
      name: r.name,
      city: r.city,
      priceRange: r.priceRange,
      amenities: r.amenities,
      description: r.description?.slice(0, 200) ?? null,
      menu: r.menuItems.slice(0, 30).map((m) => ({
        name: m.name,
        price: m.price,
        category: m.category,
      })),
      hours: r.hours.map((h) => ({
        day: h.dayOfWeek,
        open: h.openTime,
        close: h.closeTime,
      })),
    }))
  );
}

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function getAIRecommendations(
  userMessage: string
): Promise<ActionResponse<AIRecommendationResponse>> {
  try {
    return await runRecommendation(userMessage);
  } catch (error) {
    console.error("[AI Recommend] Unhandled error:", error);
    const detail = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: `Something went wrong: ${detail}`,
    };
  }
}

async function runRecommendation(
  userMessage: string
): Promise<ActionResponse<AIRecommendationResponse>> {
  let userId: string | null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch (authError) {
    console.error("[AI Recommend] auth() failed:", authError);
    return { success: false, message: "Authentication check failed. Please try again." };
  }

  if (!userId) {
    return { success: false, message: "You need to be signed in to get recommendations." };
  }

  const validated = recommendSchema.safeParse({ userMessage });
  if (!validated.success) {
    return {
      success: false,
      message: validated.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Fetch all approved + active restaurants with relevant relations
  let restaurants;
  try {
    restaurants = await prisma.restaurant.findMany({
    where: { isApproved: true, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      city: true,
      priceRange: true,
      amenities: true,
      bannerImage: true,
      menuItems: {
        where: { isAvailable: true },
        select: {
          name: true,
          price: true,
          category: true,
          description: true,
        },
      },
      availabilitySlots: {
        where: { isActive: true },
        select: {
          dayOfWeek: true,
          openTime: true,
          closeTime: true,
        },
      },
    },
    });
  } catch (dbError) {
    console.error("[AI Recommend] DB query failed:", dbError);
    return {
      success: false,
      message:
        "Could not load restaurants. The database is unreachable — check your connection and try again.",
    };
  }

  if (restaurants.length === 0) {
    return {
      success: true,
      message: "No restaurants available yet",
      data: {
        understanding:
          "There aren't any restaurants on ChopWise yet. Check back soon — we're onboarding new spots every week!",
        recommendations: [],
      },
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[AI Recommend] OPENAI_API_KEY not configured");
    return {
      success: false,
      message: "AI recommendations are temporarily unavailable. Try again soon.",
    };
  }

  // Build context
  const context: RestaurantContext[] = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    city: r.city,
    priceRange: r.priceRange,
    amenities: r.amenities,
    bannerImage: r.bannerImage,
    menuItems: r.menuItems,
    hours: r.availabilitySlots,
  }));

  const userPrompt =
    `User query: "${validated.data.userMessage}"\n\n` +
    `Available restaurants (JSON):\n${buildRestaurantContext(context)}`;

  let aiText: string;
  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    aiText = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!aiText) {
      return {
        success: false,
        message: "I couldn't come up with recommendations right now. Try rephrasing?",
      };
    }
  } catch (error) {
    console.error("[AI Recommend] OpenAI error:", error);
    return {
      success: false,
      message: "AI is taking a break. Please try again in a moment.",
    };
  }

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFences(aiText));
  } catch (error) {
    console.error("[AI Recommend] Failed to parse AI JSON:", error, aiText.slice(0, 200));
    return {
      success: false,
      message: "I had trouble organizing my thoughts. Try asking again?",
    };
  }

  // Validate shape
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("recommendations" in parsed) ||
    !Array.isArray((parsed as { recommendations: unknown }).recommendations)
  ) {
    console.error("[AI Recommend] Malformed AI response shape", parsed);
    return {
      success: false,
      message: "I got a bit confused. Try rephrasing your question?",
    };
  }

  const raw = parsed as {
    understanding?: unknown;
    recommendations: unknown[];
    tips?: unknown;
    followUp?: unknown;
  };

  // Build a lookup so we can validate IDs and enrich with slug
  const byId = new Map(restaurants.map((r) => [r.id, r]));

  const enriched: AIRecommendation[] = raw.recommendations
    .map((rec): AIRecommendation | null => {
      if (typeof rec !== "object" || rec === null) return null;
      const r = rec as Record<string, unknown>;

      const restaurantId = typeof r.restaurantId === "string" ? r.restaurantId : null;
      if (!restaurantId) return null;

      const dbRestaurant = byId.get(restaurantId);
      if (!dbRestaurant) return null; // hallucinated ID — drop it

      const suggestedItemsRaw = Array.isArray(r.suggestedItems) ? r.suggestedItems : [];
      const suggestedItems = suggestedItemsRaw
        .map((item) => {
          if (typeof item !== "object" || item === null) return null;
          const i = item as Record<string, unknown>;
          return {
            name: typeof i.name === "string" ? i.name : "",
            price: typeof i.price === "number" ? i.price : 0,
            why: typeof i.why === "string" ? i.why : "",
          };
        })
        .filter((x): x is { name: string; price: number; why: string } => x !== null && !!x.name);

      return {
        restaurantId,
        restaurantName: dbRestaurant.name,
        slug: dbRestaurant.slug,
        matchScore: Math.max(0, Math.min(100, Number(r.matchScore) || 0)),
        shortDescription: typeof r.shortDescription === "string" ? r.shortDescription : "",
        estimatedCostPerPerson:
          typeof r.estimatedCostPerPerson === "number" ? r.estimatedCostPerPerson : 0,
        reason: typeof r.reason === "string" ? r.reason : "",
        suggestedItems,
        bestFor: typeof r.bestFor === "string" ? r.bestFor : "",
      };
    })
    .filter((x): x is AIRecommendation => x !== null)
    .slice(0, 5);

  return {
    success: true,
    message: "Recommendations ready",
    data: {
      understanding:
        typeof raw.understanding === "string" && raw.understanding.trim()
          ? raw.understanding
          : enriched.length > 0
            ? "Here are some great matches for you:"
            : "I couldn't find an exact match for that. Try adjusting your budget or location?",
      recommendations: enriched,
      tips: typeof raw.tips === "string" ? raw.tips : undefined,
      followUp: typeof raw.followUp === "string" ? raw.followUp : undefined,
    },
  };
}
