"""ChopWise UML diagram generator.

Produces 6 branded PNGs in docs/diagrams/:
  1. er_diagram.png
  2. class_diagram.png
  3. use_case_diagram.png
  4. sequence_diagram.png
  5. state_diagram.png
  6. activity_diagram.png
"""
from __future__ import annotations
import os
import math
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Polygon, Rectangle, Circle, Wedge, Ellipse, PathPatch, Arc
from matplotlib.path import Path
from matplotlib.lines import Line2D

# ---------- ChopWise palette ----------
P = {
    "bg":      "#FCFAF6",
    "cream":   "#F8EFE0",
    "primary": "#7A1F2B",  # deep wine
    "accent":  "#E6663E",  # warm orange
    "ink":     "#2B1B17",
    "muted":   "#8C7D74",
    "ok":      "#3E8E66",
    "warn":    "#D4A24C",
    "danger":  "#B23A48",
    "info":    "#3C6E91",
    "line":    "#3a2620",
}
OUT = os.path.dirname(os.path.abspath(__file__))

# ---------- small icon helpers ----------
def icon_user(ax, x, y, r=0.28, color=None):
    color = color or P["primary"]
    # head
    ax.add_patch(Circle((x, y + r*0.65), r*0.45, color=color, zorder=5))
    # body (rounded shoulders)
    body = FancyBboxPatch((x - r*0.75, y - r*0.7), r*1.5, r*0.9,
                          boxstyle="round,pad=0.02,rounding_size=0.15",
                          fc=color, ec=color, zorder=5)
    ax.add_patch(body)

def icon_chef(ax, x, y, r=0.28):
    # toque hat over a user icon
    icon_user(ax, x, y, r, color=P["accent"])
    hat = FancyBboxPatch((x - r*0.5, y + r*0.95), r*1.0, r*0.55,
                         boxstyle="round,pad=0.02,rounding_size=0.18",
                         fc="white", ec=P["ink"], zorder=6)
    ax.add_patch(hat)

def icon_shield(ax, x, y, r=0.28):
    icon_user(ax, x, y, r, color=P["info"])
    # shield
    shield = Polygon([(x, y + r*1.4), (x + r*0.5, y + r*1.1),
                      (x + r*0.5, y + r*0.7), (x, y + r*0.5),
                      (x - r*0.5, y + r*0.7), (x - r*0.5, y + r*1.1)],
                     closed=True, fc=P["warn"], ec=P["ink"], zorder=6)
    ax.add_patch(shield)

def icon_plate(ax, x, y, r=0.22):
    ax.add_patch(Circle((x, y), r, fc="white", ec=P["primary"], lw=2, zorder=5))
    ax.add_patch(Circle((x, y), r*0.6, fc=P["cream"], ec=P["primary"], lw=1, zorder=6))
    # fork
    ax.plot([x - r*1.4, x - r*1.4], [y - r*0.4, y + r*0.4],
            color=P["ink"], lw=2, zorder=6)
    # knife
    ax.plot([x + r*1.4, x + r*1.4], [y - r*0.4, y + r*0.4],
            color=P["ink"], lw=2, zorder=6)

def icon_calendar(ax, x, y, w=0.6, h=0.55):
    body = FancyBboxPatch((x - w/2, y - h/2), w, h,
                          boxstyle="round,pad=0.02,rounding_size=0.05",
                          fc="white", ec=P["primary"], lw=2, zorder=5)
    ax.add_patch(body)
    # top bar
    ax.add_patch(Rectangle((x - w/2, y + h/2 - h*0.25), w, h*0.25,
                           fc=P["primary"], ec=P["primary"], zorder=6))
    # rings
    ax.plot([x - w*0.3, x - w*0.3], [y + h/2, y + h/2 + h*0.12],
            color=P["ink"], lw=2, zorder=7)
    ax.plot([x + w*0.3, x + w*0.3], [y + h/2, y + h/2 + h*0.12],
            color=P["ink"], lw=2, zorder=7)
    # dot grid
    for i in range(3):
        for j in range(2):
            ax.add_patch(Circle((x - w*0.25 + i*w*0.25, y - h*0.15 + j*h*0.2),
                                w*0.03, fc=P["accent"], zorder=7))

def icon_house(ax, x, y, w=0.7, h=0.55):
    # roof
    ax.add_patch(Polygon([(x - w/2, y), (x, y + h*0.6), (x + w/2, y)],
                         closed=True, fc=P["accent"], ec=P["ink"], zorder=5))
    # body
    ax.add_patch(Rectangle((x - w*0.4, y - h*0.45), w*0.8, h*0.55,
                           fc=P["cream"], ec=P["primary"], lw=2, zorder=5))
    # door
    ax.add_patch(Rectangle((x - w*0.08, y - h*0.45), w*0.16, h*0.35,
                           fc=P["primary"], zorder=6))
    # window
    ax.add_patch(Rectangle((x + w*0.15, y - h*0.2), w*0.12, h*0.12,
                           fc="white", ec=P["primary"], zorder=6))

def icon_clock(ax, x, y, r=0.22):
    ax.add_patch(Circle((x, y), r, fc="white", ec=P["primary"], lw=2, zorder=5))
    ax.plot([x, x], [y, y + r*0.6], color=P["ink"], lw=2, zorder=6)
    ax.plot([x, x + r*0.45], [y, y], color=P["ink"], lw=2, zorder=6)
    for ang in range(0, 360, 90):
        ax.add_patch(Circle((x + r*0.85*math.cos(math.radians(ang)),
                             y + r*0.85*math.sin(math.radians(ang))),
                            r*0.04, fc=P["ink"], zorder=6))

def icon_card(ax, x, y, w=0.6, h=0.4):
    body = FancyBboxPatch((x - w/2, y - h/2), w, h,
                          boxstyle="round,pad=0.02,rounding_size=0.05",
                          fc=P["accent"], ec=P["ink"], lw=1.5, zorder=5)
    ax.add_patch(body)
    ax.add_patch(Rectangle((x - w/2, y + h*0.05), w, h*0.18,
                           fc=P["ink"], zorder=6))
    ax.add_patch(Rectangle((x - w*0.4, y - h*0.25), w*0.35, h*0.12,
                           fc="white", zorder=6))


