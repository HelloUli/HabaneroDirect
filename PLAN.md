# Habanero Direct — MVP System Architecture

This document is the **main plan** for Habanero Direct. It applies to all four web apps in this repository (each lives in its own subfolder; per-app plans will follow).

## Planning principles

Architecture and implementation should prioritize:

- **Clarity** — easy to understand and operate
- **Simplicity** — minimal moving parts
- **Stability** — production-ready behavior
- **Real-world production readiness** — payments, payouts, delivery, and ops must work reliably

**Guardrails**

- Do **not** over-engineer.
- Do **not** design for hypothetical future features.
- Do **not** include anything outside MVP scope unless explicitly stated here.

---

## Product definition

**Habanero Direct** is a direct online ordering system for restaurants powered by:

- **Stripe** — payments and payouts via **Stripe Connect**
- **DoorDash Drive** — delivery fulfillment

**This is not** (for MVP priority):

- A full marketplace platform
- A driver network
- A dispatch system
- A logistics platform

---

## MVP goal

The MVP must allow:

- Restaurants to go live quickly
- Customers to place real orders
- Payments to be processed correctly
- Payouts to restaurants to be accurate
- Orders to be fulfilled via DoorDash
- A clean, high-converting ordering experience

**Rule:** If it does not help process an order today, it does not belong in MVP.

---

## MVP apps (4 total)

Four web apps, all powered by a **shared backend**.

### 1. Customer Ordering App (public — core)

**Users:** Customers.

**Entry points**

- `/order/[restaurant-slug]`
- Restaurant website button
- QR codes
- Google Business Profile links

This is the **primary conversion surface**.

### 2. Restaurant Portal (private — responsive web)

**Users:** Owner, staff (limited permissions).

**Devices:** Must work well on tablets and desktop.

This is the **operations layer**.

### 3. Admin Portal (private)

**Users:** Internal team operating the platform.

This is the **control center**.

### 4. Marketplace Web App (low priority — minimal MVP)

**Status:** Exists but is **not** a focus for MVP and must **not** introduce complexity.

**Purpose:** Simple discovery surface; lightweight listing of restaurants.

**MVP scope**

- Homepage listing restaurants
- Basic restaurant cards
- Link out to `/order/[restaurant-slug]`

**Optional (only if trivial)**

- Simple city filter
- Simple cuisine tags

**Explicitly not included**

- Advanced search
- Ranking algorithms
- Personalization
- Promotions logic
- Marketplace checkout

The marketplace should be **read-only and thin**, routing users into direct ordering pages only.

---

## Not in MVP

Do **not** include:

- Complex marketplace discovery systems
- Advanced search/filter UX
- Driver app
- Dispatch system
- Delivery network logic
- Loyalty systems
- Referrals
- Promo stacking
- Advanced analytics
- Future-phase abstractions

Stay extremely lean.

---

## Customer app — MVP features

### Core experience

- **Restaurant page** — Direct landing (no marketplace dependency): menu, hours, order options

### Menu

- Categories
- Item cards (square images)
- Item detail: cover image, modifiers, instructions

### Cart

- Modifiers, quantity, instructions
- Pickup vs delivery
- Pricing breakdown

### Promotions

- Promo code input
- Supports: fixed discount, percentage discount, minimum order, expiration, usage limits

### Checkout

- **Account required**
- Stripe payment
- Delivery or pickup
- Address input
- Order confirmation

### Order tracking

**Statuses:** `placed`, `confirmed`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `rejected`, `cancelled`

**Includes:** SMS updates, email receipt

**Optional (not required for MVP):** Live driver map

---

## Restaurant portal — MVP features

### Live order screen (critical)

**Columns:** New → In Progress → Ready

**Actions:** Accept, reject, mark preparing, mark ready

**Rule:** When marked **Ready** → trigger **DoorDash Drive API** (delivery orders only).

### Menu management

- Menus, categories, items, modifiers, images

### Store controls

- Hours
- Open/close toggle

### Reporting (basic only)

- Total sales
- Commission deducted
- Net payout (must be clearly defined in the system)
- Order counts

---

## Admin portal — MVP features

### Restaurant setup

- Create restaurant
- Generate slug
- Generate ordering link
- Generate embeddable order button
- Connect Stripe account
- Assign commission rate (per restaurant)

**Commission model**

- **5%** with website subscription
- **10%** without website subscription or light/free presence

### Orders oversight

- View all orders
- Issue refunds

### Promotions management (admin only)

- Create promo codes
- Configure type, value, rules
- Enable/disable

Restaurants **do not** manage promos in MVP.

### Platform settings

- Delivery fee
- Global settings

### Basic analytics

- Orders, revenue, restaurant performance

---

## Payments

Use **Stripe** + **Stripe Connect**.

The system must support:

- Customer payments
- Platform commission
- Restaurant payouts
- Refunds
- Auditability

**Must be defined in implementation**

- Correct Stripe Connect model
- How fees and commission are handled
- How payouts are tracked

---

## Delivery (DoorDash Drive)

**Flow**

1. Order placed  
2. Restaurant prepares  
3. Restaurant marks **Ready**  
4. System calls DoorDash API  
5. Driver assigned  
6. Webhook updates order status  

**Do not build:** Internal dispatch, driver management, fallback providers.

---

## Menu system

Menus originate from **MenuCheckpoint**.

**Requirements**

- Clean, structured menu schema
- Import-ready JSON format

**Support:** Menus, categories, items, modifiers, images — designed for easy ingestion.

---

## Technical direction

- Clean architecture
- Strong database design
- Clear API boundaries
- Simple, scalable patterns
- No over-engineering

---

## Repository layout

| Subfolder | App |
|-----------|-----|
| `OnlineOrdering` | Customer ordering (public) |
| `RestaurantOwners` | Restaurant portal |
| `AdminHub` | Admin portal |
| `MarketPlace` | Marketplace (minimal MVP) |

Each app will get its own detailed plan; this README is the **main** cross-cutting MVP spec.
