# computerservice.ng

Full-stack web application for **computerservice.ng** — a Nigerian document services platform offering printing, photocopying, typing, binding, scanning, graphic design, ID card production, CAC registration, NIN corrections, digital utility payments, and more, with doorstep delivery across Nigeria.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Pages & Features](#pages--features)
5. [API Routes](#api-routes)
6. [Database Schema](#database-schema)
7. [Environment Variables](#environment-variables)
8. [Local Development](#local-development)
9. [Deployment](#deployment)
10. [Admin Portal](#admin-portal)

---

## Project Overview

Customers visit the site, select a service, upload or type their document, choose a delivery method, and pay via Paystack. The admin receives instant notifications, manages orders through a dashboard, and updates order statuses in real time. Partners (businesses and individuals) can apply to join the network via a multi-step onboarding form with NDA agreement and photo uploads.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React, TypeScript, Tailwind CSS |
| State | Zustand (`useOrderStore`) |
| Backend API | Next.js API Routes + Express.js server (`/server`) |
| Database | PostgreSQL via [Neon](https://neon.tech) (serverless) |
| ORM | Prisma |
| Auth | JWT (cookie + localStorage) |
| Payments | Paystack |
| Email OTP | Resend |
| SMS OTP | Termii |
| File upload | react-dropzone + pdfjs-dist (auto page count) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Toast | react-hot-toast |
| Date | date-fns |

---

## Project Structure

```
computer-service.ng/
├── app/
│   ├── page.tsx                        # Homepage (service selector, hero, partners, footer)
│   ├── services/page.tsx               # Services catalogue
│   ├── pricing/page.tsx                # Pricing table
│   ├── terms/page.tsx                  # Terms & Conditions
│   ├── privacy/page.tsx                # Privacy Policy
│   ├── refund-policy/page.tsx          # Refund Policy
│   │
│   ├── order/
│   │   ├── details/                    # Step 1 — fill order form
│   │   │   ├── page.tsx                # Suspense wrapper
│   │   │   └── OrderDetailsContent.tsx # Full order form (service, document, delivery)
│   │   ├── review/page.tsx             # Step 2 — review & pay
│   │   ├── editor/page.tsx             # Rich text document editor
│   │   └── tracking/page.tsx           # Order tracking (OTP-gated)
│   │
│   ├── partners/onboarding/page.tsx    # Partner application (multi-step + NDA)
│   │
│   ├── admin/
│   │   ├── login/page.tsx              # Admin login
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # Main dashboard (orders + partners + stats)
│   │   │   ├── layout.tsx              # Sidebar layout
│   │   │   ├── settings/page.tsx       # Admin settings (phone, password, notifications)
│   │   │   └── orders/[id]/page.tsx    # Full order detail view
│   │   └── partners/page.tsx           # Partner applications viewer
│   │
│   ├── api/
│   │   ├── orders/                     # POST create order, GET by id
│   │   ├── payment/                    # Paystack initialize + verify
│   │   ├── partners/                   # POST submit application, GET photos
│   │   ├── send-otp/                   # SMS OTP (Termii)
│   │   ├── send-email-otp/             # Email OTP (Resend)
│   │   ├── verify-otp/                 # Verify OTP code
│   │   ├── settings/                   # GET public contact number
│   │   └── admin/
│   │       ├── orders/                 # GET list, PATCH status, DELETE
│   │       ├── partners/               # GET list, PATCH status, GET photos
│   │       ├── stats/                  # GET dashboard stats
│   │       ├── settings/               # GET + PATCH contact phone number
│   │       ├── change-password/        # POST change admin password
│   │       └── verify-password/        # POST verify admin password (for delete)
│   │
│   └── components/
│       ├── RecallModal.tsx             # Recall saved order by phone + OTP
│       ├── SaveProjectModal.tsx        # Save order progress modal
│       ├── PartnerModal.tsx            # Partner info modal
│       └── PolicyLayout.tsx            # Shared layout for policy pages
│
├── store/
│   └── useOrderStore.ts                # Zustand store — full order state + localStorage
│
├── lib/
│   ├── prisma.ts                       # Prisma client singleton
│   ├── auth.ts                         # JWT verify helper
│   ├── notify.ts                       # Email/SMS notification helpers
│   ├── otpStore.ts                     # In-memory OTP store
│   └── serialize.ts                    # Prisma Decimal serializer
│
├── server/                             # Express.js backend
│   ├── src/
│   │   ├── index.ts                    # Express app + CORS + routes
│   │   ├── routes/
│   │   │   ├── auth.ts                 # POST /api/auth/login, /setup
│   │   │   ├── orders.ts               # CRUD orders
│   │   │   ├── partners.ts             # Partner applications
│   │   │   ├── otp.ts                  # OTP send + verify
│   │   │   └── delivery-options.ts     # Delivery options management
│   │   ├── middleware/auth.ts          # JWT middleware
│   │   └── db/prisma.ts               # Prisma instance
│   └── prisma/
│       └── schema.prisma               # Database schema
│
└── public/                             # Static assets (logos, images)
```

---

## Pages & Features

### Customer-Facing

| Page | Path | Description |
|---|---|---|
| Homepage | `/` | Service quick-order form, partner logos, how-it-works, footer with contact |
| Services | `/services` | Full services catalogue with categories |
| Pricing | `/pricing` | Transparent pricing table |
| Order Details | `/order/details` | Full order form — service, document (upload/type/hardcopy), delivery, summary |
| Order Review | `/order/review` | Review order + Paystack payment |
| Order Tracking | `/order/tracking` | Track order by ID or ref — OTP-gated for privacy |
| Partner Onboarding | `/partners/onboarding` | Multi-step partner application with NDA + photo uploads |

### Admin Portal

| Page | Path | Description |
|---|---|---|
| Login | `/admin/login` | Email + password login |
| Dashboard | `/admin/dashboard` | Live orders table, stats cards, partner applications, real-time polling |
| Order Detail | `/admin/dashboard/orders/[id]` | Full order details + file download |
| Settings | `/admin/dashboard/settings` | Edit contact phone number, change password, notification preferences |

### Order Form — Document Modes

- **Upload File** — drag & drop PDF/Word/images (up to 50MB). PDF page count auto-detected via `pdfjs-dist`.
- **Type / Paste** — textarea with live word count. Pages auto-calculated at 250 words/page.
- **Hardcopy Pickup** — rider comes to collect physical documents. Three document count modes:
  - *I know the count* — enter exact number
  - *Not sure* — enter total pages, system estimates documents (~20 pages each)
  - *Custom* — free-text description of documents

### Delivery Options

| Method | Fee | Notes |
|---|---|---|
| Express Delivery | ₦3,000 | 30 min – 2 hrs |
| Standard Delivery | ₦2,000 | 2 hrs – 12 hrs |
| Economy Delivery | ₦1,000 | Within 24 hrs |
| Schedule Delivery | ₦5,000/stop | Multiple stops, custom time |
| Special Submission | Free | Via Submitar.com for government/private orgs |
| Hardcopy Pickup | — | Rider collects physical documents |

---

## API Routes

### Public

| Method | Path | Description |
|---|---|---|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/[id]` | Get order by ID |
| POST | `/api/payment/initialize` | Initialize Paystack payment |
| POST | `/api/payment/verify` | Verify Paystack payment + update status |
| POST | `/api/partners` | Submit partner application |
| GET | `/api/partners/[id]/photos` | Get partner photos |
| POST | `/api/send-otp` | Send SMS OTP (Termii) |
| POST | `/api/send-email-otp` | Send email OTP (Resend) |
| POST | `/api/verify-otp` | Verify OTP |
| GET | `/api/settings` | Get public contact phone number |
| POST | `/api/auth/login` | Admin login → returns JWT |
| POST | `/api/auth/logout` | Clear auth cookie |

### Admin (requires `Authorization: Bearer <token>`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/orders` | List orders (filter by status, search) |
| PATCH | `/api/admin/orders/[id]` | Update order status |
| DELETE | `/api/admin/orders/[id]` | Delete order (password-confirmed) |
| GET | `/api/admin/partners` | List partner applications |
| PATCH | `/api/admin/partners/[id]` | Update application status |
| GET | `/api/admin/partners/[id]/photos` | Get partner photos |
| GET | `/api/admin/stats` | Dashboard stats (counts + revenue) |
| GET | `/api/admin/settings` | Get contact phone number |
| PATCH | `/api/admin/settings` | Update contact phone number |
| POST | `/api/admin/change-password` | Change admin password |
| POST | `/api/admin/verify-password` | Verify password (pre-delete check) |

---

## Database Schema

Managed by Prisma, hosted on Neon (PostgreSQL). Schema lives at `server/prisma/schema.prisma`.

| Table | Purpose |
|---|---|
| `admins` | Admin accounts (email + hashed password) |
| `orders` | Customer orders — full order details, status, file URL |
| `partner_applications` | Partner onboarding submissions |
| `partner_photos` | Base64 photos attached to partner applications |
| `delivery_options` | Configurable delivery options (name, price, time) |
| `otp_codes` | Temporary OTP codes for order tracking |
| `settings` | Singleton row — stores editable contact phone number |

### After schema changes

```bash
cd server
npx prisma db push        # push to database
npx prisma generate       # regenerate Prisma client
```

---

## Environment Variables

### Frontend — `.env.local`

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

### Backend — `server/.env`

```env
PORT=4000
NODE_ENV=development

# PostgreSQL (Neon recommended)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Admin (first-time setup only)
ADMIN_EMAIL=**********
ADMIN_PASSWORD=*******
ADMIN_PHONE=phonenumber

# Email OTP (Resend)
RESEND_API_KEY=re_...

# SMS OTP (Termii)
TERMII_API_KEY=...
TERMII_SENDER_ID=N-Alert

# Paystack
PAYSTACK_SECRET_KEY=sk_live_...

# CORS
FRONTEND_URL=https://computerservice.ng
```

---

## Local Development

### Prerequisites
- Node.js 18+
- A PostgreSQL database (or free [Neon](https://neon.tech) account)

### 1. Clone and install

```bash
# Frontend
cd computer-service.ng
npm install

# Backend
cd server
npm install
```

### 2. Configure environment

```bash
# Frontend
cp .env.local.example .env.local    # fill in Paystack public key

# Backend
cp server/.env.example server/.env  # fill in DATABASE_URL, JWT_SECRET, etc.
```

### 3. Set up database

```bash
cd server
npx prisma db push     # creates all tables
npm run db:seed        # (optional) seed delivery options
```

### 4. Create admin user (first time only)

```bash
# Start backend first, then:
curl -X POST http://localhost:4000/api/auth/setup
```

This creates the admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `server/.env`.

### 5. Start both servers

```bash
# Terminal 1 — Express backend
cd server && npm run dev
# → http://localhost:4000

# Terminal 2 — Next.js frontend
npm run dev
# → http://localhost:3000
```

### 6. Log in to admin

Go to `http://localhost:3000/admin/login` and sign in with the credentials from `server/.env`.

---

## Deployment

The frontend is deployable to **Vercel** (recommended). The Express backend can run on any Node.js host (Railway, Render, Fly.io, EC2, etc.).

### Vercel (Frontend)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy — `npm run build` runs automatically

### Backend

```bash
cd server
npm run build          # compiles TypeScript to dist/
npm start              # runs dist/index.js
```

Or use the included `server/Dockerfile` and `server/docker-compose.yml` for containerised deployment.

---

## Admin Portal

| Feature | Description |
|---|---|
| **Live order counter** | Polls every 30s — tab title updates to `(N) Dashboard` when new orders arrive |
| **Stats cards** | Total, Pending, In Progress, In Transit, Delivered, Cancelled, Revenue |
| **Order table** | Filter by status, search by name/ID, export CSV, quick-view panel |
| **Status updates** | Dropdown per order row — updates backend instantly |
| **Partner applications** | Expandable rows showing photos (personal, ID, office) with download + lightbox |
| **Settings** | Edit customer contact phone number (syncs to homepage + tracking page), change password |
| **Delete protection** | Admin password re-confirmation required before any order is deleted |
