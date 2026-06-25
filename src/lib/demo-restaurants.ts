import prisma from "@/lib/prisma";
import { MenuCategory, PriceRange, Role } from "@/generated/prisma/client";

const commonHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
  dayOfWeek,
  openTime: dayOfWeek === 0 ? "12:00" : "10:00",
  closeTime: dayOfWeek === 0 ? "22:00" : "23:00",
  maxCapacity: 80,
  isActive: true,
}));

const restaurants = [
  {
    name: "Bonapriso Grill House",
    slug: "bonapriso-grill-house",
    city: "Douala",
    address: "Rue Njo-Njo, Bonapriso",
    phone: "+237650100101",
    latitude: 4.0274,
    longitude: 9.7043,
    priceRange: PriceRange.PREMIUM,
    bannerImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=88",
    description: "A polished grill restaurant serving smoky steaks, chicken, seafood and generous Cameroonian sides in a warm contemporary setting.",
    amenities: ["Parking", "Air Conditioning", "Wi-Fi", "Private Dining"],
    menu: [
      ["Charcoal Grilled Chicken", 7500, MenuCategory.FOOD, "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85"],
      ["Pepper Steak Platter", 12000, MenuCategory.FOOD, "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=85"],
      ["Passion Fruit Mocktail", 3000, MenuCategory.DRINK, "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85"],
    ],
  },
  {
    name: "Wouri Rooftop Dining",
    slug: "wouri-rooftop-dining",
    city: "Douala",
    address: "Boulevard de la Liberté, Akwa",
    phone: "+237650100102",
    latitude: 4.0511,
    longitude: 9.7085,
    priceRange: PriceRange.LUXURY,
    bannerImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=88",
    description: "An elegant rooftop restaurant for date nights, executive dinners and celebrations, with city views and refined continental cuisine.",
    amenities: ["VIP Section", "Private Dining", "Air Conditioning", "Live Music", "Parking"],
    menu: [
      ["Herb Butter Salmon", 16500, MenuCategory.FOOD, "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=85"],
      ["Ribeye Steak", 22000, MenuCategory.FOOD, "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85"],
      ["Chocolate Fondant", 6000, MenuCategory.DESSERT, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85"],
    ],
  },
  {
    name: "Akwa Street Kitchen",
    slug: "akwa-street-kitchen",
    city: "Douala",
    address: "Rue Joss, Akwa",
    phone: "+237650100103",
    latitude: 4.0487,
    longitude: 9.6997,
    priceRange: PriceRange.BUDGET,
    bannerImage: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=88",
    description: "A lively casual spot for quick lunches, grilled fish, soya, plantain and affordable local favourites.",
    amenities: ["TV/Screens", "Generator/Power Backup", "Kids Friendly"],
    menu: [
      ["Soya and Plantain", 3000, MenuCategory.FOOD, "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85"],
      ["Grilled Fish and Miondo", 5000, MenuCategory.FOOD, "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85"],
      ["Bissap", 1000, MenuCategory.DRINK, "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85"],
    ],
  },
  {
    name: "Bastos Garden Table",
    slug: "bastos-garden-table",
    city: "Yaoundé",
    address: "Quartier Bastos, near the embassies",
    phone: "+237650100104",
    latitude: 3.8967,
    longitude: 11.5147,
    priceRange: PriceRange.LUXURY,
    bannerImage: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1400&q=88",
    description: "A quiet garden restaurant offering sophisticated plates, attentive service and private spaces for formal dining.",
    amenities: ["Outdoor Seating", "Private Dining", "Parking", "Wi-Fi", "Wheelchair Accessible"],
    menu: [
      ["Filet Mignon", 20000, MenuCategory.FOOD, "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=85"],
      ["Creamy Prawn Pasta", 13500, MenuCategory.FOOD, "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85"],
      ["Classic Tiramisu", 5500, MenuCategory.DESSERT, "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=85"],
    ],
  },
  {
    name: "Mfoundi Heritage Kitchen",
    slug: "mfoundi-heritage-kitchen",
    city: "Yaoundé",
    address: "Avenue Kennedy, Centre Ville",
    phone: "+237650100105",
    latitude: 3.8668,
    longitude: 11.5161,
    priceRange: PriceRange.MODERATE,
    bannerImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=88",
    description: "A welcoming restaurant celebrating Cameroonian recipes including ndolé, eru, achu and poulet DG.",
    amenities: ["Air Conditioning", "Kids Friendly", "Generator/Power Backup", "Wi-Fi"],
    menu: [
      ["Ndolé with Plantain", 5000, MenuCategory.FOOD, "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=900&q=85"],
      ["Poulet DG", 7000, MenuCategory.FOOD, "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85"],
      ["Fresh Pineapple Juice", 1800, MenuCategory.DRINK, "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=900&q=85"],
    ],
  },
  {
    name: "Essos Quick Bites",
    slug: "essos-quick-bites",
    city: "Yaoundé",
    address: "Carrefour Essos",
    phone: "+237650100106",
    latitude: 3.8692,
    longitude: 11.5359,
    priceRange: PriceRange.BUDGET,
    bannerImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1400&q=88",
    description: "A compact neighbourhood eatery serving burgers, rice dishes, shawarma and quick meals at student-friendly prices.",
    amenities: ["TV/Screens", "Wi-Fi", "Takeaway"],
    menu: [
      ["Beef Burger and Fries", 3500, MenuCategory.FOOD, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85"],
      ["Chicken Shawarma", 2500, MenuCategory.FOOD, "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=85"],
      ["Ginger Juice", 1000, MenuCategory.DRINK, "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=85"],
    ],
  },
  {
    name: "Atlantic Catch Limbe",
    slug: "atlantic-catch-limbe",
    city: "Limbe",
    address: "Down Beach Road",
    phone: "+237650100107",
    latitude: 4.0147,
    longitude: 9.2085,
    priceRange: PriceRange.PREMIUM,
    bannerImage: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1400&q=88",
    description: "A coastal seafood restaurant known for fresh grilled fish, prawns and relaxed ocean-facing dining.",
    amenities: ["Outdoor Seating", "Parking", "Live Music", "Kids Friendly"],
    menu: [
      ["Whole Grilled Sea Bass", 10000, MenuCategory.FOOD, "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85"],
      ["Garlic Butter Prawns", 12500, MenuCategory.FOOD, "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=85"],
      ["Coconut Mocktail", 2500, MenuCategory.DRINK, "https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=900&q=85"],
    ],
  },
  {
    name: "Botanic Café Limbe",
    slug: "botanic-cafe-limbe",
    city: "Limbe",
    address: "Botanic Garden Area",
    phone: "+237650100108",
    latitude: 4.0185,
    longitude: 9.2026,
    priceRange: PriceRange.BUDGET,
    bannerImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400&q=88",
    description: "A small leafy café for breakfast, pastries, coffee and light meals close to Limbe's botanical attractions.",
    amenities: ["Outdoor Seating", "Wi-Fi", "Kids Friendly"],
    menu: [
      ["English Breakfast", 4000, MenuCategory.FOOD, "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=85"],
      ["Chicken Sandwich", 3000, MenuCategory.FOOD, "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=85"],
      ["Cappuccino", 1800, MenuCategory.DRINK, "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=85"],
    ],
  },
  {
    name: "Mountain View Bistro",
    slug: "mountain-view-bistro-buea",
    city: "Buea",
    address: "Upper Farms, Great Soppo",
    phone: "+237650100109",
    latitude: 4.1676,
    longitude: 9.2419,
    priceRange: PriceRange.PREMIUM,
    bannerImage: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1400&q=88",
    description: "A stylish bistro with mountain views, a calm atmosphere and a menu mixing local favourites with modern continental dishes.",
    amenities: ["Outdoor Seating", "Parking", "Wi-Fi", "Private Dining"],
    menu: [
      ["Grilled Salmon", 13000, MenuCategory.FOOD, "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=85"],
      ["Chicken Alfredo", 8500, MenuCategory.FOOD, "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85"],
      ["Warm Brownie", 4500, MenuCategory.DESSERT, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85"],
    ],
  },
  {
    name: "Molyko Chop Corner",
    slug: "molyko-chop-corner",
    city: "Buea",
    address: "Molyko, near the university junction",
    phone: "+237650100110",
    latitude: 4.1519,
    longitude: 9.2894,
    priceRange: PriceRange.BUDGET,
    bannerImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1400&q=88",
    description: "A busy student-friendly restaurant serving filling plates, pizza, burgers and local meals at accessible prices.",
    amenities: ["Wi-Fi", "TV/Screens", "Generator/Power Backup", "Takeaway"],
    menu: [
      ["Chicken Pizza", 4500, MenuCategory.FOOD, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85"],
      ["Jollof Rice and Chicken", 3000, MenuCategory.FOOD, "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=85"],
      ["Fresh Juice", 1200, MenuCategory.DRINK, "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=900&q=85"],
    ],
  },
  {
    name: "Bonduma Garden Restaurant",
    slug: "bonduma-garden-restaurant",
    city: "Buea",
    address: "Bonduma Gate",
    phone: "+237650100111",
    latitude: 4.1448,
    longitude: 9.2773,
    priceRange: PriceRange.MODERATE,
    bannerImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=88",
    description: "A spacious garden restaurant suited to families, groups and celebrations, with local dishes and grilled specialities.",
    amenities: ["Outdoor Seating", "Parking", "Kids Friendly", "Live Music"],
    menu: [
      ["Eru and Water Fufu", 4500, MenuCategory.FOOD, "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85"],
      ["Grilled Pork Platter", 7000, MenuCategory.FOOD, "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85"],
      ["Fruit Cocktail", 2200, MenuCategory.DRINK, "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85"],
    ],
  },
];

export async function ensureDemoRestaurants(): Promise<void> {
  if (process.env.ENABLE_DEMO_DATA === "false") return;

  const approvedCount = await prisma.restaurant.count({ where: { isApproved: true, isActive: true } });
  if (approvedCount >= 8) return;

  const owner = await prisma.user.upsert({
    where: { email: "demo-owner@chopwise.cm" },
    update: { isActive: true },
    create: {
      name: "ChopWise Demo Restaurants",
      email: "demo-owner@chopwise.cm",
      phone: "+237650100100",
      passwordHash: "demo-catalogue-not-for-login",
      role: Role.RESTAURANT_OWNER,
      isActive: true,
    },
  });

  for (const item of restaurants) {
    const restaurant = await prisma.restaurant.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        bannerImage: item.bannerImage,
        galleryImages: [item.bannerImage],
        phone: item.phone,
        whatsapp: item.phone,
        address: item.address,
        city: item.city,
        latitude: item.latitude,
        longitude: item.longitude,
        priceRange: item.priceRange,
        amenities: item.amenities,
        isApproved: true,
        isActive: true,
      },
      create: {
        ownerId: owner.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        bannerImage: item.bannerImage,
        galleryImages: [item.bannerImage],
        phone: item.phone,
        whatsapp: item.phone,
        email: `${item.slug}@chopwise-demo.cm`,
        address: item.address,
        city: item.city,
        latitude: item.latitude,
        longitude: item.longitude,
        priceRange: item.priceRange,
        amenities: item.amenities,
        isApproved: true,
        isActive: true,
      },
    });

    const menuCount = await prisma.menuItem.count({ where: { restaurantId: restaurant.id } });
    if (menuCount === 0) {
      await prisma.menuItem.createMany({
        data: item.menu.map(([name, price, category, image]) => ({
          restaurantId: restaurant.id,
          name: String(name),
          price: Number(price),
          category: category as MenuCategory,
          image: String(image),
          description: `A popular choice at ${item.name}.`,
          isAvailable: true,
        })),
      });
    }

    const slotCount = await prisma.availabilitySlot.count({ where: { restaurantId: restaurant.id } });
    if (slotCount === 0) {
      await prisma.availabilitySlot.createMany({
        data: commonHours.map((slot) => ({ ...slot, restaurantId: restaurant.id })),
      });
    }
  }
}
