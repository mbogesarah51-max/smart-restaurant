import type { User, Restaurant, MenuItem, Reservation, AvailabilitySlot } from "@/generated/prisma/client";

export type SafeUser = Omit<User, "passwordHash">;

export type UserWithRestaurants = SafeUser & {
  restaurants: Restaurant[];
};

export type RestaurantWithOwner = Restaurant & {
  owner: SafeUser;
};

export type RestaurantWithDetails = Restaurant & {
  owner: SafeUser;
  menuItems: MenuItem[];
  availabilitySlots: AvailabilitySlot[];
};

export type ReservationWithDetails = Reservation & {
  user: SafeUser;
  restaurant: Restaurant;
};

export type ActionResponse<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  token?: string;
};

// ─── AI Recommendation Types ────────────────────────────────────────────────

export interface AIRecommendation {
  restaurantId: string;
  restaurantName: string;
  slug: string;
  matchScore: number;
  shortDescription: string;
  estimatedCostPerPerson: number;
  reason: string;
  suggestedItems: {
    name: string;
    price: number;
    why: string;
  }[];
  bestFor: string;
}

export interface AIRecommendationResponse {
  understanding: string;
  recommendations: AIRecommendation[];
  tips?: string;
  followUp?: string;
}

export interface ConversationTurn {
  id: string;
  userMessage: string;
  response: AIRecommendationResponse | null;
  isLoading: boolean;
  error?: string;
  timestamp: Date;
}
