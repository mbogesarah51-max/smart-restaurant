import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .trim(),
    email: z
      .string()
      .email("Please enter a valid email address")
      .trim()
      .toLowerCase(),
    phone: z
      .string()
      .min(9, "Phone number must be at least 9 digits")
      .max(15, "Phone number must be less than 15 digits")
      .regex(/^[+]?[\d\s-]+$/, "Please enter a valid phone number")
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    role: z.enum(["CLIENT", "RESTAURANT_OWNER"], {
      message: "Please select a role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  description: z.string().max(500).trim().optional(),
  price: z.number().min(0, "Price must be positive"),
  category: z.enum(["FOOD", "DRINK", "DESSERT", "OTHER"]),
  image: z.string().optional(),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;

export const reservationSchema = z.object({
  restaurantId: z.string().min(1),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  guestCount: z.number().min(1, "At least 1 guest").max(20, "Maximum 20 guests"),
  occasion: z.string().optional(),
  preferences: z.string().max(500).optional(),
  preOrderItems: z.array(z.object({
    menuItemId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().min(1),
  })).optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
