import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { FoodieFooter } from "@/components/landing/foodie-footer";
import { getRestaurantBySlug } from "@/app/actions/restaurant";
import { RestaurantDetail } from "@/components/restaurant/restaurant-detail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return { title: "Restaurant Not Found" };

  return {
    title: `${restaurant.name} | ChopWise`,
    description: restaurant.description || `Discover ${restaurant.name} in ${restaurant.city}. View menu, photos, prices and make a reservation.`,
    openGraph: {
      title: restaurant.name,
      description: restaurant.description || `Restaurant in ${restaurant.city}`,
      images: restaurant.bannerImage ? [restaurant.bannerImage] : [],
    },
  };
}

export default async function PublicRestaurantPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return (
    <main className="min-h-screen bg-[#fffaf5]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <RestaurantDetail restaurant={restaurant} explorePath="/explore" />
      </div>
      <FoodieFooter />
    </main>
  );
}
