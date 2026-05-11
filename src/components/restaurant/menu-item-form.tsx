"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/shared/image-upload";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { addMenuItem, updateMenuItem } from "@/app/actions/menu";
import type { MenuItem } from "@/generated/prisma/client";

const CATEGORIES = [
  { value: "FOOD", label: "Food" },
  { value: "DRINK", label: "Drink" },
  { value: "DESSERT", label: "Dessert" },
  { value: "OTHER", label: "Other" },
] as const;

interface MenuItemFormProps {
  mode: "add" | "edit";
  item?: MenuItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MenuItemForm({ mode, item, onSuccess, onCancel }: MenuItemFormProps) {
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [price, setPrice] = useState(item?.price?.toString() || "");
  const [category, setCategory] = useState<"FOOD" | "DRINK" | "DESSERT" | "OTHER">(item?.category || "FOOD");
  const [image, setImage] = useState(item?.image || "");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!price || parseFloat(price) < 0) errs.price = "Valid price is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    setErrors({});

    try {
      const data = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        category,
        image: image || undefined,
      };

      const result = mode === "edit" && item
        ? await updateMenuItem(item.id, data)
        : await addMenuItem(data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(mode === "edit" ? "Item updated!" : "Item added!");
      onSuccess();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function generateDescription() {
    if (!name.trim()) { toast.error("Enter item name first"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "menuItem", name: name.trim(), category }),
      });
      const data = await res.json();
      if (data.description) {
        setDescription(data.description);
        toast.success("Description generated!");
      } else {
        toast.error("Failed to generate");
      }
    } catch {
      toast.error("Failed to generate description");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="item-name">Name *</Label>
        <Input
          id="item-name"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors({}); }}
          placeholder="e.g. Grilled Tilapia"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category *</Label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                category === c.value
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "border-border/60 text-muted-foreground hover:border-brand-orange/40"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="item-price">Price (FCFA) *</Label>
        <Input
          id="item-price"
          type="number"
          min="0"
          step="50"
          value={price}
          onChange={(e) => { setPrice(e.target.value); setErrors({}); }}
          placeholder="e.g. 2500"
        />
        {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="item-desc">Description</Label>
          <button
            type="button"
            onClick={generateDescription}
            disabled={generating || !name.trim()}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 transition-colors"
          >
            {generating ? <Loader2 className="size-2.5 animate-spin" /> : <Sparkles className="size-2.5" />}
            AI Generate
          </button>
        </div>
        <textarea
          id="item-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description of the dish..."
          rows={2}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 outline-none resize-none"
        />
      </div>

      {/* Image */}
      <div className="space-y-2">
        <Label>Image (optional)</Label>
        <ImageUpload
          value={image}
          onChange={(v) => setImage(v as string)}
          folder="restaurants/menu"
          aspectRatio="video"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {mode === "edit" ? "Save Changes" : "Add Item"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