# ---------- shared drawing helpers ----------
def rbox(ax, x, y, w, h, text, fc="white", ec=None, lw=1.6, fontsize=10,
         fontweight="normal", text_color=None, rounding=0.06, zorder=3):
    ec = ec or P["line"]
    text_color = text_color or P["ink"]
    ax.add_patch(FancyBboxPatch((x, y), w, h,
                                boxstyle=f"round,pad=0.02,rounding_size={rounding}",
                                fc=fc, ec=ec, lw=lw, zorder=zorder))
    ax.text(x + w/2, y + h/2, text, ha="center", va="center",
            fontsize=fontsize, fontweight=fontweight, color=text_color,
            zorder=zorder+1, wrap=True)

def arrow(ax, x1, y1, x2, y2, color=None, style="-|>", lw=1.6, label=None,
          label_pos=0.5, label_offset=(0, 0.08), label_fontsize=8, zorder=4,
          connectionstyle="arc3,rad=0"):
    color = color or P["line"]
    a = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style,
                        mutation_scale=14, color=color, lw=lw, zorder=zorder,
                        connectionstyle=connectionstyle)
    ax.add_patch(a)
    if label:
        lx = x1 + (x2 - x1) * label_pos + label_offset[0]
        ly = y1 + (y2 - y1) * label_pos + label_offset[1]
        ax.text(lx, ly, label, fontsize=label_fontsize, color=color,
                ha="center", va="center",
                bbox=dict(facecolor=P["bg"], edgecolor="none", pad=1.2),
                zorder=zorder+1)

def title_bar(ax, title, subtitle=None):
    fig = ax.figure
    fig.text(0.5, 0.965, title, ha="center", va="top",
             fontsize=20, fontweight="bold", color=P["primary"])
    if subtitle:
        fig.text(0.5, 0.935, subtitle, ha="center", va="top",
                 fontsize=11, color=P["muted"], style="italic")
    fig.text(0.985, 0.015, "ChopWise · Smart Restaurant Platform",
             ha="right", va="bottom", fontsize=8, color=P["muted"])

def setup(figsize):
    fig, ax = plt.subplots(figsize=figsize, dpi=180)
    fig.patch.set_facecolor(P["bg"])
    ax.set_facecolor(P["bg"])
    ax.set_xticks([]); ax.set_yticks([])
    for s in ax.spines.values(): s.set_visible(False)
    return fig, ax


