import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/context/user-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ChopWise — Smart Restaurant Reservations",
    template: "%s | ChopWise",
  },
  description:
    "Discover, reserve, and dine at the best restaurants in Cameroon. AI-powered recommendations, instant bookings, and WhatsApp confirmations.",
  keywords: [
    "restaurant",
    "reservation",
    "Cameroon",
    "dining",
    "food",
    "booking",
    "AI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#F97316",
          colorBackground: "#FFFCF9",
          colorInputBackground: "#FFFFFF",
          colorInputText: "#1C1917",
          colorText: "#1C1917",
        },
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} ${poppins.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <UserProvider>
            {children}
            <Toaster richColors position="top-right" />
          </UserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
