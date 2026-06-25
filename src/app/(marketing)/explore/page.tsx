import { Navbar } from "@/components/landing/navbar";
import { FoodieFooter } from "@/components/landing/foodie-footer";
import { searchRestaurants, type SearchParams } from "@/app/actions/restaurant";
import { ensureExpandedDemoRestaurants } from "@/lib/expanded-demo-restaurants";
import { RealisticExplore } from "@/components/restaurant/realistic-explore";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = {
  title: "Explore Restaurants in Cameroon | ChopWise",
  description: "Discover affordable, premium and luxury restaurant experiences in Douala, Yaoundé, Limbe and Buea.",
};

export default async function PublicExplorePage({ searchParams }: Props) {
  await ensureExpandedDemoRestaurants();
  const params = await searchParams;

  const search: SearchParams = {
    query: typeof params.q === "string" ? params.q : undefined,
    priceRange: typeof params.price === "string" ? params.price.split(",") : undefined,
    city: typeof params.city === "string" ? params.city : undefined,
    amenities: typeof params.amenities === "string" ? params.amenities.split(",") : undefined,
    sort: (params.sort as SearchParams["sort"]) || "newest",
    page: params.page ? parseInt(params.page as string, 10) : 1,
    limit: 12,
  };

  const result = await searchRestaurants(search);

  return (
    <main className="min-h-screen bg-[#fffaf5]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <RealisticExplore initialData={result} initialParams={search} />
      </div>
      <FoodieFooter />
    </main>
  );
}
