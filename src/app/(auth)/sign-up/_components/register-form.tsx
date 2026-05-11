"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  UtensilsCrossed,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Store,
} from "lucide-react";
import { registerSchema } from "@/lib/validations";
import type { z } from "zod";

type FieldErrors = Partial<Record<string, string[]>>;

interface RegisterFormProps {
  role: "CLIENT" | "RESTAURANT_OWNER";
}

export function RegisterForm({ role }: RegisterFormProps) {
  const router = useRouter();
  const clerk = useClerk();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const isDiner = role === "CLIENT";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    const raw = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      role,
    };

    const validated = registerSchema.safeParse(raw);
    if (!validated.success) {
      const fieldErrors = validated.error.flatten()
        .fieldErrors as z.inferFlattenedErrors<
        typeof registerSchema
      >["fieldErrors"];
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        if (data.errors) {
          setErrors(data.errors);
        }
        toast.error(data.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Auto sign-in using the Clerk sign-in token
      if (!data.token) {
        toast.success("Account created! Please sign in.");
        router.push("/sign-in");
        return;
      }

      if (!clerk.loaded || !clerk.client) {
        await new Promise<void>((resolve) => {
          const check = () => {
            if (clerk.loaded && clerk.client) {
              resolve();
            } else {
              setTimeout(check, 100);
            }
          };
          check();
        });
      }

      const signInResult = await clerk.client!.signIn.create({
        strategy: "ticket",
        ticket: data.token,
      });

      if (signInResult.status === "complete") {
        await clerk.setActive({ session: signInResult.createdSessionId });
        toast.success("Account created! Redirecting...");
        router.push("/dashboard");
        return;
      }

      toast.success("Account created! Please sign in.");
      router.push("/sign-in");
    } catch (error) {
      console.error("Registration sign-in error:", error);
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-6 lg:hidden">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center shadow-md shadow-brand-orange/15">
          <UtensilsCrossed className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold font-heading text-brand-dark">
          Chop<span className="text-brand-orange">Wise</span>
        </span>
      </div>

      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-dark transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Card className="border-black/[0.06] bg-white shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            {/* Role badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit mb-2 ${
                isDiner
                  ? "bg-orange-50 text-brand-orange"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {isDiner ? (
                <UtensilsCrossed className="w-3.5 h-3.5" />
              ) : (
                <Store className="w-3.5 h-3.5" />
              )}
              <span className="text-xs font-semibold">
                {isDiner ? "Diner Account" : "Restaurant Owner Account"}
              </span>
            </div>

            <CardTitle className="text-2xl font-heading font-bold text-brand-dark">
              Create your account
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isDiner
                ? "Start discovering and reserving at amazing restaurants"
                : "List your restaurant and start receiving bookings"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-brand-dark">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    placeholder={isDiner ? "John Doe" : "Restaurant Owner Name"}
                    className="pl-10 bg-brand-surface border-black/[0.08] focus:border-brand-orange"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name[0]}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-brand-dark">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10 bg-brand-surface border-black/[0.08] focus:border-brand-orange"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email[0]}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-brand-dark">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+237 6XX XXX XXX"
                    className="pl-10 bg-brand-surface border-black/[0.08] focus:border-brand-orange"
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone[0]}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-brand-dark">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    className="pl-10 pr-10 bg-brand-surface border-black/[0.08] focus:border-brand-orange"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-dark transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password[0]}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-brand-dark">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className="pl-10 pr-10 bg-brand-surface border-black/[0.08] focus:border-brand-orange"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-dark transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword[0]}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-semibold h-12 mt-2 rounded-xl shadow-md shadow-brand-orange/15 hover:shadow-brand-orange/25 transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-brand-orange hover:text-brand-orange-hover font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
