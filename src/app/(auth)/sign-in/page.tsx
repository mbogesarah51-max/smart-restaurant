"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
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
  Mail,
  Lock,
} from "lucide-react";
import { loginSchema } from "@/lib/validations";
import type { z } from "zod";

type FieldErrors = Partial<Record<string, string[]>>;

export default function SignInPage() {
  const router = useRouter();
  const clerk = useClerk();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    const raw = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validated = loginSchema.safeParse(raw);
    if (!validated.success) {
      const fieldErrors = validated.error.flatten()
        .fieldErrors as z.inferFlattenedErrors<
        typeof loginSchema
      >["fieldErrors"];
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        if (data.errors) {
          setErrors(data.errors);
        }
        toast.error(data.message || "Sign in failed");
        setIsLoading(false);
        return;
      }

      // Create Clerk session using the sign-in token
      if (!data.token) {
        toast.error("Failed to create session. Please try again.");
        return;
      }

      if (!clerk.loaded || !clerk.client) {
        // Wait for Clerk to load
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
        toast.success("Welcome back!");
        router.push("/dashboard");
        return;
      }

      toast.error("Failed to create session. Please try again.");
    } catch (error) {
      console.error("Sign-in error:", error);
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
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center shadow-md shadow-brand-orange/15">
          <UtensilsCrossed className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold font-heading text-brand-dark">
          Chop<span className="text-brand-orange">Wise</span>
        </span>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold text-brand-dark">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue your dining journey
          </p>
        </div>

        <Card className="border-black/[0.06] bg-white shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-heading font-bold text-brand-dark">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email and password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Enter your password"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white font-semibold h-12 mt-2 rounded-xl shadow-md shadow-brand-orange/15 hover:shadow-brand-orange/25 transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="text-brand-orange hover:text-brand-orange-hover font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
