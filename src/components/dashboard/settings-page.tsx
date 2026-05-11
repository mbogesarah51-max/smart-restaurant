"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Camera,
  Trash2,
} from "lucide-react";
import { getRoleBadgeProps } from "./sidebar-nav";
import type { SafeUser } from "@/types";

type FieldErrors = Partial<Record<string, string[]>>;

export function SettingsPage({ user }: { user: SafeUser }) {
  const roleBadge = getRoleBadgeProps(user.role);
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <ProfileSection user={user} initials={initials} roleBadge={roleBadge} />

      <Separator />

      <PasswordSection />
    </div>
  );
}

function ProfileSection({
  user,
  initials,
  roleBadge,
}: {
  user: SafeUser;
  initials: string;
  roleBadge: ReturnType<typeof getRoleBadgeProps>;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [profileImage, setProfileImage] = useState<string | null>(user.profileImage);

  async function handleImageUpload(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "profiles");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      const url = data.data.secure_url as string;
      setProfileImage(url);

      // Save immediately
      const saveData = new FormData();
      saveData.set("name", user.name);
      saveData.set("phone", user.phone);
      saveData.set("profileImage", url);

      const saveRes = await fetch("/api/auth/profile", { method: "PUT", body: saveData });
      const saveResult = await saveRes.json();

      if (saveResult.success) {
        toast.success("Profile picture updated");
        router.refresh();
      } else {
        toast.error("Failed to save profile picture");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemoveImage() {
    setIsUploading(true);
    try {
      const saveData = new FormData();
      saveData.set("name", user.name);
      saveData.set("phone", user.phone);
      saveData.set("profileImage", "");

      const res = await fetch("/api/auth/profile", { method: "PUT", body: saveData });
      const result = await res.json();

      if (result.success) {
        setProfileImage(null);
        toast.success("Profile picture removed");
        router.refresh();
      } else {
        toast.error("Failed to remove profile picture");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    if (profileImage) {
      formData.set("profileImage", profileImage);
    }

    try {
      const res = await fetch("/api/auth/profile", { method: "PUT", body: formData });
      const data = await res.json();

      if (!data.success) {
        if (data.errors) setErrors(data.errors);
        toast.error(data.message || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-heading">Profile</CardTitle>
        <CardDescription>Update your personal information and photo</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Avatar upload */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative group">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={user.name}
                width={80}
                height={80}
                className="size-20 rounded-full object-cover border-2 border-border/40"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-amber-500 text-white text-xl font-bold border-2 border-brand-orange/20">
                {initials}
              </div>
            )}

            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Loader2 className="size-5 text-white animate-spin" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/40 transition-colors cursor-pointer"
              >
                <Camera className="size-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-foreground">{user.name}</p>
            <span className={`inline-block text-[11px] font-semibold ${roleBadge.className} px-2 py-0.5 rounded-full mt-1`}>
              {roleBadge.label}
            </span>
            <div className="flex gap-2 mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Camera className="size-3.5 mr-1.5" />
                {profileImage ? "Change photo" : "Upload photo"}
              </Button>
              {profileImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                >
                  <Trash2 className="size-3.5 mr-1.5" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                defaultValue={user.name}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name[0]}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                value={user.email}
                className="pl-9 bg-muted/50"
                disabled
              />
            </div>
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={user.phone}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone[0]}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/password", { method: "PUT", body: formData });
      const data = await res.json();

      if (!data.success) {
        if (data.errors) setErrors(data.errors);
        toast.error(data.message || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully");
      e.currentTarget.reset();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-heading">Change Password</CardTitle>
        <CardDescription>Update your password to keep your account secure</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                className="pl-9 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-destructive">{errors.currentPassword[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="newPassword"
                name="newPassword"
                type={showNew ? "text" : "password"}
                placeholder="Min. 8 characters"
                className="pl-9 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                className="pl-9 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword[0]}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 mr-1.5 animate-spin" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
