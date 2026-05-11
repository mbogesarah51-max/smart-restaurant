"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  ArrowLeft,
  UtensilsCrossed,
  Coffee,
  IceCream,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toggleMenuItemAvailability, deleteMenuItem, bulkToggleAvailability } from "@/app/actions/menu";
import { MenuItemForm } from "./menu-item-form";
import type { RestaurantWithDetails } from "@/types";
import type { MenuItem } from "@/generated/prisma/client";

type Category = "ALL" | "FOOD" | "DRINK" | "DESSERT" | "OTHER";

const CATEGORY_TABS: { value: Category; label: string; icon: typeof UtensilsCrossed }[] = [
  { value: "ALL", label: "All", icon: UtensilsCrossed },
  { value: "FOOD", label: "Food", icon: UtensilsCrossed },
  { value: "DRINK", label: "Drinks", icon: Coffee },
  { value: "DESSERT", label: "Desserts", icon: IceCream },
  { value: "OTHER", label: "Other", icon: MoreHorizontal },
];

const CATEGORY_COLORS: Record<string, string> = {
  FOOD: "bg-brand-orange/10 text-brand-orange",
  DRINK: "bg-blue-100 text-blue-700",
  DESSERT: "bg-pink-100 text-pink-700",
  OTHER: "bg-gray-100 text-gray-700",
};

