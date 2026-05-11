import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { searchRestaurants, type SearchParams } from "@/app/actions/restaurant";
import { ExploreRestaurants } from "@/components/restaurant/explore-restaurants";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ExplorePage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

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
    <ExploreRestaurants
      initialData={result}
      initialParams={search}
    />
  );
}