# ============================================================
# 1) ER DIAGRAM
# ============================================================
def draw_er():
    fig, ax = setup((18, 12))
    ax.set_xlim(0, 22); ax.set_ylim(0, 15)

    # ---- entities (with model icons) ----
    def entity(x, y, w, h, title, icon_fn, attrs, pk_idx=(0,)):
        # header
        ax.add_patch(FancyBboxPatch((x, y + h - 1.0), w, 1.0,
                                    boxstyle="round,pad=0.0,rounding_size=0.12",
                                    fc=P["primary"], ec=P["primary"], zorder=3))
        # body
        ax.add_patch(FancyBboxPatch((x, y), w, h - 1.0,
                                    boxstyle="round,pad=0.0,rounding_size=0.12",
                                    fc="white", ec=P["primary"], lw=2, zorder=2))
        # icon
        icon_fn(ax, x + 0.55, y + h - 0.5)
        ax.text(x + 1.15, y + h - 0.5, title, color="white",
                fontsize=14, fontweight="bold", va="center", zorder=6)
        # attributes
        line_h = (h - 1.3) / max(len(attrs), 1)
        for i, a in enumerate(attrs):
            ay = y + h - 1.1 - (i + 0.5) * line_h
            label = a
            color = P["ink"]; weight = "normal"
            if i in pk_idx:
                label = "● " + a
                weight = "bold"; color = P["primary"]
            ax.text(x + 0.25, ay, label, fontsize=9.5, color=color,
                    fontweight=weight, va="center", zorder=5)

    entity(0.5, 8.5, 5.5, 5.8, "User", icon_user,
           ["id : String  (PK)",
            "clerkId : String?",
            "name : String",
            "email : String  (UQ)",
            "phone : String  (UQ)",
            "passwordHash : String",
            "role : Role",
            "profileImage : String?",
            "isActive : Boolean",
            "createdAt / updatedAt"])

    entity(8.0, 8.0, 6.0, 6.3, "Restaurant", icon_house,
           ["id : String  (PK)",
            "ownerId : String  (FK→User)",
            "name / slug / description",
            "bannerImage / galleryImages[]",
            "phone / whatsapp / email",
            "address / city / lat / lng",
            "priceRange : PriceRange",
            "amenities : String[]",
            "isApproved / isActive",
            "createdAt / updatedAt"])

    entity(15.5, 9.0, 6.0, 5.3, "MenuItem", icon_plate,
           ["id : String  (PK)",
            "restaurantId : String  (FK)",
            "name : String",
            "description : String?",
            "price : Float",
            "category : MenuCategory",
            "image : String?",
            "isAvailable : Boolean",
            "createdAt / updatedAt"])

    entity(4.0, 0.4, 7.5, 7.0, "Reservation", icon_calendar,
           ["id : String  (PK)",
            "userId : String  (FK→User)",
            "restaurantId : String  (FK)",
            "date : DateTime",
            "time : String",
            "guestCount : Int",
            "preferences : String?",
            "status : ReservationStatus",
            "responseDeadline / paymentDeadline",
            "paymentReference / paymentMethod",
            "paidAt / paymentId",
            "totalAmount / bookingFee",
            "rejectionReason / cancellationReason",
            "cancelledBy : CancelledBy?"])

    entity(14.0, 1.5, 6.5, 5.5, "AvailabilitySlot", icon_clock,
           ["id : String  (PK)",
            "restaurantId : String  (FK)",
            "dayOfWeek : Int  (0..6)",
            "openTime : String",
            "closeTime : String",
            "maxCapacity : Int?",
            "isActive : Boolean"])

    # ---- relationships with crow's foot notation ----
    def rel(x1, y1, x2, y2, left, right, verb, vx=None, vy=None,
            curve=0):
        # connector
        cs = f"arc3,rad={curve}"
        ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2),
                                     arrowstyle="-", color=P["primary"],
                                     lw=2.5, zorder=2,
                                     connectionstyle=cs))
        # cardinality labels
        ax.text(x1, y1, left, ha="center", va="center", fontsize=10,
                fontweight="bold", color=P["accent"],
                bbox=dict(facecolor=P["bg"], edgecolor=P["accent"],
                          boxstyle="round,pad=0.25", lw=1.2), zorder=10)
        ax.text(x2, y2, right, ha="center", va="center", fontsize=10,
                fontweight="bold", color=P["accent"],
                bbox=dict(facecolor=P["bg"], edgecolor=P["accent"],
                          boxstyle="round,pad=0.25", lw=1.2), zorder=10)
        if verb:
            vx = vx if vx is not None else (x1 + x2) / 2
            vy = vy if vy is not None else (y1 + y2) / 2
            ax.text(vx, vy, verb, ha="center", va="center", fontsize=10,
                    style="italic", color=P["ink"],
                    bbox=dict(facecolor=P["cream"], edgecolor=P["primary"],
                              boxstyle="round,pad=0.3", lw=1), zorder=10)

    # User --owns--> Restaurant
    rel(6.2, 11.7, 7.8, 11.7, "1", "N", "owns", 7.0, 12.1)
    # Restaurant --has--> MenuItem
    rel(14.2, 11.5, 15.3, 11.5, "1", "N", "has menu", 14.75, 11.9)
    # Restaurant --offers--> AvailabilitySlot
    rel(13.0, 8.2, 15.5, 7.0, "1", "N", "operating hours", 13.9, 7.9)
    # User --makes--> Reservation
    rel(2.6, 8.3, 4.6, 7.55, "1", "N", "makes", 3.4, 7.8)
    # Restaurant --receives--> Reservation
    rel(10.0, 8.1, 10.0, 7.55, "1", "N", "receives",
        vx=10.7, vy=7.85)

    # ---- enum legend ----
    leg_x, leg_y = 0.4, 2.1
    ax.add_patch(FancyBboxPatch((leg_x, leg_y - 1.6), 3.4, 5.2,
                                boxstyle="round,pad=0.02,rounding_size=0.1",
                                fc=P["cream"], ec=P["primary"], lw=1.5, zorder=2))
    ax.text(leg_x + 1.7, leg_y + 3.3, "Enumerations",
            ha="center", fontsize=11, fontweight="bold", color=P["primary"])
    enums = [
        ("Role", "CLIENT · RESTAURANT_OWNER · ADMIN"),
        ("PriceRange", "BUDGET · MODERATE · PREMIUM · LUXURY"),
        ("MenuCategory", "FOOD · DRINK · DESSERT · OTHER"),
        ("ReservationStatus",
         "PENDING · AWAITING_RESPONSE · ACCEPTED ·\nPAYMENT_PENDING · CONFIRMED ·\nREJECTED · CANCELLED"),
        ("CancelledBy", "CLIENT · RESTAURANT · SYSTEM"),
    ]
    ey = leg_y + 2.8
    for name, vals in enums:
        ax.text(leg_x + 0.15, ey, name, fontsize=9, fontweight="bold",
                color=P["accent"], va="top")
        ax.text(leg_x + 0.15, ey - 0.25, vals, fontsize=7.5,
                color=P["ink"], va="top")
        ey -= 0.95

    title_bar(ax, "Entity Relationship Diagram",
              "ChopWise data model — 5 entities, 5 enums, 5 relations")
    fig.tight_layout(rect=[0, 0, 1, 0.93])
    fig.savefig(os.path.join(OUT, "er_diagram.png"),
                dpi=180, facecolor=fig.get_facecolor())
    plt.close(fig)


