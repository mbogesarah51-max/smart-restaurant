import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/sections";
import { searchRestaurants, type SearchParams } from "@/app/actions/restaurant";
import { ExploreRestaurants } from "@/components/restaurant/explore-restaurants";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = {
  title: "Explore Restaurants | ChopWise",
  description: "Discover the best restaurants in Cameroon. Browse by location, price range, and amenities.",
};

export default async function PublicExplorePage({ searchParams }: Props) {
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
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <ExploreRestaurants
          initialData={result}
          initialParams={search}
          basePath="/explore"
          detailBasePath="/restaurants"
        />
      </div>
      <Footer />
    </main>
  );
}
