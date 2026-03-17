# Ready Meen (Ready മീൻ)

**ready.to.cook** — A Progressive Web App for local fish vendors and customers.

## Overview

Ready Meen connects local fish vendors with customers, enabling fresh fish ordering with custom cutting styles, cleaning options, and doorstep delivery.

## Apps

| App | Port | Description |
|-----|------|-------------|
| **Customer** | 3000 | Browse fish, customize orders, track deliveries |
| **Vendor** | 3001 | Manage products, process orders, view analytics |
| **Admin** | 3002 | Platform administration, user & vendor management |
| **API** | 5000 | Backend REST API (Express + Supabase) |

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Poppins font
- **Backend:** Node.js, Express
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (mobile-based with synthetic email)
- **PWA:** VitePWA with Workbox, installable on mobile

## Features

### Customer App
- Vendor code-based registration
- Product browsing with search
- Custom cutting types & cleaning options
- Cart with quantity management (0.5kg increments)
- Address management (up to 3 saved addresses)
- Order placement & tracking with timeline
- Forgot password (identity verification via name + mobile)
- PWA install banner (Android native + iOS guide)

### Vendor App
- Auto-generated vendor codes for customer sharing
- Product management with images, stock, cutting options
- Order processing & status updates
- Shop profile management

### Admin App
- Dashboard with analytics
- User & vendor management
- Order oversight

## Getting Started

```bash
# API
cd ready-mean-api
npm install
npm start

# Customer App
cd ready-mean-customer
npm install
npm run dev

# Vendor App
cd ready-mean-vendor
npm install
npm run dev

# Admin App
cd ready-mean-admin
npm install
npm run dev
```

## Environment Variables

Each app requires a `.env` file with:
- `VITE_API_URL` — API base URL (frontend apps)
- Supabase credentials (API)

## Deployment

All frontend apps are deployed on **Vercel**. The API is deployed separately.

- Customer: [ready-mean-customer.vercel.app](https://ready-mean-customer.vercel.app)

## Vendor Code Flow

1. Vendor registers → gets an auto-generated 6-character code
2. Vendor shares link: `/join/{CODE}`
3. Customer opens link → sees landing page → registers with code pre-filled
4. Customer is linked to the vendor