# ============================================================
# 2) CLASS DIAGRAM
# ============================================================
def draw_class():
    fig, ax = setup((20, 13))
    ax.set_xlim(0, 24); ax.set_ylim(0, 16)

    def cls(x, y, w, h, name, icon_fn, attrs, methods, stereotype=None):
        # header
        ax.add_patch(FancyBboxPatch((x, y + h - 1.0), w, 1.0,
                                    boxstyle="round,pad=0.0,rounding_size=0.1",
                                    fc=P["primary"], ec=P["primary"], zorder=3))
        # body
        ax.add_patch(FancyBboxPatch((x, y), w, h - 1.0,
                                    boxstyle="round,pad=0.0,rounding_size=0.1",
                                    fc="white", ec=P["primary"], lw=2, zorder=2))
        if icon_fn:
            icon_fn(ax, x + 0.45, y + h - 0.5)
        if stereotype:
            ax.text(x + w/2, y + h - 0.25, f"«{stereotype}»",
                    fontsize=8.5, color="white", ha="center", style="italic", zorder=6)
        ax.text(x + 0.95, y + h - 0.65, name, color="white",
                fontsize=13, fontweight="bold", va="center", zorder=6)
        # divider between attrs and methods
        attrs_h = len(attrs) * 0.28
        meth_y = y + h - 1.0 - attrs_h - 0.18
        ax.plot([x + 0.1, x + w - 0.1], [meth_y, meth_y],
                color=P["primary"], lw=1, zorder=4)
        # attrs
        for i, a in enumerate(attrs):
            ax.text(x + 0.2, y + h - 1.0 - (i + 0.5) * 0.28, a,
                    fontsize=8.5, color=P["ink"], va="center", zorder=5)
        # methods
        for i, m in enumerate(methods):
            ax.text(x + 0.2, meth_y - (i + 0.5) * 0.28, m,
                    fontsize=8.5, color=P["accent"], va="center",
                    fontweight="bold", zorder=5)

    # User
    cls(0.3, 9.3, 6.0, 6.0, "User", icon_user,
        ["- id : String",
         "- clerkId : String?",
         "- name, email, phone",
         "- passwordHash : String",
         "- role : Role",
         "- profileImage : String?",
         "- isActive : Boolean"],
        ["+ register(dto)",
         "+ login(creds)",
         "+ updateProfile()",
         "+ changePassword()"])

    # Restaurant
    cls(7.0, 9.3, 6.6, 6.0, "Restaurant", icon_house,
        ["- id, ownerId",
         "- name, slug, description",
         "- banner, gallery[]",
         "- phone, whatsapp, email",
         "- address, city, lat, lng",
         "- priceRange, amenities[]",
         "- isApproved, isActive"],
        ["+ create(dto)",
         "+ update(dto)",
         "+ search(filters)",
         "+ getBySlug()"])

    # MenuItem
    cls(14.4, 9.3, 5.8, 6.0, "MenuItem", icon_plate,
        ["- id, restaurantId",
         "- name, description",
         "- price : Float",
         "- category : MenuCategory",
         "- image : String?",
         "- isAvailable : Boolean"],
        ["+ add(dto)",
         "+ update(dto)",
         "+ toggleAvailability()",
         "+ bulkToggle(value)"])

    # Reservation
    cls(0.3, 1.0, 7.6, 7.5, "Reservation", icon_calendar,
        ["- id, userId, restaurantId",
         "- date : DateTime, time : String",
         "- guestCount : Int",
         "- preferences : String?",
         "- status : ReservationStatus",
         "- responseDeadline, paymentDeadline",
         "- paymentRef, paymentId, paidAt",
         "- bookingFee, totalAmount",
         "- cancelledBy, reason"],
        ["+ create(dto)",
         "+ accept() / reject(reason)",
         "+ cancel(reason)",
         "+ canTransitionTo(s) : Boolean",
         "+ isTerminal() / isCancellable()"])

    # AvailabilitySlot
    cls(8.5, 1.0, 5.8, 5.4, "AvailabilitySlot", icon_clock,
        ["- id, restaurantId",
         "- dayOfWeek : Int (0–6)",
         "- openTime, closeTime",
         "- maxCapacity : Int?",
         "- isActive : Boolean"],
        ["+ check(date, time)",
         "+ capacityLeft()"])

    # PaymentService (boundary)
    cls(14.9, 4.6, 5.5, 4.0, "PaymentService", icon_card,
        ["+ bookingFee : 500 XAF",
         "+ provider : placeholder",
         "+ paymentTimeout : 30m"],
        ["+ initializePayment(r)",
         "+ verifyPayment(ref)",
         "+ confirmSimulated(r)"], stereotype="service")

    # NotificationService stub
    cls(14.9, 1.0, 5.5, 3.0, "NotificationService", None,
        ["+ channel : WhatsApp (stub)"],
        ["+ notifyRestaurant(r)",
         "+ notifyClient(r, event)"], stereotype="service")

    # Relationships
    def rel(x1, y1, x2, y2, multi1, multi2, verb, style="-|>", color=None):
        color = color or P["line"]
        ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-",
                                     lw=1.8, color=color, zorder=2))
        ax.text(x1, y1, multi1, fontsize=9, fontweight="bold", ha="center",
                color=P["accent"],
                bbox=dict(facecolor=P["bg"], edgecolor=P["accent"],
                          boxstyle="round,pad=0.2", lw=1), zorder=8)
        ax.text(x2, y2, multi2, fontsize=9, fontweight="bold", ha="center",
                color=P["accent"],
                bbox=dict(facecolor=P["bg"], edgecolor=P["accent"],
                          boxstyle="round,pad=0.2", lw=1), zorder=8)
        ax.text((x1 + x2) / 2, (y1 + y2) / 2, verb, fontsize=9,
                style="italic", ha="center",
                bbox=dict(facecolor=P["cream"], edgecolor=P["primary"],
                          boxstyle="round,pad=0.25", lw=1), zorder=8)

    # User owns Restaurant
    rel(6.3, 12.0, 7.0, 12.0, "1", "0..N", "owns")
    # Restaurant has MenuItem
    rel(13.6, 12.0, 14.4, 12.0, "1", "0..N", "menu")
    # User makes Reservation
    rel(3.0, 9.3, 4.0, 8.5, "1", "0..N", "books")
    # Restaurant receives Reservation
    rel(8.0, 9.3, 6.5, 8.5, "1", "0..N", "receives")
    # Restaurant has slot
    rel(10.5, 9.3, 10.5, 6.4, "1", "0..N", "schedule")
    # Reservation uses payment
    rel(7.9, 4.6, 14.9, 6.0, "1", "1", "uses")

    title_bar(ax, "Class Diagram",
              "Domain classes, attributes, behaviours and services")
    fig.tight_layout(rect=[0, 0, 1, 0.93])
    fig.savefig(os.path.join(OUT, "class_diagram.png"),
                dpi=180, facecolor=fig.get_facecolor())
    plt.close(fig)


