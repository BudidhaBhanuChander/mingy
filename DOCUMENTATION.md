# Grocery Delivery Full-Stack App — Project Documentation

> Based on the tutorial: **Build & Deploy Grocery Delivery App with Live Order Tracking | Full Stack Project Tutorial 2026**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Folder Structure](#4-folder-structure)
5. [Database Schema](#5-database-schema)
6. [Backend — Server](#6-backend--server)
7. [Frontend — Client](#7-frontend--client)
8. [Authentication System](#8-authentication-system)
9. [Background Jobs (Inngest)](#9-background-jobs-inngest)
10. [Third-Party Integrations](#10-third-party-integrations)
11. [Environment Variables](#11-environment-variables)
12. [API Reference](#12-api-reference)
13. [Running the Project Locally](#13-running-the-project-locally)
14. [Deployment](#14-deployment)

---

## 1. Project Overview

This is a **full-stack grocery delivery web application** built with React, Node.js/Express, and Prisma. It mimics a real-world service like Instacart and covers three distinct user roles:

| Role | What they can do |
|---|---|
| **Customer** | Browse products, manage cart, checkout with Stripe, track orders live on a map |
| **Admin** | Manage products and inventory, oversee all orders, manage delivery partners |
| **Delivery Partner** | Accept orders, verify pickup/drop via OTP, update live location |

The project was built as a comprehensive tutorial covering full-stack development, covering authentication, payments, real-time tracking, background jobs, image uploads, and cloud deployment.

---

## 2. Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.4 | UI framework |
| TypeScript | 6.0.2 | Type safety |
| Vite | 8.0.4 | Build tool & dev server |
| Tailwind CSS | 4.2.2 | Utility-first styling |
| React Router DOM | 7.14.0 | Client-side routing |
| Axios | 1.15.2 | HTTP client with interceptors |
| Leaflet + React Leaflet | 1.9.4 / 5.0.0 | Interactive maps for order tracking |
| React Hot Toast | 2.6.0 | Toast notifications |
| Lucide React | — | Icon library |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 5.2.1 | HTTP server & REST API |
| TypeScript | 6.0.3 | Type safety |
| Prisma ORM | 7.7.0 | Type-safe database access |
| Neon (PostgreSQL) | — | Production database |
| SQLite | — | Local development database |
| JWT | 9.0.3 | Authentication tokens |
| Bcrypt | 6.0.0 | Password hashing |
| Multer | 2.1.1 | File upload handling |
| Cloudinary | 2.9.0 | Cloud image storage |
| Stripe | 22.1.0 | Payment processing |
| Nodemailer | 8.0.5 | Transactional emails (via Brevo SMTP) |
| Inngest | 4.2.4 | Background jobs & scheduled tasks |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          BROWSER                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React SPA  (Vite + TypeScript)              │   │
│  │   AuthContext ──── CartContext ──── React Router DOM     │   │
│  │   Axios (+ JWT interceptor)  ──── Leaflet Maps           │   │
│  └────────────────────────┬────────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────────┘
                            │ REST API (HTTP/JSON)
┌───────────────────────────▼─────────────────────────────────────┐
│                    EXPRESS SERVER (Node.js)                      │
│   Routes → Middleware (JWT / Admin / DeliveryAuth)               │
│         → Controllers → Prisma ORM → Database                   │
│                                                                  │
│   ┌──────────────────────────────────────────────────────┐      │
│   │                  INTEGRATIONS                         │      │
│   │  Cloudinary │ Stripe (+ Webhooks) │ Nodemailer        │      │
│   │  Inngest (background jobs)                            │      │
│   └──────────────────────────────────────────────────────┘      │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Prisma Client
┌───────────────────────────▼─────────────────────────────────────┐
│               DATABASE  (SQLite dev / Neon Postgres prod)        │
│   User │ Address │ Product │ Order │ DeliveryPartner             │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

- **MVC on the backend** — Routes define endpoints, Middleware handles guards, Controllers hold business logic.
- **Context API on the frontend** — `AuthContext` manages the logged-in user; `CartContext` manages cart items globally.
- **Protected Routes** — A `ProtectedRoute` wrapper component redirects unauthenticated users away from checkout, orders, and addresses.
- **Axios Interceptors** — Automatically attach the JWT to every outgoing request and handle `401` errors globally.
- **Event-driven background work** — Inngest handles async tasks (low-stock alerts, promo emails, rider auto-assignment) outside the request/response cycle.
- **Multi-role auth** — Separate JWT-based auth flows for customers, admins (checked via email allowlist), and delivery partners.

---

## 4. Folder Structure

```
grocery-delivery-fullstack/
├── How to Run Project.pdf     ← Setup guide included with tutorial
│
├── client/                    ← React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/            ← Static assets & dummy seed data
│   │   ├── components/        ← Reusable UI components
│   │   │   ├── Checkout/      ← Checkout flow UI pieces
│   │   │   ├── Delivery/      ← Delivery partner UI pieces
│   │   │   ├── Home/          ← Homepage sections (hero, categories, etc.)
│   │   │   ├── OrderTracking/ ← Live map + status timeline
│   │   │   ├── AddressCard.tsx
│   │   │   ├── AddressForm.tsx
│   │   │   ├── Banner.tsx
│   │   │   ├── CartSidebar.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── config/            ← Axios instance configuration
│   │   ├── context/
│   │   │   ├── AuthContext.tsx ← User session state
│   │   │   └── CartContext.tsx ← Shopping cart state
│   │   ├── pages/
│   │   │   ├── admin/         ← Admin dashboard pages
│   │   │   ├── delivery/      ← Delivery partner pages
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── ProductPage.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   ├── FlashDeals.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Addresses.tsx
│   │   │   ├── MyOrders.tsx
│   │   │   ├── OrderTracking.tsx
│   │   │   └── AppLayout.tsx  ← Root layout (Navbar + Footer)
│   │   ├── types/             ← Shared TypeScript interfaces
│   │   ├── App.tsx            ← Route definitions
│   │   └── main.tsx           ← ReactDOM.createRoot entry
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vercel.json
│
└── server/                    ← Express backend
    ├── config/
    │   ├── cloudinary.ts      ← Cloudinary SDK setup
    │   ├── nodemailer.ts      ← SMTP transporter setup
    │   └── prisma.ts          ← Prisma client singleton
    ├── controllers/
    │   ├── authController.ts
    │   ├── productController.ts
    │   ├── orderController.ts
    │   ├── addressController.ts
    │   ├── adminController.ts
    │   ├── deliveryPartnerController.ts
    │   └── webhooks.ts        ← Stripe webhook handler
    ├── middleware/
    │   ├── auth.ts            ← Verify customer JWT
    │   ├── admin.ts           ← Verify admin role
    │   └── deliveryAuth.ts    ← Verify delivery partner JWT
    ├── routes/
    │   ├── authRoutes.ts
    │   ├── productRoutes.ts
    │   ├── orderRoutes.ts
    │   ├── addressRoutes.ts
    │   ├── adminRoutes.ts
    │   ├── deliveryPartnerRoutes.ts
    │   └── uploadRoutes.ts
    ├── inngest/
    │   └── index.ts           ← Background job definitions
    ├── prisma/
    │   └── schema.prisma      ← Data models
    ├── types/                 ← Server-side TypeScript types
    ├── generated/             ← Prisma auto-generated client
    ├── server.ts              ← Express app entry point
    ├── seed.ts                ← Database seed script
    ├── package.json
    └── vercel.json
```

---

## 5. Database Schema

Defined in [server/prisma/schema.prisma](server/prisma/schema.prisma).

### User
Represents a customer account.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Full name |
| email | String | Unique |
| password | String | Bcrypt hashed |
| phone | String? | Optional |
| avatar | String? | Cloudinary URL |
| addresses | Address[] | One-to-many |
| orders | Order[] | One-to-many |

### Address
Delivery addresses saved by a user.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| userId | String | FK → User |
| label | String | e.g. "Home", "Work" |
| address | String | Street address |
| city, state, zip | String | Location fields |
| isDefault | Boolean | Default address flag |
| lat, lng | Float? | Coordinates for map |

### Product
Grocery items listed in the catalog.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Product name |
| description | String | Product details |
| price | Float | Sale price |
| originalPrice | Float | Pre-discount price |
| image | String | Cloudinary URL |
| category | String | e.g. "Fruits", "Dairy" |
| unit | String | e.g. "kg", "dozen" |
| stock | Int | Inventory count |
| isOrganic | Boolean | Organic label flag |
| rating | Float | Average rating |
| reviewCount | Int | Number of reviews |

### Order
A customer's purchase.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| userId | String | FK → User |
| items | Json | Array of `{ productId, name, price, qty }` |
| shippingAddress | Json | Snapshot of delivery address |
| paymentMethod | String | e.g. "card", "cod" |
| subtotal, deliveryFee, tax, total | Float | Price breakdown |
| status | String | e.g. "placed", "out_for_delivery", "delivered" |
| statusHistory | Json | Array of `{ status, timestamp }` |
| deliveryPartnerId | String? | FK → DeliveryPartner |
| deliveryOtp | String? | 4-digit OTP for handoff verification |
| liveLocation | Json? | `{ lat, lng }` updated by delivery partner |
| isPaid | Boolean | Stripe payment confirmed |

### DeliveryPartner
A rider/courier account.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Full name |
| email | String | Unique |
| password | String | Bcrypt hashed |
| phone | String | Contact number |
| avatar | String? | Cloudinary URL |
| vehicleType | String | e.g. "bike", "car" |
| isActive | Boolean | Available for assignment |
| orders | Order[] | Assigned orders |

---

## 6. Backend — Server

### Entry Point — `server.ts`

Sets up the Express app, registers all route groups, connects the Inngest middleware, and starts listening on the configured port (default `5000`).

### Middleware Stack

| File | Applied to | What it does |
|---|---|---|
| `middleware/auth.ts` | Customer routes | Validates `Authorization: Bearer <token>` JWT; attaches decoded user to `req.user` |
| `middleware/admin.ts` | Admin routes | Checks `req.user.email` against the `ADMIN_EMAILS` allowlist |
| `middleware/deliveryAuth.ts` | Delivery routes | Validates delivery partner JWT separately |

### Controllers

#### `authController.ts`
- `register` — hash password with bcrypt, create User in DB, return JWT
- `login` — verify credentials, return JWT
- Delivery partner equivalents (`registerDelivery`, `loginDelivery`)

#### `productController.ts`
- `getProducts` — paginated, filterable product list
- `getProductById` — single product details
- `createProduct` / `updateProduct` / `deleteProduct` — admin-only CRUD
- Triggers Inngest low-stock event when stock drops below threshold

#### `orderController.ts`
- `createOrder` — creates order, initiates Stripe checkout session
- `getMyOrders` — customer's order history
- `getAllOrders` — admin view
- `updateOrderStatus` — admin/delivery partner status updates

#### `addressController.ts`
- Full CRUD for a user's saved delivery addresses
- Handles setting a default address

#### `adminController.ts`
- Dashboard stats (total orders, revenue, low stock count)
- Delivery partner management (create, list, toggle active status)

#### `deliveryPartnerController.ts`
- `getAssignedOrders` — orders assigned to this partner
- `updateLocation` — saves `{ lat, lng }` to `order.liveLocation`
- `verifyOtp` — validates pickup/delivery OTP
- `updateDeliveryStatus` — moves order through delivery states

#### `webhooks.ts`
- Handles `checkout.session.completed` from Stripe
- Marks order `isPaid = true` and triggers Inngest auto-assign-rider event

---

## 7. Frontend — Client

### Routing — `App.tsx`

All routes are nested under `AppLayout` (which renders the `Navbar` and `Footer`).

| Path | Component | Protected? |
|---|---|---|
| `/` | `Home` | No |
| `/products` | `Products` | No |
| `/products/:id` | `ProductPage` | No |
| `/search` | `SearchResults` | No |
| `/flash-deals` | `FlashDeals` | No |
| `/checkout` | `Checkout` | Yes |
| `/addresses` | `Addresses` | Yes |
| `/my-orders` | `MyOrders` | Yes |
| `/order-tracking/:id` | `OrderTracking` | Yes |
| `/login` | `Login` | No |
| `/admin/*` | Admin pages | Yes (+ admin check) |
| `/delivery/*` | Delivery pages | Yes (+ delivery check) |

### State Management

#### `AuthContext.tsx`
- Stores the logged-in user object and JWT token
- On mount, reads token from `localStorage` to persist sessions
- Provides `login()`, `logout()`, and `user` to the whole app

#### `CartContext.tsx`
- Stores cart items as `{ product, quantity }[]`
- Provides `addToCart()`, `removeFromCart()`, `updateQuantity()`, `clearCart()`
- Cart is preserved in `localStorage`

### Key Components

#### `Navbar.tsx`
- Logo, search bar, cart icon (with item count badge), user avatar/login button
- Collapses to mobile menu on small screens

#### `CartSidebar.tsx`
- Slide-in panel showing cart items
- Quantity controls, item removal, subtotal
- "Checkout" button routes to `/checkout`

#### `ProductCard.tsx`
- Product image, name, price, original price (strikethrough), organic badge
- "Add to Cart" button with quantity stepper

#### `FilterPanel.tsx`
- Category filter checkboxes
- Price range slider
- Organic-only toggle
- Applied via URL query params so filters are shareable/bookmarkable

#### `OrderTracking` components
- `OrderTracking.tsx` page polls the API for order status
- Uses `react-leaflet` to render a map centered on the delivery address
- Shows the delivery partner's live `liveLocation` as a moving marker
- Status timeline shows each `statusHistory` entry with timestamps

#### `ProtectedRoute.tsx`
- Wraps routes that require authentication
- Redirects to `/login` with a `redirect` query param if user is not logged in

### Axios Configuration — `config/`

A pre-configured Axios instance:
- Sets `baseURL` from `VITE_BASE_URL`
- Request interceptor: attaches `Authorization: Bearer <token>` header
- Response interceptor: on `401`, clears auth state and redirects to login

---

## 8. Authentication System

The app uses three separate authentication flows, all JWT-based.

### Customer Auth
1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns a signed JWT containing `{ userId, email }`
3. Client stores the token in `localStorage` via `AuthContext`
4. All subsequent API calls include `Authorization: Bearer <token>`
5. `middleware/auth.ts` verifies the token on protected routes

### Admin Auth
- Admins log in using a regular customer account
- `middleware/admin.ts` checks if `req.user.email` is in the `ADMIN_EMAILS` environment variable
- No separate admin registration — admin status is purely email-based

### Delivery Partner Auth
- Separate registration/login endpoints under `/api/delivery`
- Issues a separate JWT with `{ deliveryPartnerId }` payload
- `middleware/deliveryAuth.ts` verifies this token on delivery routes

---

## 9. Background Jobs (Inngest)

Inngest provides durable background job execution. Jobs are defined in [server/inngest/index.ts](server/inngest/index.ts) and registered with the Express server via an Inngest middleware endpoint.

### Job 1: Low Stock Alert
- **Trigger**: Event fired from `productController` when a product's stock drops below a threshold (e.g., 10 units) after an order
- **Action**: Sends an email to admin addresses listing the low-stock products

### Job 2: Monthly Offers Email
- **Trigger**: Cron schedule — 1st of every month
- **Action**: Fetches all users from the database and sends a promotional email with current deals

### Job 3: Auto-Assign Rider
- **Trigger**: `order/paid` event fired by the Stripe webhook handler after a successful payment
- **Delay**: Waits 5 minutes before running (simulates kitchen preparation time)
- **Action**: Finds an active, available `DeliveryPartner` and assigns them to the order by setting `order.deliveryPartnerId`

---

## 10. Third-Party Integrations

### Cloudinary (Image Uploads)
- **Where**: Product images, user avatars, delivery partner avatars
- **How**: The client uploads the file to `/api/upload`. The server receives it via `Multer` (memory storage), then streams it to Cloudinary using the Cloudinary Node SDK. The returned secure URL is stored in the database.

### Stripe (Payments)
- **Where**: Checkout flow
- **How**:
  1. On order creation, the server calls `stripe.checkout.sessions.create()` with line items and a redirect URL
  2. Client redirects to the Stripe-hosted checkout page
  3. After payment, Stripe sends a `checkout.session.completed` webhook to `/api/webhooks/stripe`
  4. The webhook handler verifies the event signature, then marks the order as paid and fires the Inngest auto-assign-rider event

### Nodemailer + Brevo (Email)
- **Where**: Low-stock alerts, monthly promotional emails
- **How**: A nodemailer transporter is configured with Brevo's SMTP credentials. Inngest jobs call `transporter.sendMail()` with HTML email content.

### Leaflet Maps (Order Tracking)
- **Where**: `OrderTracking` page
- **How**: `react-leaflet` renders a `MapContainer` with a `TileLayer` (OpenStreetMap tiles). Delivery address coordinates are stored as `lat`/`lng` on the `Address` model. The delivery partner's app posts location updates to `/api/delivery/location`, which saves to `order.liveLocation`. The tracking page polls this endpoint and updates the marker position.

---

## 11. Environment Variables

### Client — `client/.env`

| Variable | Example | Purpose |
|---|---|---|
| `VITE_CURRENCY_SYMBOL` | `$` | Currency symbol shown in the UI |
| `VITE_BASE_URL` | `http://localhost:5000` | Backend API base URL |

### Server — `server/.env`

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `5000` | Express server port |
| `JWT_SECRET` | `supersecret` | Secret for signing JWTs |
| `ADMIN_EMAILS` | `admin@example.com,cto@example.com` | Comma-separated list of admin emails |
| `DATABASE_URL` | `file:./dev.db` | Prisma DB connection (SQLite for dev) |
| `CLOUDINARY_CLOUD_NAME` | `dxxxxx` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | `123456789` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `secret` | Cloudinary API secret |
| `INNGEST_EVENT_KEY` | `evt_xxx` | Inngest event signing key |
| `INNGEST_SIGNING_KEY` | `signkey_xxx` | Inngest webhook signing key |
| `SENDER_EMAIL` | `noreply@example.com` | From address for emails |
| `SMTP_USER` | `smtp_user` | Brevo SMTP username |
| `SMTP_PASS` | `smtp_pass` | Brevo SMTP password |
| `STRIPE_SECRET_KEY` | `sk_test_xxx` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxx` | Stripe webhook signing secret |

---

## 12. API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | None | Register a new customer |
| POST | `/login` | None | Login and receive JWT |
| POST | `/delivery/register` | None | Register delivery partner |
| POST | `/delivery/login` | None | Login as delivery partner |

### Products — `/api/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | None | List products (supports `?category=`, `?search=`, `?isOrganic=`) |
| GET | `/:id` | None | Get single product |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |

### Orders — `/api/orders`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Customer | Create order + Stripe session |
| GET | `/my` | Customer | Customer's own orders |
| GET | `/` | Admin | All orders |
| PUT | `/:id/status` | Admin/Delivery | Update order status |
| GET | `/:id` | Customer | Single order details |

### Addresses — `/api/addresses`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Customer | List user's addresses |
| POST | `/` | Customer | Add address |
| PUT | `/:id` | Customer | Update address |
| DELETE | `/:id` | Customer | Delete address |
| PUT | `/:id/default` | Customer | Set as default |

### Delivery — `/api/delivery`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/orders` | Delivery | View assigned orders |
| PUT | `/location/:orderId` | Delivery | Update live location |
| PUT | `/status/:orderId` | Delivery | Update delivery status |
| POST | `/verify-otp/:orderId` | Delivery | Verify pickup/dropoff OTP |

### Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | Admin | Dashboard stats |
| GET | `/delivery-partners` | Admin | List all delivery partners |
| POST | `/delivery-partners` | Admin | Create delivery partner |
| PUT | `/delivery-partners/:id` | Admin | Toggle active status |

### Upload — `/api/upload`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Admin | Upload image to Cloudinary, returns URL |

### Webhooks — `/api/webhooks`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/stripe` | Stripe signature | Handle Stripe payment events |

---

## 13. Running the Project Locally

See the included `How to Run Project.pdf` for the full walkthrough. Summary:

### Prerequisites
- Node.js 18+
- A free account on: Cloudinary, Stripe, Inngest, Brevo (email SMTP)

### 1. Install dependencies

```bash
# Install client deps
cd client && npm install

# Install server deps
cd ../server && npm install
```

### 2. Configure environment variables

Copy the `.env` examples and fill in your credentials.

```bash
# server/.env
PORT=5000
JWT_SECRET=your_jwt_secret
ADMIN_EMAILS=your@email.com
DATABASE_URL=file:./dev.db
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
SENDER_EMAIL=...
SMTP_USER=...
SMTP_PASS=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# client/.env
VITE_CURRENCY_SYMBOL=$
VITE_BASE_URL=http://localhost:5000
```

### 3. Set up the database

```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed      # optional: seeds sample products
```

### 4. Start the servers

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

The app will be available at `http://localhost:5173`.

### 5. Stripe webhook (local testing)

Use the Stripe CLI to forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

Copy the `whsec_...` signing secret it outputs into your `server/.env`.

---

## 14. Deployment

Both client and server include `vercel.json` configuration for deployment on Vercel.

### Client (Vercel)
- Build command: `tsc -b && vite build`
- Output directory: `dist`
- Set `VITE_BASE_URL` to your deployed server URL in Vercel environment variables

### Server (Vercel)
- The `vercel.json` routes all traffic to `server.ts`
- `postinstall` script runs `prisma generate` automatically
- Switch `DATABASE_URL` to your Neon PostgreSQL connection string for production
- Add all server environment variables in the Vercel project settings

### Production Database
Replace the local SQLite `DATABASE_URL` with a Neon serverless Postgres URL:

```
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

Run `npx prisma migrate deploy` after first deployment.
