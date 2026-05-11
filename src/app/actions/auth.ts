"use server";

import dns from "node:dns";
import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/lib/validations";
import type { ActionResponse, SafeUser } from "@/types";

// IPv4-first DNS so Clerk API fetches don't hang on IPv6-broken networks.
dns.setDefaultResultOrder("ipv4first");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export async function registerUser(
  formData: FormData
): Promise<ActionResponse<SafeUser>> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    role: formData.get("role") as string,
  };

  const validated = registerSchema.safeParse(raw);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, phone, password, role } = validated.data;

  // Check for existing user
  let existingUser;
  try {
    existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });
  } catch (dbError) {
    console.error("[registerUser] DB lookup failed:", dbError);
    return {
      success: false,
      message:
        "Could not reach the database. Check your DATABASE_URL and that the database is running.",
    };
  }

  if (existingUser) {
    const field = existingUser.email === email ? "email" : "phone";
    return {
      success: false,
      message: `A user with this ${field} already exists`,
      errors: { [field]: [`This ${field} is already registered`] },
    };
  }

  // Hash password
  let passwordHash: string;
  try {
    passwordHash = await bcrypt.hash(password, 12);
  } catch (hashError) {
    console.error("[registerUser] bcrypt.hash failed:", hashError);
    return { success: false, message: "Failed to secure password. Please try again." };
  }

  // Save user to our database first
  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: role as "CLIENT" | "RESTAURANT_OWNER",
      },
    });
  } catch (dbError) {
    console.error("[registerUser] prisma.user.create failed:", dbError);
    const detail = dbError instanceof Error ? dbError.message : "unknown";
    return {
      success: false,
      message: `Failed to create account: ${detail}`,
    };
  }

  // Create Clerk user
  try {
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      password,
      firstName: name.split(" ")[0],
      lastName: name.split(" ").slice(1).join(" ") || undefined,
    });

    // Update our user with Clerk ID
    await prisma.user.update({
      where: { id: user.id },
      data: { clerkId: clerkUser.id },
    });

    // Create a sign-in token so the user is automatically signed in
    const signInToken = await clerkClient.signInTokens.createSignInToken({
      userId: clerkUser.id,
      expiresInSeconds: 60,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;
    return {
      success: true,
      message: "Account created successfully!",
      data: { ...safeUser, clerkId: clerkUser.id },
      token: signInToken.token,
    };
  } catch (clerkError: unknown) {
    // Rollback: delete user from our DB
    await prisma.user.delete({ where: { id: user.id } });

    console.error("Clerk createUser error:", clerkError);

    // Extract Clerk's detailed error messages and map to form fields
    let message = "Failed to create authentication account";
    const fieldErrors: Record<string, string[]> = {};

    const err = clerkError as {
      errors?: { message: string; longMessage?: string; code?: string; meta?: { paramName?: string } }[];
    };

    if (err.errors && err.errors.length > 0) {
      for (const e of err.errors) {
        const msg = e.longMessage || e.message;

        // Map Clerk error codes to form fields
        if (e.code?.includes("password")) {
          fieldErrors.password = [msg];
        } else if (e.code?.includes("email") || e.meta?.paramName === "email_address") {
          fieldErrors.email = [msg];
        } else if (e.code?.includes("phone") || e.meta?.paramName === "phone_number") {
          fieldErrors.phone = [msg];
        }
      }

      message = err.errors.map((e) => e.longMessage || e.message).join(". ");
    } else if (clerkError instanceof Error) {
      message = clerkError.message;
    }

    return {
      success: false,
      message: `Registration failed: ${message}`,
      errors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export async function getUserByClerkId(clerkId: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export async function loginUser(
  formData: FormData
): Promise<ActionResponse<SafeUser>> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validated = loginSchema.safeParse(raw);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = validated.data;

  // Find user in our database
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password",
      errors: { email: ["No account found with this email"] },
    };
  }

  // Verify password against our database
  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    return {
      success: false,
      message: "Invalid email or password",
      errors: { password: ["Incorrect password"] },
    };
  }

  if (!user.clerkId) {
    return {
      success: false,
      message: "Account authentication error. Please contact support.",
    };
  }

  // Create a sign-in token for Clerk session
  try {
    const signInToken = await clerkClient.signInTokens.createSignInToken({
      userId: user.clerkId,
      expiresInSeconds: 60,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;
    return {
      success: true,
      message: "Signed in successfully!",
      data: safeUser,
      token: signInToken.token,
    };
  } catch (error) {
    console.error("Clerk signInToken error:", error);
    return {
      success: false,
      message: "Failed to create session. Please try again.",
    };
  }
}

export async function updateProfile(
  formData: FormData
): Promise<ActionResponse<SafeUser>> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "Not authenticated" };

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return { success: false, message: "User not found" };

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const profileImage = formData.get("profileImage") as string | null;

  if (!name || name.length < 2) {
    return {
      success: false,
      message: "Validation failed",
      errors: { name: ["Name must be at least 2 characters"] },
    };
  }

  if (!phone || phone.length < 9) {
    return {
      success: false,
      message: "Validation failed",
      errors: { phone: ["Phone number must be at least 9 digits"] },
    };
  }

  // Check if phone is taken by another user
  if (phone !== user.phone) {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing && existing.id !== user.id) {
      return {
        success: false,
        message: "Phone number already in use",
        errors: { phone: ["This phone number is already registered"] },
      };
    }
  }

  const updateData: { name: string; phone: string; profileImage?: string | null } = { name, phone };
  if (profileImage !== null && profileImage !== undefined) {
    updateData.profileImage = profileImage || null;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  // Update Clerk user name
  if (user.clerkId) {
    try {
      await clerkClient.users.updateUser(user.clerkId, {
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || undefined,
      });
    } catch {
      // Non-critical — local DB is already updated
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safeUser } = updated;
  return {
    success: true,
    message: "Profile updated successfully",
    data: safeUser,
  };
}

export async function changePassword(
  formData: FormData
): Promise<ActionResponse> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "Not authenticated" };

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return { success: false, message: "User not found" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword) {
    return {
      success: false,
      message: "Current password is required",
      errors: { currentPassword: ["Current password is required"] },
    };
  }

  if (!newPassword || newPassword.length < 8) {
    return {
      success: false,
      message: "New password must be at least 8 characters",
      errors: { newPassword: ["Password must be at least 8 characters"] },
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      message: "Passwords do not match",
      errors: { confirmPassword: ["Passwords do not match"] },
    };
  }

  // Verify current password
  const passwordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordValid) {
    return {
      success: false,
      message: "Current password is incorrect",
      errors: { currentPassword: ["Current password is incorrect"] },
    };
  }

  // Update Clerk password first (it has stricter validation)
  if (user.clerkId) {
    try {
      await clerkClient.users.updateUser(user.clerkId, {
        password: newPassword,
      });
    } catch (clerkError: unknown) {
      const err = clerkError as {
        errors?: { longMessage?: string; message: string; code?: string }[];
      };
      let message = "Failed to update password";
      if (err.errors && err.errors.length > 0) {
        message = err.errors.map((e) => e.longMessage || e.message).join(". ");
      }
      return {
        success: false,
        message,
        errors: { newPassword: [message] },
      };
    }
  }

  // Update local DB
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: true, message: "Password changed successfully" };
}
