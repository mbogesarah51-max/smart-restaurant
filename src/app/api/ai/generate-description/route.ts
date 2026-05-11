import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type = "restaurant", name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    let prompt: string;
    let fallback: string;

    if (type === "menuItem") {
      const { category = "food" } = body;
      prompt = `Generate a short, appetizing 1-sentence description for a menu item called "${name}" in the ${category.toLowerCase()} category at a restaurant in Cameroon. Keep it under 20 words, make it sound delicious. No quotes.`;
      fallback = `A delicious ${category.toLowerCase()} dish — ${name}, carefully prepared with the finest ingredients.`;
    } else {
      const { city, priceRange, amenities } = body;
      const amenityText = amenities?.length > 0 ? `Amenities: ${amenities.join(", ")}.` : "";
      prompt = `Generate an attractive, professional 2-3 sentence description for a restaurant with these details:
- Name: ${name}
- City: ${city || "Cameroon"}
- Price Range: ${priceRange || "Moderate"}
${amenityText}

Make it warm, inviting, and highlight the dining experience. Keep it under 50 words. No quotes. Third person.`;
      fallback = `Welcome to ${name}, a ${priceRange?.toLowerCase() || "wonderful"} dining destination in ${city || "Cameroon"}. We offer a delightful culinary experience with carefully prepared dishes that celebrate local and continental flavors.`;
    }

    if (!apiKey) {
      return NextResponse.json({ description: fallback });
    }

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: type === "menuItem" ? 60 : 150,
      messages: [{ role: "user", content: prompt }],
    });

    const description = completion.choices[0]?.message?.content?.trim() || fallback;
    return NextResponse.json({ description });
  } catch (error) {
    console.error("AI generate error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}
