import prisma from "@/lib/prisma";
import { MenuCategory, PriceRange, Role } from "@/generated/prisma/client";

type DemoMenu = {
  name: string;
  price: number;
  category: MenuCategory;
  image: string;
};

type DemoRestaurant = {
  name: string;
  slug: string;
  city: "Douala" | "Yaoundé" | "Limbe" | "Buea";
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  priceRange: PriceRange;
  bannerImage: string;
  description: string;
  amenities: string[];
  menu: DemoMenu[];
};

const IMAGES = {
  elegant: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=88",
  dining: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=88",
  grill: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=88",
  fish: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1400&q=88",
  pasta: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1400&q=88",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1400&q=88",
  pizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1400&q=88",
  cafe: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400&q=88",
  dessert: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1400&q=88",
  local: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=88",
  chicken: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1400&q=88",
  steak: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1400&q=88",
  juice: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=1400&q=88",
};

const extraRestaurants: DemoRestaurant[] = [
  {
    name: "Bonamoussadi Family Kitchen",
    slug: "bonamoussadi-family-kitchen",
    city: "Douala",
    address: "Denver, Bonamoussadi",
    phone: "+237650100112",
    latitude: 4.0895,
    longitude: 9.7397,
    priceRange: PriceRange.MODERATE,
    bannerImage: IMAGES.local,
    description: "A spacious family restaurant serving Cameroonian classics, grilled dishes and generous sharing platters.",
    amenities: ["Parking", "Kids Friendly", "Air Conditioning", "Generator/Power Backup"],
    menu: [
      { name: "Poulet DG", price: 7000, category: MenuCategory.FOOD, image: IMAGES.chicken },
      { name: "Ndolé and Plantain", price: 5500, category: MenuCategory.FOOD, image: IMAGES.local },
      { name: "Fresh Pineapple Juice", price: 1800, category: MenuCategory.DRINK, image: IMAGES.juice },
    ],
  },
  {
    name: "Makepe Urban Bites",
    slug: "makepe-urban-bites",
    city: "Douala",
    address: "Rond-point Petit Pays, Makepe",
    phone: "+237650100113",
    latitude: 4.0794,
    longitude: 9.7424,
    priceRange: PriceRange.BUDGET,
    bannerImage: IMAGES.burger,
    description: "A lively casual restaurant popular for burgers, shawarma, pizza and quick meals at accessible prices.",
    amenities: ["Wi-Fi", "TV/Screens", "Takeaway", "Generator/Power Backup"],
    menu: [
      { name: "Double Beef Burger", price: 4000, category: MenuCategory.FOOD, image: IMAGES.burger },
      { name: "Chicken Shawarma", price: 2500, category: MenuCategory.FOOD, image: IMAGES.chicken },
      { name: "Ginger Juice", price: 1000, category: MenuCategory.DRINK, image: IMAGES.juice },
    ],
  },
  {
    name: "Deido River Grill",
    slug: "deido-river-grill",
    city: "Douala",
    address: "Ancien Route, Deido",
    phone: "+237650100114",
    latitude: 4.0639,
    longitude: 9.7018,
    priceRange: PriceRange.PREMIUM,
    bannerImage: IMAGES.grill,
    description: "A modern grill house featuring charcoal meats, seafood and relaxed evening dining near the Wouri corridor.",
    amenities: ["Parking", "Outdoor Seating", "Live Music", "Wi-Fi"],
    menu: [
      { name: "Mixed Grill Platter", price: 14000, category: MenuCategory.FOOD, image: IMAGES.grill },
      { name: "Grilled Sea Bass", price: 11000, category: MenuCategory.FOOD, image: IMAGES.fish },
      { name: "Tropical Mocktail", price: 3000, category: MenuCategory.DRINK, image: IMAGES.juice },
    ],
  },
  {
    name: "Kotto Terrace",
    slug: "kotto-terrace",
    city: "Douala",
    address: "Kotto, Bonamoussadi",
    phone: "+237650100115",
    latitude: 4.1033,
    longitude: 9.7487,
    priceRange: PriceRange.PREMIUM,
    bannerImage: IMAGES.elegant,
    description: "A stylish terrace restaurant for brunches, group dinners and weekend celebrations with polished service.",
    amenities: ["Outdoor Seating", "Parking", "Private Dining", "Air Conditioning"],
    menu: [
      { name: "Creamy Prawn Pasta", price: 11500, category: MenuCategory.FOOD, image: IMAGES.pasta },
      { name: "Pepper Steak", price: 15000, category: MenuCategory.FOOD, image: IMAGES.steak },
      { name: "Chocolate Cake", price: 4500, category: MenuCategory.DESSERT, image: IMAGES.dessert },
    ],
  },
  {
    name: "Logpom Garden Eatery",
    slug: "logpom-garden-eatery",
    city: "Douala",
    address: "Logpom, opposite the market road",
    phone: "+237650100116",
    latitude: 4.0957,
    longitude: 9.7691,
    priceRange: PriceRange.MODERATE,
    bannerImage: IMAGES.dining,
    description: "A relaxed garden setting serving local meals, grilled chicken and family-sized portions throughout the week.",
    amenities: ["Outdoor Seating", "Kids Friendly", "Parking", "Live Music"],
    menu: [
      { name: "Grilled Chicken and Plantain", price: 6500, category: MenuCategory.FOOD, image: IMAGES.chicken },
      { name: "Eru and Water Fufu", price: 4500, category: MenuCategory.FOOD, image: IMAGES.local },
      { name: "Watermelon Juice", price: 1500, category: MenuCategory.DRINK, image: IMAGES.juice },
    ],
  },
  {
    name: "Odza Savour House",
    slug: "odza-savour-house",
    city: "Yaoundé",
    address: "Carrefour Mbog Abang, Odza",
    phone: "+237650100117",
    latitude: 3.8124,
    longitude: 11.5272,
    priceRange: PriceRange.MODERATE,
    bannerImage: IMAGES.local,
    description: "A comfortable neighbourhood restaurant offering local cuisine, grilled meat and dependable family service.",
    amenities: ["Parking", "Kids Friendly", "Air Conditioning", "Wi-Fi"],
    menu: [
      { name: "Achu and Yellow Soup", price: 5000, category: MenuCategory.FOOD, image: IMAGES.local },
      { name: "Grilled Pork", price: 7000, category: MenuCategory.FOOD, image: IMAGES.grill },
      { name: "Foléré", price: 1200, category: MenuCategory.DRINK, image: IMAGES.juice },
    ],
  },
  {
    name: "Biyem-Assi Food Court",
    slug: "biyem-assi-food-court",
    city: "Yaoundé",
    address: "Carrefour Biyem-Assi",
    phone: "+237650100118",
    latitude: 3.8468,
    longitude: 11.4884,
    priceRange: PriceRange.BUDGET,
    bannerImage: IMAGES.pizza,
    description: "A convenient low-cost food court with pizza, rice dishes, grilled chicken and takeaway service.",
    amenities: ["Takeaway", "TV/Screens", "Generator/Power Backup", "Kids Friendly"],
    menu: [
      { name: "Chicken Pizza", price: 4500, category: MenuCategory.FOOD, image: IMAGES.pizza },
      { name: "Jollof Rice and Chicken", price: 3000, category: MenuCategory.FOOD, image: IMAGES.chicken },
      { name: "Orange Juice", price: 1200, category: MenuCategory.DRINK, image: IMAGES.juice },
    ],
  },
  {
    name: "Etoa-Meki Executive Lounge",
    slug: "etoa-meki-executive-lounge",
    city: "Yaoundé",
    address: "Etoa-Meki, near the central avenue",
    phone: "+237650100119",
    latitude: 3.8827,
    longitude: 11.5306,
    priceRange: PriceRange.LUXURY,
    bannerImage: IMAGES.elegant,
    description: "A classy dining lounge designed for executive meetings, date nights and premium private events.",
    amenities: ["VIP Section", "Private Dining", "Parking", "Air Conditioning", "Live Music"],
    menu: [
      { name: "Tenderloin Steak", price: 23000, category: MenuCategory.FOOD, image: IMAGES.steak },
      { name: "Grilled Salmon", price: 18000, category: MenuCategory.FOOD, image: IMAGES.fish },
      { name: "Tiramisu", price: 6000, category: MenuCategory.DESSERT, image: IMAGES.dessert },
    ],
  },
  {
    name: "Ngoa-Ekelle Student Canteen",
    slug: "ngoa-ekelle-student-canteen",
    city: "Yaoundé",
    address: "Ngoa-Ekelle, university neighbourhood",
    phone: "+237650100120",
    latitude: 3.8616,
    longitude: 11.5008,
    priceRange: PriceRange.BUDGET,
    bannerImage: IMAGES.local,
    description: "A simple student-focused canteen serving filling local meals quickly and at highly accessible prices.",
    amenities: ["Takeaway", "TV/Screens", "Generator/Power Backup"],
    menu: [
      { name: "Rice and Beans", price: 1800, category: MenuCategory.FOOD, image: IMAGES.local },
      { name: "Spaghetti Omelette", price: 2000, category: MenuCategory.FOOD, image: IMAGES.pasta },
      { name: "Ginger Drink", price: 800, category: MenuCategory.DRINK, image: IMAGES.juice },
    ],
  },
  {
    name: "Mvan Continental Table",
    slug: "mvan-continental-table",
    city: "Yaoundé",
    address: "Mvan, near the bus terminal",
    phone: "+237650100121",
    latitude: 3.8297,
    longitude: 11.5288,
    priceRange: PriceRange.PREMIUM,
    bannerImage: IMAGES.dining,
    description: "A polished continental restaurant with pasta, steak, seafood and quiet indoor seating.",
    amenities: ["Parking", "Air Conditioning", "Wi-Fi", "Private Dining"],
    menu: [
      { name: "Seafood Pasta", price: 12500, category: MenuCategory.FOOD, image: IMAGES.pasta },
      { name: "Ribeye Steak", price: 17000, category: MenuCategory.FOOD, image: IMAGES.steak },
      { name: "Cheesecake", price: 5000, category: MenuCategory.DESSERT, image: IMAGES.dessert },
    ],
  },
  {
    name: "Mile Four Coastal Kitchen",
    slug: "mile-four-coastal-kitchen",
    city: "Limbe",
    address: "Mile Four, Limbe",
    phone: "+237650100122",
    latitude: 4.0338,
    longitude: 9.2189,
    priceRange: PriceRange.MODERATE,
    bannerImage: IMAGES.fish,
    description: "A relaxed coastal restaurant specialising in fresh fish, prawns and local side dishes.",
    amenities: ["Outdoor Seating", "Parking", "Kids Friendly", "Live Music"],
    menu: [
      { name: "Grilled Fish and Bobolo", price: 7500, category: MenuCategory.FOOD, image: IMAGES.fish },
      { name: "Pepper Prawns", price: 9000, category: MenuCategory.FOOD, image: IMAGES.fish },
      { name: "Coconut Juice", price: 1800, category: MenuCategory.DRINK, image: IMAGES.juice },
    ],
  },
  {
    name: "Bota Harbour Grill",
    slug: "bota-harbour-grill",
    city: "Limbe",
    address: "Bota Wharf Road",
    phone: "+237650100123",
    latitude: 4.0189,
    longitude: 9.1857,
    priceRange: PriceRange.PREMIUM,
    bannerImage: IMAGES.grill,
    description: "A premium harbour-side grill with seafood platters, steaks and evening views.",
    amenities: ["Outdoor Seating", "Parking", "Private Dining", "Live Music"],
    menu: [
      { name: "Harbour Seafood Platter", price: 18000, category: MenuCategory.FOOD, image: IMAGES.fish },
      { name: "Pepper Steak", price: 14500, category: MenuCategory.FOOD, image: IMAGES.steak },
      { name: "Passion Mocktail", price: 2800, category: MenuCategory.DRINK, image: IMAGES.juice },
    ],
  },
  {
    name: "Mokindi Beach Café",
    slug: "mokindi-beach-cafe",
    city: "Limbe",
    address: "Mokindi, coastal road",
    phone: "+237650100124",
    latitude: 4.0061,
    longitude: 9.1668,
    priceRange: PriceRange.BUDGET,
    bannerImage: IMAGES.cafe,
    description: "A small beach café offering breakfast, sandwiches, coffee and affordable snacks.",
    amenities: ["Outdoor Seating", "Wi-Fi", "Takeaway"],
    menu: [
      { name: "Club Sandwich", price: 3000, category: MenuCategory.FOOD, image: IMAGES.burger },
      { name: "Breakfast Plate", price: 3500, category: MenuCategory.FOOD, image: IMAGES.local },
      { name: "Cappuccino", price: 1800, category: MenuCategory.DRINK, image: IMAGES.cafe },
    ],
  },
  {
    name: "New Town Family Restaurant",
    slug: "new-town-family-restaurant-limbe",
    city: "Limbe",
    address: "New Town, Limbe",
    phone: "+237650100125",
    latitude: 4.0218,
    longitude: 9.2071,
    priceRange: PriceRange.MODERATE,
    bannerImage: IMAGES.chicken,
    description: "A dependable family restaurant serving local cuisine, grilled chicken and celebration meals.",
    amenities: ["Kids Friendly", "Parking", "Generator/Power Backup", "TV/Screens"],
    menu: [
      { name: "Grilled Chicken Platter", price: 6500, category: MenuCategory.FOOD, image: IMAGES.chicken },
      { name: "Ndolé and Miondo", price: 5000, category: MenuCategory.FOOD, image: IMAGES.local },
      { name: "Pineapple Juice", price: 1500, category: MenuCategory.DRINK, image: IMAGES.juice },
    ],
  },
  {
    name: "West Coast Fine Dining",
    slug: "west-coast-fine-dining",
    city: "Limbe",
    address: "Down Beach, Limbe",
    phone: "+237650100126",
    latitude: 4.0127,
    longitude: 9.2012,
    priceRange: PriceRange.LUXURY,
    bannerImage: IMAGES.elegant,
    description: "An upscale coastal restaurant for romantic dinners, private events and refined seafood experiences.",
    amenities: ["VIP Section", "Private Dining", "Parking", "Air Conditioning", "Outdoor Seating"],
    menu: [
      { name: "Lobster Thermidor", price: 28000, category: MenuCategory.FOOD, image: IMAGES.fish },
      { name: "Premium Surf and Turf", price: 25000, category: MenuCategory.FOOD, image: IMAGES.steak },
      { name: "Chocolate Fondant", price: 6500, category: MenuCategory.DESSERT, image: IMAGES.dessert },
    ],
  },
  {
    name: "Soppo Heritage Pot",
    slug: "soppo-heritage-pot",
    city: "Buea",
    address: "Great Soppo, Buea",
    phone: "+237650100127",
    latitude: 4.1669,
    longitude: 9.2598,
    priceRange: PriceRange.MODERATE,
    bannerImage: IMAGES.local,
    description: "A warm traditional restaurant serving eru, fufu, achu, soups and grilled meat in a family atmosphere.",
    amenities: ["Parking", "Kids Friendly", "Outdoor Seating", "Generator/Power Backup"],
    menu: [
      { name: "Eru and Water Fufu", price: 4500, category: MenuCategory.FOOD, image: IMAGES.local },
      { name: "Achu and Yellow Soup", price: 5000, category: MenuCategory.FOOD, image: IMAGES.local },
      { name: "Foléré", price: 1200, category: MenuCategory.DRINK, image: IMAGES.juice },
    ],
  },
  {
    name: "Muea Market Grill",
    slug: "muea-market-grill",
    city: "Buea",
    address: "Muea Market Road",
    phone: "+237650100128",
    latitude: 4.1258,
    longitude: 9.3108,
    priceRange: PriceRange.BUDGET,
    bannerImage: IMAGES.grill,
    description: "A busy affordable grill serving soya, pork, chicken, plantain and quick local meals.",
    amenities: ["Takeaway", "TV/Screens", "Generator/Power Backup"],
    menu: [
      { name: "Soya and Plantain", price: 2500, category: MenuCategory.FOOD, image: IMAGES.grill },
      { name: "Grilled Pork", price: 3500, category: MenuCategory.FOOD, image: IMAGES.grill },
      { name: "Ginger Juice", price: 800, category: MenuCategory.DRINK, image: IMAGES.juice },
    ],
  },
  {
    name: "Clerks Quarters Bistro",
    slug: "clerks-quarters-bistro",
    city: "Buea",
    address: "Clerks Quarters, Buea",
    phone: "+237650100129",
    latitude: 4.1576,
    longitude: 9.2469,
    priceRange: PriceRange.PREMIUM,
    bannerImage: IMAGES.pasta,
    description: "A quiet modern bistro with continental meals, coffee and comfortable seating for meetings and dates.",
    amenities: ["Wi-Fi", "Parking", "Air Conditioning", "Private Dining"],
    menu: [
      { name: "Chicken Alfredo", price: 9000, category: MenuCategory.FOOD, image: IMAGES.pasta },
      { name: "Grilled Salmon", price: 14000, category: MenuCategory.FOOD, image: IMAGES.fish },
      { name: "Cheesecake", price: 4500, category: MenuCategory.DESSERT, image: IMAGES.dessert },
    ],
  },
  {
    name: "Sandpit Sunset Lounge",
    slug: "sandpit-sunset-lounge",
    city: "Buea",
    address: "Sandpit, Buea",
    phone: "+237650100130",
    latitude: 4.1477,
    longitude: 9.2798,
    priceRange: PriceRange.LUXURY,
    bannerImage: IMAGES.elegant,
    description: "A classy lounge for celebrations and evening dining with premium platters, cocktails and private seating.",
    amenities: ["VIP Section", "Private Dining", "Live Music", "Parking", "Air Conditioning"],
    menu: [
      { name: "Premium Steak Platter", price: 22000, category: MenuCategory.FOOD, image: IMAGES.steak },
      { name: "Seafood Pasta", price: 16500, category: MenuCategory.FOOD, image: IMAGES.pasta },
      { name: "Chocolate Lava Cake", price: 6000, category: MenuCategory.DESSERT, image: IMAGES.dessert },
    ],
  },
];

const openingHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
  dayOfWeek,
  openTime: dayOfWeek === 0 ? "12:00" : "10:00",
  closeTime: dayOfWeek === 0 ? "22:00" : "23:00",
  maxCapacity: 100,
  isActive: true,
}));

export async function ensureExpandedDemoRestaurants(): Promise<void> {
  if (process.env.ENABLE_DEMO_DATA === "false") return;

  const approvedCount = await prisma.restaurant.count({ where: { isApproved: true, isActive: true } });
  if (approvedCount >= 30) return;

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

  for (const item of extraRestaurants) {
    const restaurant = await prisma.restaurant.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        bannerImage: item.bannerImage,
        galleryImages: [item.bannerImage, item.menu[0].image, item.menu[1].image],
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
        galleryImages: [item.bannerImage, item.menu[0].image, item.menu[1].image],
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
        data: item.menu.map((menuItem) => ({
          restaurantId: restaurant.id,
          name: menuItem.name,
          price: menuItem.price,
          category: menuItem.category,
          image: menuItem.image,
          description: `A popular choice at ${item.name}.`,
          isAvailable: true,
        })),
      });
    }

    const slotCount = await prisma.availabilitySlot.count({ where: { restaurantId: restaurant.id } });
    if (slotCount === 0) {
      await prisma.availabilitySlot.createMany({
        data: openingHours.map((slot) => ({ ...slot, restaurantId: restaurant.id })),
      });
    }
  }
}