# ============================================================
# 3) USE CASE DIAGRAM
# ============================================================
def draw_usecase():
    fig, ax = setup((18, 13))
    ax.set_xlim(0, 22); ax.set_ylim(0, 16)

    # system boundary
    ax.add_patch(FancyBboxPatch((4.8, 0.8), 12.4, 14.0,
                                boxstyle="round,pad=0.02,rounding_size=0.2",
                                fc="white", ec=P["primary"], lw=2.5, zorder=1))
    ax.text(11.0, 14.45, "ChopWise System",
            fontsize=15, fontweight="bold", color=P["primary"], ha="center")

    # actors
    def actor(x, y, name, role, icon_fn):
        icon_fn(ax, x, y)
        ax.text(x, y - 0.95, name, ha="center", fontsize=11, fontweight="bold",
                color=P["primary"])
        ax.text(x, y - 1.25, role, ha="center", fontsize=9,
                color=P["muted"], style="italic")

    actor(2.5, 11.5, "Diner", "(CLIENT)", icon_user)
    actor(2.5, 7.0, "Restaurant Owner", "(RESTAURANT_OWNER)", icon_chef)
    actor(2.5, 2.5, "Admin", "(ADMIN)", icon_shield)
    actor(19.5, 8.0, "System / Cron", "(scheduler)", icon_clock)

    # use case ovals
    def uc(x, y, text, fc=None, w=2.5, h=0.85):
        fc = fc or P["cream"]
        ax.add_patch(Ellipse((x, y), w, h, fc=fc, ec=P["primary"], lw=1.5, zorder=3))
        ax.text(x, y, text, ha="center", va="center", fontsize=9,
                color=P["ink"], fontweight="bold", zorder=4)

    # Diner use cases
    diner_ucs = [
        (7.0, 13.5, "Sign up / Sign in"),
        (10.5, 13.5, "Browse & search restaurants"),
        (14.0, 13.5, "View restaurant details"),
        (7.0, 12.0, "Create reservation"),
        (10.5, 12.0, "Pay booking fee"),
        (14.0, 12.0, "Cancel reservation"),
        (7.0, 10.5, "Track reservation status"),
        (10.5, 10.5, "Manage profile"),
    ]
    for x, y, t in diner_ucs:
        uc(x, y, t)

    # Owner use cases
    owner_ucs = [
        (7.0, 8.7, "Onboard restaurant"),
        (10.5, 8.7, "Edit restaurant"),
        (14.0, 8.7, "Manage menu items"),
        (7.0, 7.2, "Generate AI description"),
        (10.5, 7.2, "Review incoming bookings"),
        (14.0, 7.2, "Accept / Reject booking"),
        (7.0, 5.7, "View owner stats"),
        (10.5, 5.7, "Cancel confirmed booking"),
    ]
    for x, y, t in owner_ucs:
        uc(x, y, t, fc="#FBE8DA")

    # Admin use cases
    admin_ucs = [
        (7.0, 3.9, "View platform stats"),
        (10.5, 3.9, "Approve restaurants"),
        (14.0, 3.9, "Suspend restaurants"),
        (7.0, 2.4, "Manage users"),
        (10.5, 2.4, "Suspend / Activate users"),
    ]
    for x, y, t in admin_ucs:
        uc(x, y, t, fc="#E3EBF1")

    # System cron use cases
    sys_ucs = [
        (15.0, 5.0, "Auto-expire reservations"),
    ]
    for x, y, t in sys_ucs:
        uc(x, y, t, fc="#FFF1D6", w=3.0)

    # Connections (actor → use case)
    def connect(ax_, ax1, ay1, x2, y2, color=None):
        color = color or P["muted"]
        ax_.add_patch(FancyArrowPatch((ax1, ay1), (x2, y2),
                                      arrowstyle="-", lw=1.0,
                                      color=color, zorder=2))

    for x, y, _ in diner_ucs:
        connect(ax, 3.0, 11.5, x - 1.2, y)
    for x, y, _ in owner_ucs:
        connect(ax, 3.0, 7.0, x - 1.2, y)
    for x, y, _ in admin_ucs:
        connect(ax, 3.0, 2.5, x - 1.2, y)
    for x, y, _ in sys_ucs:
        connect(ax, 19.0, 8.0, x + 1.5, y)

    # «include»/«extend»
    def labelled_link(x1, y1, x2, y2, label):
        ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2),
                                     arrowstyle="-|>", lw=1.0,
                                     linestyle="dashed",
                                     color=P["accent"], zorder=5))
        ax.text((x1+x2)/2, (y1+y2)/2 + 0.2, label, fontsize=8,
                style="italic", color=P["accent"], ha="center",
                bbox=dict(facecolor=P["bg"], edgecolor="none", pad=1))

    labelled_link(10.5, 12.4, 7.0, 12.4, "«include»")  # pay → reserve
    labelled_link(7.0, 12.4, 7.0, 13.1, "«include»")   # reserve → sign in
    labelled_link(7.0, 7.5, 14.0, 8.3, "«extend»")     # AI desc extends menu

    # Legend
    legend_items = [
        (P["cream"], "Diner use case"),
        ("#FBE8DA", "Owner use case"),
        ("#E3EBF1", "Admin use case"),
        ("#FFF1D6", "System / Cron"),
    ]
    lx, ly = 0.4, 0.3
    ax.add_patch(FancyBboxPatch((lx, ly), 5.8, 1.1,
                                boxstyle="round,pad=0.02,rounding_size=0.08",
                                fc="white", ec=P["primary"], lw=1.2, zorder=2))
    for i, (c, t) in enumerate(legend_items):
        ax.add_patch(Ellipse((lx + 0.5 + i*1.4, ly + 0.55), 0.45, 0.35,
                             fc=c, ec=P["primary"], lw=1, zorder=3))
        ax.text(lx + 0.5 + i*1.4, ly + 0.2, t, fontsize=7.5,
                ha="center", color=P["ink"])

    title_bar(ax, "Use Case Diagram",
              "Actors and the use cases exposed by the ChopWise system")
    fig.tight_layout(rect=[0, 0, 1, 0.93])
    fig.savefig(os.path.join(OUT, "use_case_diagram.png"),
                dpi=180, facecolor=fig.get_facecolor())
    plt.close(fig)


