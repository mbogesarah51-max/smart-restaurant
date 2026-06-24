import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, UtensilsCrossed } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

const fallbackImages = [
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=85",
];

const priceLabels: Record<string, string> = {
  BUDGET: "Budget friendly",
  MODERATE: "Moderate",
  PREMIUM: "Premium",
  LUXURY: "Luxury",
};

export async function FeaturedRestaurantsSection() {
  let restaurants;

  try {
    restaurants = await prisma.restaurant.findMany({
      where: { isApproved: true, isActive: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { price: "asc" },
          take: 1,
          select: { price: true },
        },
      },
    });
  } catch (error) {
    console.error("[Landing] Unable to load featured restaurants:", error);
    restaurants = [];
  }

  return (
    <section id="featured" className="bg-[#fffaf3] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              Featured restaurants
            </p>
            <h2 className="mt-3 font-heading text-3xl font-extrabold text-[#29170f] sm:text-5xl">
              See the food before choosing the table.
            </h2>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center font-bold text-orange-600 hover:text-orange-500"
          >
            View all restaurants <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {restaurants.length > 0 ? (
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant, index) => {
              const startingPrice = restaurant.menuItems[0]?.price;

              return (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${restaurant.slug}`}
                  className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-950/10"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-orange-50">
                    <Image
                      src={restaurant.bannerImage || fallbackImages[index % fallbackImages.length]}
                      alt={`${restaurant.name} food and dining experience`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#29170f] backdrop-blur">
                      {priceLabels[restaurant.priceRange] || restaurant.priceRange}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-extrabold text-[#29170f]">
                      {restaurant.name}
                    </h3>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      {restaurant.city} · {restaurant.address}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <UtensilsCrossed className="h-4 w-4 text-orange-500" />
                        {startingPrice
                          ? `Meals from ${formatPrice(startingPrice)}`
                          : "View menu"}
                      </span>
                      <ArrowRight className="h-4 w-4 text-orange-600 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-9 overflow-hidden rounded-3xl border border-orange-100 bg-white">
            <div className="grid md:grid-cols-2 md:items-center">
              <div className="relative min-h-72">
                <Image
                  src={fallbackImages[0]}
                  alt="Appetising restaurant dish"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-8 lg:p-12">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                  Restaurant onboarding
                </p>
                <h3 className="mt-3 text-3xl font-extrabold text-[#29170f]">
                  Approved restaurants will appear here.
                </h3>
                <p className="mt-4 text-muted-foreground">
                  Restaurant owners can create a profile, upload real food photographs and submit the listing for approval.
                </p>
                <Link
                  href="/sign-up?role=owner"
                  className="mt-6 inline-flex items-center font-bold text-orange-600"
                >
                  Register a restaurant <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