export function MenuManagement({ restaurant }: { restaurant: RestaurantWithDetails }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Category>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const items = restaurant.menuItems;
  const filtered = filter === "ALL" ? items : items.filter((i) => i.category === filter);

  const refresh = useCallback(() => {
    setShowForm(false);
    setEditingItem(null);
    router.refresh();
  }, [router]);

  // Counts per category
  const counts = {
    ALL: items.length,
    FOOD: items.filter((i) => i.category === "FOOD").length,
    DRINK: items.filter((i) => i.category === "DRINK").length,
    DESSERT: items.filter((i) => i.category === "DESSERT").length,
    OTHER: items.filter((i) => i.category === "OTHER").length,
  };

  if (showForm || editingItem) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setShowForm(false); setEditingItem(null); }}
            className="flex items-center justify-center size-8 rounded-lg hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <h1 className="text-xl font-bold font-heading text-foreground">
            {editingItem ? "Edit Menu Item" : "Add Menu Item"}
          </h1>
        </div>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <MenuItemForm
              mode={editingItem ? "edit" : "add"}
              item={editingItem || undefined}
              onSuccess={refresh}
              onCancel={() => { setShowForm(false); setEditingItem(null); }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setShowPreview(false)} className="flex items-center justify-center size-8 rounded-lg hover:bg-muted/80 transition-colors">
            <ArrowLeft className="size-4" />
          </button>
          <h1 className="text-xl font-bold font-heading text-foreground">Menu Preview</h1>
        </div>
        <MenuPreview items={items.filter((i) => i.isAvailable)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/restaurant" className="flex items-center justify-center size-8 rounded-lg hover:bg-muted/80 transition-colors">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold font-heading text-foreground">Menu Management</h1>
            <p className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <Eye className="size-4" />
            Preview
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors"
          >
            <Plus className="size-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Category tabs + bulk actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.value
                  ? "bg-brand-orange text-white"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {tab.label}
              {counts[tab.value] > 0 && (
                <span className={`text-[10px] px-1.5 py-px rounded-full ${
                  filter === tab.value ? "bg-white/20" : "bg-muted"
                }`}>
                  {counts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {items.length > 0 && (
          <div className="flex gap-1">
            <BulkToggleButton available={true} label="All Available" />
            <BulkToggleButton available={false} label="All Unavailable" />
          </div>
        )}
      </div>

      {/* Item grid */}
      {filtered.length === 0 ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                <UtensilsCrossed className="size-7 text-muted-foreground/50" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                {items.length === 0 ? "No menu items yet" : "No items in this category"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                {items.length === 0
                  ? "Add your first dish, drink, or dessert to start building your menu."
                  : "Try selecting a different category or add a new item."}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors"
              >
                <Plus className="size-4" />
                Add First Item
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={() => setEditingItem(item)}
              onRefresh={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Menu Item Card ──────────────────────────────────────────────────────────

function MenuItemCard({ item, onEdit, onRefresh }: { item: MenuItem; onEdit: () => void; onRefresh: () => void }) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleToggle() {
    setToggling(true);
    const result = await toggleMenuItemAvailability(item.id);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setToggling(false);
    onRefresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteMenuItem(item.id);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setDeleting(false);
    setConfirmDelete(false);
    onRefresh();
  }

  return (
    <Card className={`border-border/50 shadow-sm overflow-hidden transition-opacity ${!item.isAvailable ? "opacity-60" : ""}`}>
      {/* Image */}
      {item.image ? (
        <div className="relative aspect-video">
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-xs font-semibold text-white bg-black/60 px-2.5 py-1 rounded-full">Unavailable</span>
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-muted/30 flex items-center justify-center">
          <UtensilsCrossed className="size-8 text-muted-foreground/30" />
        </div>
      )}

      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">{item.name}</h3>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
            )}
          </div>
          <Badge variant="secondary" className={`shrink-0 text-[10px] border-0 ${CATEGORY_COLORS[item.category]}`}>
            {item.category}
          </Badge>
        </div>

        <p className="text-sm font-bold text-brand-orange mb-3">{formatPrice(item.price)}</p>

        {/* Actions */}
        <div className="flex items-center gap-1 border-t border-border/40 pt-3 -mx-1">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              item.isAvailable
                ? "text-emerald-700 hover:bg-emerald-50"
                : "text-muted-foreground hover:bg-muted/80"
            }`}
            title={item.isAvailable ? "Mark unavailable" : "Mark available"}
          >
            {toggling ? <Loader2 className="size-3 animate-spin" /> : item.isAvailable ? <ToggleRight className="size-3.5" /> : <ToggleLeft className="size-3.5" />}
            {item.isAvailable ? "Available" : "Unavailable"}
          </button>

          <div className="flex-1" />

          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <Pencil className="size-3" />
            Edit
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white bg-destructive hover:bg-destructive/90 transition-colors"
              >
                {deleting ? <Loader2 className="size-3 animate-spin" /> : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="size-3" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Bulk Toggle Button ──────────────────────────────────────────────────────

function BulkToggleButton({ available, label }: { available: boolean; label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    const result = await bulkToggleAvailability(available);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="size-3 animate-spin" /> : available ? <ToggleRight className="size-3" /> : <ToggleLeft className="size-3" />}
      {label}
    </button>
  );
}

// ─── Menu Preview ────────────────────────────────────────────────────────────

function MenuPreview({ items }: { items: MenuItem[] }) {
  const grouped = {
    FOOD: items.filter((i) => i.category === "FOOD"),
    DRINK: items.filter((i) => i.category === "DRINK"),
    DESSERT: items.filter((i) => i.category === "DESSERT"),
    OTHER: items.filter((i) => i.category === "OTHER"),
  };

  const sections = [
    { key: "FOOD", label: "Food", icon: UtensilsCrossed },
    { key: "DRINK", label: "Drinks", icon: Coffee },
    { key: "DESSERT", label: "Desserts", icon: IceCream },
    { key: "OTHER", label: "Other", icon: MoreHorizontal },
  ] as const;

  const hasItems = items.length > 0;

  if (!hasItems) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">No available menu items to preview.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map(({ key, label, icon: Icon }) => {
        const sectionItems = grouped[key];
        if (sectionItems.length === 0) return null;
        return (
          <Card key={key} className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-heading">
                <Icon className="size-4 text-brand-orange" />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/40">
                {sectionItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="size-16 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-sm font-semibold text-foreground">{item.name}</h4>
                        <span className="text-sm font-bold text-brand-orange whitespace-nowrap">{formatPrice(item.price)}</span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