# ============================================================
# 4) SEQUENCE DIAGRAM (reservation booking + payment)
# ============================================================
def draw_sequence():
    fig, ax = setup((20, 17))
    ax.set_xlim(0, 24); ax.set_ylim(-0.5, 19)

    # participants
    parts = [
        ("Diner", icon_user, 2.0),
        ("Web App\n(Next.js)", None, 6.0),
        ("Server\nActions", None, 10.0),
        ("Database\n(Prisma)", None, 14.0),
        ("Payment\nService", icon_card, 18.0),
        ("Restaurant\nOwner", icon_chef, 22.0),
    ]
    top_y = 17.5
    bot_y = 0.0
    for name, icon_fn, x in parts:
        ax.add_patch(FancyBboxPatch((x - 1.1, top_y - 0.6), 2.2, 1.2,
                                    boxstyle="round,pad=0.02,rounding_size=0.1",
                                    fc=P["primary"], ec=P["primary"], zorder=4))
        ax.text(x, top_y, name, ha="center", va="center", color="white",
                fontsize=10, fontweight="bold", zorder=5)
        if icon_fn:
            icon_fn(ax, x, top_y + 0.95)
        # lifeline
        ax.plot([x, x], [top_y - 0.6, bot_y], color=P["muted"],
                lw=1, ls=(0, (3, 3)), zorder=2)

    diner_x, app_x, srv_x, db_x, pay_x, owner_x = (p[2] for p in parts)

    def msg(y, src, dst, text, style="-|>", color=None, lw=1.6, dashed=False):
        color = color or P["line"]
        ls = "--" if dashed else "-"
        ax.add_patch(FancyArrowPatch((src, y), (dst, y), arrowstyle=style,
                                     mutation_scale=12, color=color, lw=lw,
                                     linestyle=ls, zorder=3))
        mx = (src + dst) / 2
        ax.text(mx, y + 0.18, text, fontsize=9, ha="center", color=color,
                bbox=dict(facecolor=P["bg"], edgecolor="none", pad=1.5),
                zorder=4)

    def activation(x, y0, y1):
        ax.add_patch(Rectangle((x - 0.12, y1), 0.24, y0 - y1,
                               fc=P["accent"], ec=P["primary"], lw=0.6, zorder=3))

    def note(x, y, w, h, text):
        ax.add_patch(FancyBboxPatch((x, y), w, h,
                                    boxstyle="round,pad=0.02,rounding_size=0.06",
                                    fc=P["cream"], ec=P["primary"], lw=1, zorder=4))
        ax.text(x + w/2, y + h/2, text, ha="center", va="center",
                fontsize=8.5, color=P["ink"], zorder=5, style="italic")

    # ----- flow -----
    y = 16.4
    msg(y, diner_x, app_x, "1. Submit reservation form")
    y -= 0.6
    msg(y, app_x, srv_x, "2. createReservation(dto)")
    y -= 0.6
    msg(y, srv_x, db_x, "3. INSERT Reservation (PENDING)")
    activation(srv_x, y + 0.2, y - 2.4)
    y -= 0.5
    msg(y, db_x, srv_x, "ok", style="-|>", dashed=True, color=P["muted"])
    y -= 0.6
    msg(y, srv_x, db_x, "4. UPDATE → AWAITING_RESPONSE\n   (set responseDeadline = now+15m)")
    y -= 0.7
    msg(y, db_x, srv_x, "ok", style="-|>", dashed=True, color=P["muted"])
    y -= 0.5
    msg(y, srv_x, owner_x, "5. notifyRestaurant(...)", color=P["accent"])
    y -= 0.6
    msg(y, srv_x, app_x, "Reservation { AWAITING_RESPONSE }",
        style="-|>", dashed=True, color=P["muted"])
    y -= 0.6
    msg(y, app_x, diner_x, "Show 'Waiting for restaurant…'",
        style="-|>", dashed=True, color=P["muted"])

    note(8.0, y - 1.2, 8.0, 0.9,
         "Owner has 15 min to respond, otherwise Cron auto-cancels the booking.")
    y -= 1.5

    msg(y, owner_x, app_x, "6. Accept booking")
    y -= 0.6
    msg(y, app_x, srv_x, "7. acceptReservation(id)")
    y -= 0.6
    msg(y, srv_x, db_x, "8. UPDATE → PAYMENT_PENDING\n   (set paymentDeadline = now+30m, bookingFee)")
    activation(srv_x, y + 0.2, y - 2.5)
    y -= 0.7
    msg(y, db_x, srv_x, "ok", style="-|>", dashed=True, color=P["muted"])
    y -= 0.5
    msg(y, srv_x, diner_x, "Notify: 'Restaurant accepted — please pay'",
        color=P["accent"])
    y -= 0.6

    msg(y, diner_x, app_x, "9. Go to checkout")
    y -= 0.6
    msg(y, app_x, srv_x, "10. initializePayment(reservation)")
    y -= 0.6
    msg(y, srv_x, pay_x, "11. createSession(amount=500 XAF)")
    y -= 0.6
    msg(y, pay_x, srv_x, "{ reference, checkoutUrl }",
        style="-|>", dashed=True, color=P["muted"])
    y -= 0.6
    msg(y, srv_x, db_x, "12. Save paymentReference")
    y -= 0.6
    msg(y, srv_x, diner_x, "Redirect → checkout page",
        style="-|>", dashed=True, color=P["muted"])
    y -= 0.7

    msg(y, diner_x, pay_x, "13. Confirm payment (simulated)")
    y -= 0.6
    msg(y, pay_x, srv_x, "14. confirmSimulatedPayment(ref)")
    y -= 0.6
    msg(y, srv_x, db_x, "15. UPDATE → CONFIRMED, set paidAt")
    activation(srv_x, y + 0.2, y - 1.6)
    y -= 0.7
    msg(y, db_x, srv_x, "ok", style="-|>", dashed=True, color=P["muted"])
    y -= 0.5
    msg(y, srv_x, owner_x, "16. notify: 'Reservation confirmed'",
        color=P["accent"])
    y -= 0.5
    msg(y, srv_x, diner_x, "17. show receipt", color=P["accent"])

    title_bar(ax, "Sequence Diagram",
              "Reservation booking flow — Diner ↔ ChopWise ↔ Owner")
    fig.tight_layout(rect=[0, 0, 1, 0.94])
    fig.savefig(os.path.join(OUT, "sequence_diagram.png"),
                dpi=180, facecolor=fig.get_facecolor())
    plt.close(fig)


