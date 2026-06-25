import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRestaurantBySlug } from "@/app/actions/restaurant";
import { ensureExpandedDemoRestaurants } from "@/lib/expanded-demo-restaurants";
import { RestaurantDetail } from "@/components/restaurant/restaurant-detail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureExpandedDemoRestaurants();
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return { title: "Restaurant Not Found" };

  return {
    title: `${restaurant.name} | ChopWise`,
    description: restaurant.description || `Discover ${restaurant.name} in ${restaurant.city}. View menu, photos, and make a reservation.`,
    openGraph: {
      title: restaurant.name,
      description: restaurant.description || `Restaurant in ${restaurant.city}`,
      images: restaurant.bannerImage ? [restaurant.bannerImage] : [],
    },
  };
}

export default async function RestaurantPage({ params }: Props) {
  await ensureExpandedDemoRestaurants();
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return <RestaurantDetail restaurant={restaurant} />;
}