# ============================================================
# 5) STATE DIAGRAM (Reservation status)
# ============================================================
def draw_state():
    fig, ax = setup((20, 12))
    ax.set_xlim(0, 22); ax.set_ylim(0, 14)

    def state(x, y, w, h, name, sub=None, color=None):
        color = color or P["primary"]
        ax.add_patch(FancyBboxPatch((x - w/2, y - h/2), w, h,
                                    boxstyle="round,pad=0.02,rounding_size=0.18",
                                    fc="white", ec=color, lw=2.5, zorder=3))
        ax.add_patch(FancyBboxPatch((x - w/2, y + h/2 - 0.5), w, 0.5,
                                    boxstyle="round,pad=0.02,rounding_size=0.18",
                                    fc=color, ec=color, zorder=4))
        ax.text(x, y + h/2 - 0.25, name, ha="center", va="center",
                fontsize=11, fontweight="bold", color="white", zorder=5)
        if sub:
            ax.text(x, y - 0.1, sub, ha="center", va="center", fontsize=8.5,
                    color=P["muted"], style="italic", zorder=5)

    def initial(x, y):
        ax.add_patch(Circle((x, y), 0.18, fc=P["ink"], zorder=5))

    def final(x, y):
        ax.add_patch(Circle((x, y), 0.25, fc="white", ec=P["ink"], lw=2, zorder=5))
        ax.add_patch(Circle((x, y), 0.13, fc=P["ink"], zorder=6))

    def trans(x1, y1, x2, y2, label, color=None, curve=0, dashed=False,
              label_offset=(0, 0.2)):
        color = color or P["line"]
        ls = "--" if dashed else "-"
        cs = f"arc3,rad={curve}"
        ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>",
                                     mutation_scale=14, color=color, lw=1.7,
                                     linestyle=ls,
                                     connectionstyle=cs, zorder=3))
        mx = (x1 + x2) / 2 + label_offset[0]
        my = (y1 + y2) / 2 + label_offset[1]
        # apply curve offset roughly
        if curve != 0:
            my += curve * 1.6
        ax.text(mx, my, label, fontsize=8.5, ha="center", color=color,
                bbox=dict(facecolor=P["bg"], edgecolor=P["primary"],
                          boxstyle="round,pad=0.25", lw=1), zorder=6)

    # layout
    initial(1.2, 7.0)
    state(3.5, 7.0, 2.4, 1.3, "PENDING",  "created, pre-validate", P["info"])
    state(7.5, 7.0, 3.0, 1.5, "AWAITING_RESPONSE",
          "owner must reply in 15m", P["warn"])
    state(12.0, 9.0, 2.6, 1.3, "ACCEPTED",
          "ready to pay", P["ok"])
    state(15.5, 7.0, 3.0, 1.5, "PAYMENT_PENDING",
          "pay within 30m", P["accent"])
    state(19.5, 7.0, 2.2, 1.3, "CONFIRMED",
          "guest expected", P["ok"])
    state(7.5, 3.0, 2.4, 1.3, "REJECTED",
          "owner declined", P["danger"])
    state(15.5, 3.0, 2.4, 1.3, "CANCELLED",
          "by user / system", P["danger"])
    final(20.8, 3.0)

    # transitions
    trans(1.4, 7.0, 2.3, 7.0, "createReservation()", label_offset=(0, 0.25))
    trans(4.7, 7.0, 6.0, 7.0, "validate ok")
    trans(9.0, 7.2, 10.7, 8.7, "owner accepts",
          color=P["ok"])
    trans(9.0, 6.6, 14.0, 6.5, "auto → payment\n(in some flows)",
          color=P["accent"], curve=-0.15)
    trans(13.3, 8.6, 14.5, 7.6, "set paymentDeadline",
          color=P["accent"])
    trans(17.0, 7.0, 18.4, 7.0, "payment success",
          color=P["ok"])

    # rejections / cancels
    trans(7.5, 6.25, 7.5, 3.65, "owner rejects",
          color=P["danger"], label_offset=(0.7, 0))
    trans(6.0, 7.5, 4.2, 7.5, "client cancels", color=P["danger"], curve=0.2,
          label_offset=(0, 0.4))
    trans(7.5, 6.25, 14.5, 3.6, "no response\n(Cron auto-cancel)",
          color=P["danger"], curve=-0.25)
    trans(15.5, 6.25, 15.5, 3.65, "payment timeout\nor client cancel",
          color=P["danger"], label_offset=(0.9, 0))
    trans(19.5, 6.25, 16.5, 3.5, "client cancels\nafter confirm",
          color=P["danger"], curve=-0.2)

    # to final
    trans(8.7, 3.0, 14.3, 3.0, "[terminal]", dashed=True, color=P["muted"])
    trans(16.7, 3.0, 20.55, 3.0, "[terminal]", dashed=True, color=P["muted"])

    # legend
    leg_x, leg_y = 0.4, 0.3
    ax.add_patch(FancyBboxPatch((leg_x, leg_y), 9.5, 1.3,
                                boxstyle="round,pad=0.02,rounding_size=0.1",
                                fc="white", ec=P["primary"], lw=1.2))
    items = [
        (P["info"], "draft"), (P["warn"], "waiting"),
        (P["ok"], "success"), (P["accent"], "payment"),
        (P["danger"], "terminal")
    ]
    for i, (c, t) in enumerate(items):
        ax.add_patch(Rectangle((leg_x + 0.3 + i*1.85, leg_y + 0.6), 0.4, 0.3,
                               fc=c, ec=c))
        ax.text(leg_x + 0.8 + i*1.85, leg_y + 0.75, t, va="center",
                fontsize=9, color=P["ink"])
    ax.text(leg_x + 0.3, leg_y + 0.25,
            "Source: src/lib/reservation-status.ts — canTransitionTo / isTerminal / isCancellable",
            fontsize=8.5, color=P["muted"], style="italic")

    title_bar(ax, "State Diagram",
              "Reservation status — finite state machine with 7 states + 2 terminals")
    fig.tight_layout(rect=[0, 0, 1, 0.93])
    fig.savefig(os.path.join(OUT, "state_diagram.png"),
                dpi=180, facecolor=fig.get_facecolor())
    plt.close(fig)


# ============================================================
# 6) ACTIVITY DIAGRAM (end-to-end booking)
# ============================================================
def draw_activity():
    fig, ax = setup((18, 16))
    ax.set_xlim(0, 18); ax.set_ylim(0, 22)

    # swim lanes
    lanes = [("Diner", 0, 5),
             ("ChopWise System", 5, 13),
             ("Restaurant Owner", 13, 18)]
    for name, x0, x1 in lanes:
        ax.add_patch(Rectangle((x0, 0.5), x1 - x0, 20.5,
                               fc=P["cream"] if name == "ChopWise System" else "white",
                               ec=P["primary"], lw=1.5, zorder=1))
        ax.add_patch(Rectangle((x0, 20.0), x1 - x0, 0.8,
                               fc=P["primary"], ec=P["primary"], zorder=2))
        ax.text((x0 + x1) / 2, 20.4, name, ha="center", va="center",
                color="white", fontsize=12, fontweight="bold", zorder=3)

    def initial(x, y):
        ax.add_patch(Circle((x, y), 0.22, fc=P["ink"], zorder=5))

    def final(x, y):
        ax.add_patch(Circle((x, y), 0.3, fc="white", ec=P["ink"], lw=2, zorder=5))
        ax.add_patch(Circle((x, y), 0.16, fc=P["ink"], zorder=6))

    def action(x, y, text, w=3.4, h=0.85, color=None):
        color = color or P["primary"]
        ax.add_patch(FancyBboxPatch((x - w/2, y - h/2), w, h,
                                    boxstyle="round,pad=0.02,rounding_size=0.25",
                                    fc="white", ec=color, lw=1.8, zorder=3))
        ax.text(x, y, text, ha="center", va="center", fontsize=9,
                color=P["ink"], zorder=4)

    def decision(x, y, text, size=1.0):
        diamond = Polygon([(x, y + size), (x + size, y), (x, y - size), (x - size, y)],
                          closed=True, fc=P["warn"], ec=P["primary"], lw=1.5, zorder=3)
        ax.add_patch(diamond)
        ax.text(x, y, text, ha="center", va="center", fontsize=8.5,
                color=P["ink"], fontweight="bold", zorder=4)

    def arr(x1, y1, x2, y2, label=None, color=None, dashed=False,
            connectionstyle="arc3,rad=0", label_offset=(0.2, 0)):
        color = color or P["line"]
        ls = "--" if dashed else "-"
        ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>",
                                     mutation_scale=13, color=color, lw=1.5,
                                     linestyle=ls,
                                     connectionstyle=connectionstyle, zorder=3))
        if label:
            mx = (x1 + x2) / 2 + label_offset[0]
            my = (y1 + y2) / 2 + label_offset[1]
            ax.text(mx, my, label, fontsize=8.5, color=color, ha="center",
                    bbox=dict(facecolor=P["bg"], edgecolor="none", pad=1.5),
                    zorder=6)

    # ----- flow -----
    initial(2.5, 19.5)
    action(2.5, 18.5, "Browse / search\nrestaurants", color=P["primary"])
    action(2.5, 17.2, "Open restaurant\ndetail page")
    action(2.5, 15.9, "Submit reservation\nform (date, time, guests)")

    action(9.0, 15.9, "Validate input &\ncreate reservation",
           color=P["accent"], w=3.6)
    action(9.0, 14.6, "Set status = AWAITING_RESPONSE\nresponseDeadline = now + 15m",
           color=P["accent"], w=4.5, h=1.0)
    action(9.0, 13.3, "Notify restaurant",
           color=P["accent"])

    decision(9.0, 11.6, "Owner replied\nwithin 15m?")
    action(2.5, 11.6, "Reservation\nauto-cancelled", color=P["danger"])
    action(15.5, 13.3, "Receive booking\nnotification", color=P["ok"])
    decision(15.5, 11.6, "Accept?")

    action(9.0, 9.8, "Status → PAYMENT_PENDING\npaymentDeadline = now + 30m",
           color=P["accent"], w=4.5, h=1.0)
    action(15.5, 9.8, "Status → REJECTED\n(send reason)", color=P["danger"])

    action(2.5, 8.5, "Go to checkout\n(pay 500 XAF fee)", color=P["primary"])

    decision(9.0, 7.0, "Payment OK\nwithin 30m?")

    action(2.5, 5.5, "Show receipt\n& confirmation", color=P["ok"])
    action(9.0, 5.5, "Status → CONFIRMED\nNotify both parties", color=P["ok"],
           w=4.0)
    action(15.5, 5.5, "Status → CANCELLED\n(payment timeout)", color=P["danger"])

    final(9.0, 2.0)

    # arrows
    arr(2.5, 19.3, 2.5, 18.95)
    arr(2.5, 18.05, 2.5, 17.65)
    arr(2.5, 16.75, 2.5, 16.35)
    arr(2.5, 15.9, 7.15, 15.9)
    arr(9.0, 15.45, 9.0, 15.1)
    arr(9.0, 14.05, 9.0, 13.75)
    arr(9.0, 12.85, 9.0, 12.6)

    arr(8.0, 11.6, 4.2, 11.6, "no")
    arr(2.5, 11.05, 2.5, 9.0)  # cancelled exits later
    arr(2.5, 11.05, 5.7, 5.5,
        connectionstyle="arc3,rad=-0.3", label="auto-cancel", color=P["danger"])
    arr(10.0, 11.6, 13.85, 11.6, "yes")
    arr(15.5, 12.85, 15.5, 12.6)

    arr(14.5, 11.6, 11.0, 10.4, "yes", connectionstyle="arc3,rad=-0.2",
        color=P["ok"])
    arr(15.5, 10.55, 15.5, 10.25, "no")

    arr(9.0, 9.3, 4.2, 8.85, "client must pay", connectionstyle="arc3,rad=-0.2")
    arr(2.5, 8.05, 2.5, 7.4)
    arr(2.5, 7.0, 8.0, 7.0)

    arr(9.0, 6.0, 2.5, 6.0, "fee paid", color=P["ok"],
        connectionstyle="arc3,rad=-0.2")
    arr(2.5, 6.0, 2.5, 5.95)
    arr(9.0, 6.0, 9.0, 5.95, "confirm", color=P["ok"])
    arr(10.0, 7.0, 15.5, 6.0, "no / timeout", color=P["danger"],
        connectionstyle="arc3,rad=-0.2")

    arr(2.5, 5.05, 7.5, 2.2, connectionstyle="arc3,rad=-0.2", color=P["ok"])
    arr(9.0, 5.05, 9.0, 2.3, color=P["ok"])
    arr(15.5, 5.05, 10.5, 2.2, connectionstyle="arc3,rad=0.2", color=P["danger"])

    title_bar(ax, "Activity Diagram",
              "End-to-end reservation lifecycle across three swim lanes")
    fig.tight_layout(rect=[0, 0, 1, 0.95])
    fig.savefig(os.path.join(OUT, "activity_diagram.png"),
                dpi=180, facecolor=fig.get_facecolor())
    plt.close(fig)


# ----------- run all -----------
if __name__ == "__main__":
    draw_er()
    draw_class()
    draw_usecase()
    draw_sequence()
    draw_state()
    draw_activity()
    print("All diagrams written to:", OUT)
