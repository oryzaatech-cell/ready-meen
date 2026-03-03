# Ready Meen - Fresh Fish Marketplace Platform

## Complete Project Documentation

---

## 1. Project Overview

**Ready Meen** is a multi-vendor fresh fish marketplace connecting fish vendors directly with customers. The platform has **4 separate applications** that work together:

| App | Port | Purpose |
|-----|------|---------|
| **Backend API** | 5000 | Node.js + Express REST API |
| **Customer App** | 3000 | React SPA for customers to browse and order fish |
| **Vendor App** | 3001 | React SPA for vendors to manage products and orders |
| **Admin App** | 3002 | React SPA for platform administrators |

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend (all 3 apps) | React 18, Vite 5, Tailwind CSS 3.4, React Router 6, Lucide React |
| Backend | Node.js, Express 4.18 |
| Database | Supabase (PostgreSQL cloud) |
| Authentication | Supabase Auth (JWT + Google OAuth) |
| Notifications | Firebase Cloud Messaging (optional) |
| Build Tool | Vite 5 |
| Icons | Lucide React |
| Charts | Recharts (admin app) |
| Currency | INR (Indian Rupees) |

---

## 3. System Architecture

```
                    +------------------+
                    |   Supabase Cloud |
                    |  (PostgreSQL DB) |
                    |  (Auth Service)  |
                    +--------+---------+
                             |
                             | Supabase SDK
                             |
                    +--------+---------+
                    |   Backend API    |
                    |  (Express.js)    |
                    |   Port: 5000     |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
     +--------+---+  +------+------+  +----+-------+
     | Customer   |  | Vendor App  |  | Admin App  |
     | App        |  | Port: 3001  |  | Port: 3002 |
     | Port: 3000 |  +-------------+  +------------+
     +------------+
```

### Data Flow

```
Customer registers with vendor code
         |
         v
Backend validates code --> Links customer to vendor (vendor_id)
         |
         v
Customer browses products --> Auto-filtered to linked vendor's products
         |
         v
Customer places order --> vendor_id stored on order
         |
         v
Vendor sees order on dashboard --> Advances status: placed -> accepted -> processing -> ready -> delivered
```

---

## 4. Database Schema

### Tables

#### user_info (Customers & Admins)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| name | text | Full name |
| email | text | Email address |
| auth_id | uuid | Links to Supabase auth.users |
| is_admin | boolean | Admin flag (default: false) |
| vendor_id | integer (FK) | Links customer to a specific vendor |
| created_at | timestamp | Registration date |

#### vendor_info (Fish Vendors)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| name | text | Vendor name |
| email | text | Email address |
| auth_id | uuid | Links to Supabase auth.users |
| phone | text | Phone number |
| shop_name | text | Store display name |
| location | text | Store location |
| vendor_code | text (UNIQUE) | 6-char invite code (e.g., FH3K9X) |
| created_at | timestamp | Registration date |

#### product_info (Products)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| vendor_id | uuid (FK) | Which vendor owns this product |
| name | text | Product name |
| category | text | sea_fish / freshwater_fish / shellfish / dried_fish |
| description | text | Product description |
| image_url | text | Product image URL |
| price | numeric | Price per kg (INR) |
| stock_qty | numeric | Available stock |
| created_at | timestamp | Date added |

#### order_info (Orders)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| user_id | uuid (FK) | Customer who placed the order |
| vendor_id | uuid (FK) | Vendor who fulfills the order |
| status | text | placed / accepted / processing / ready / delivered / cancelled |
| total_amt | numeric | Total order amount (INR) |
| shipping_address | text | Delivery address |
| created_at | timestamp | Order placement date |

#### order_items (Line Items)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| order_id | uuid (FK) | Parent order |
| product_id | uuid (FK) | Product ordered |
| qty | numeric | Quantity (kg) |
| price | numeric | Price at time of order |

---

## 5. Authentication System

### How It Works

1. **Supabase Auth** manages user accounts (email/password + Google OAuth)
2. **Server-side signup** (POST /auth/signup) bypasses Supabase rate limits
3. On signup, the backend creates the auth user AND the profile record (user_info or vendor_info)
4. **JWT tokens** are issued by Supabase and sent with every API request
5. The backend validates tokens via `supabase.auth.getUser(token)`

### Auth Flow Diagram

```
Customer/Vendor clicks "Register"
        |
        v
Frontend sends POST /api/auth/signup
  { name, email, password, role, vendor_code? }
        |
        v
Backend creates Supabase auth user (auto-confirmed)
        |
        v
Backend creates profile in user_info or vendor_info
  - Vendor: auto-generates vendor_code
  - Customer: looks up vendor_code -> stores vendor_id
        |
        v
Frontend signs in with Supabase -> gets JWT session
        |
        v
All API calls include: Authorization: Bearer <JWT>
```

### Google OAuth Flow

```
User clicks "Sign up with Google"
        |
        v
If vendor_code entered, save to localStorage
        |
        v
Redirect to Google OAuth -> redirect back to app
        |
        v
Supabase creates auth user from Google profile
        |
        v
AuthContext.handleSession() detects new user (no db_id)
        |
        v
autoSaveProfile() runs:
  - Checks localStorage for pending_vendor_code
  - Creates user_info with vendor_id (if code found)
  - Clears localStorage
```

### Role-Based Access Control

| Role | Can Do |
|------|--------|
| **customer** | Browse products, place orders, view own orders, cancel placed orders |
| **vendor** | Manage own products, view/advance orders for their products, see invite code |
| **admin** | View all users, vendors, orders, analytics, manage platform |

---

## 6. Vendor-Customer Linking (Invite Code System)

This is the key feature that connects customers to specific vendors.

### How It Works

```
Step 1: Vendor registers
        -> Backend auto-generates vendor_code: "FH3K9X"
        -> Stored in vendor_info.vendor_code

Step 2: Vendor sees code on Dashboard
        -> Copies invite link: localhost:3000/join/FH3K9X
        -> Shares via WhatsApp, SMS, or Web Share API

Step 3: Customer opens link
        -> /join/FH3K9X route loads Register page
        -> Vendor code pre-filled, live validation shows vendor shop name

Step 4: Customer registers
        -> Backend looks up vendor_code "FH3K9X" -> finds vendor
        -> Stores vendor.id in user_info.vendor_id

Step 5: Customer browses products
        -> GET /api/products detects customer has vendor_id
        -> Auto-filters to ONLY that vendor's products

Step 6: Customer places order
        -> vendor_id stored on order_info
        -> Vendor sees this order on their dashboard
```

### Vendor Code Generation

- 6 characters, alphanumeric
- Excludes ambiguous characters: I, O, 0, 1
- Uses characters: A-H, J-N, P-Z, 2-9
- Retries up to 5 times on collision
- Example codes: FH3K9X, W7BNPE, GD4R6Y

---

## 7. API Endpoints

### Auth Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /verify-vendor-code/:code | Public | Verify code, return vendor shop name |
| POST | /signup | Public | Register new user/vendor |
| POST | /profile | JWT | Create or update profile (Google OAuth flow) |
| GET | /me | JWT | Get current user's profile |

### Product Routes (`/api/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | Optional | Browse products (auto-filtered for linked customers) |
| GET | /mine | Vendor | Get vendor's own products |
| GET | /:id | Public | Get single product |
| POST | / | Vendor/Admin | Add new product |
| PUT | /:id | Vendor/Admin | Update product (ownership verified) |
| DELETE | /:id | Vendor/Admin | Delete product (ownership verified) |

### Order Routes (`/api/orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | / | Customer | Place new order (validates stock, stores vendor_id) |
| GET | / | JWT | List orders (role-filtered) |
| GET | /:id | JWT | Order detail with items and product info |
| PUT | /:id/status | Vendor/Admin | Advance order status |
| PUT | /:id/cancel | Customer | Cancel order (only if status = placed) |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /users | Admin | List all customers (searchable) |
| GET | /vendors | Admin | List vendors with customer count + vendor code |
| GET | /orders | Admin | List all platform orders |
| GET | /analytics | Admin | Dashboard stats (users, vendors, revenue) |

---

## 8. Order Lifecycle

### Status Flow

```
  PLACED -----> ACCEPTED -----> PROCESSING -----> READY -----> DELIVERED
    |
    |  (customer can cancel)
    v
  CANCELLED
```

| Status | Who Sets It | What It Means |
|--------|-------------|---------------|
| placed | System (on order creation) | Order received, awaiting vendor |
| accepted | Vendor | Vendor acknowledged the order |
| processing | Vendor | Order is being prepared |
| ready | Vendor | Ready for pickup/delivery |
| delivered | Vendor | Order delivered to customer |
| cancelled | Customer | Customer cancelled (only from placed) |

---

## 9. Frontend App Details

### Customer App (Port 3000)

**Pages:**
| Route | Page | Description |
|-------|------|-------------|
| / | Landing | Hero section, features, call-to-action |
| /login | Login | Email/password + Google sign-in |
| /register | Register | Signup with optional vendor code |
| /join/:code | Register | Signup with vendor code pre-filled |
| /home | Home | Product browse, category filter, search |
| /product/:id | ProductDetail | Qty selector, add-to-cart |
| /cart | Cart | Review items, adjust quantities |
| /checkout | Checkout | Shipping address, place order |
| /orders | Orders | List all orders with status |
| /orders/:id | OrderDetail | Timeline, items, cancel option |
| /profile | Profile | Edit name, view email, sign out |

**Key Features:**
- Cart managed client-side (CartContext)
- Products auto-filtered to linked vendor
- Order timeline visualization
- Mobile-first with bottom navigation bar
- Google OAuth with vendor code persistence

### Vendor App (Port 3001)

**Pages:**
| Route | Page | Description |
|-------|------|-------------|
| /login | Login | Email/password + Google sign-in |
| /register | Register | Signup with phone, shop name, location |
| / | Dashboard | Stats, invite code card, recent orders |
| /vendor/products | Inventory | List products, add new |
| /vendor/products/add | AddInventory | Product creation form |
| /vendor/orders | Orders | Filter by status |
| /vendor/orders/:id | OrderDetail | Items, customer info, advance status |
| /vendor/profile | Profile | Edit shop info, sign out |

**Key Features:**
- Invite Customers card with code + copy/share buttons
- Web Share API for mobile sharing
- Order status advancement (one-click)
- Product inventory management (add, view)

### Admin App (Port 3002)

**Pages:**
| Route | Page | Description |
|-------|------|-------------|
| /login | Login | Email/password sign-in |
| / | Dashboard | 4 stat cards, order breakdown |
| /admin/users | Users | Searchable customer list |
| /admin/vendors | Vendors | Vendor cards with code + customer count |
| /admin/orders | Orders | All orders with status filter |

**Key Features:**
- Platform-wide analytics (total users, vendors, revenue)
- Vendor code and linked customer count display
- Order status breakdown
- Sidebar navigation

---

## 10. Project File Structure

```
ready-mean-api/                    # Backend
├── server.js                      # Express app setup, CORS, route mounting
├── config/supabase.js             # Supabase client (service role)
├── middleware/
│   ├── auth.js                    # JWT validation, profile loading
│   └── roleCheck.js               # Role enforcement
├── routes/
│   ├── auth.js                    # Registration, login, profiles
│   ├── products.js                # Product CRUD
│   ├── orders.js                  # Order placement + management
│   └── admin.js                   # Admin analytics + listing
├── services/
│   ├── orderService.js            # Order business logic
│   └── notificationService.js     # Firebase push (optional)
└── shared/
    ├── constants.js               # Statuses, categories, roles
    ├── validators.js              # Phone, email validation
    └── vendorCode.js              # Vendor code generation

ready-mean-customer/               # Customer Frontend
├── src/
│   ├── App.jsx                    # Routes with lazy loading
│   ├── context/
│   │   ├── AuthContext.jsx        # Auth state, sign-up/in/out
│   │   └── CartContext.jsx        # Shopping cart state
│   ├── hooks/useAuth.js, useApi.js
│   ├── pages/public/              # Landing, Login, Register
│   ├── pages/customer/            # Home, Cart, Checkout, Orders, Profile
│   ├── components/                # UI components, layout
│   └── shared/                    # Constants, formatCurrency

ready-mean-vendor/                 # Vendor Frontend
├── src/
│   ├── App.jsx
│   ├── context/AuthContext.jsx
│   ├── pages/public/              # Login, Register
│   ├── pages/vendor/              # Dashboard, Inventory, Orders, Profile
│   ├── components/
│   └── shared/

ready-mean-admin/                  # Admin Frontend
├── src/
│   ├── App.jsx
│   ├── context/AuthContext.jsx
│   ├── pages/public/              # Login
│   ├── pages/admin/               # Dashboard, Users, Vendors, Orders
│   ├── components/
│   └── shared/
```

---

## 11. Key Design Patterns

| Pattern | Where | Description |
|---------|-------|-------------|
| **Lazy Loading** | All frontend apps | Pages loaded on demand via React.lazy() + Suspense |
| **Context API** | Auth, Cart | Global state without external libraries |
| **Optional Auth Middleware** | GET /products | Returns data for both public and authenticated users |
| **Role-Based Routing** | All apps | ProtectedRoute redirects unauthenticated users |
| **Server-Side Signup** | POST /auth/signup | Bypasses Supabase email rate limits |
| **Vendor Code Linking** | Registration | Connects customers to vendors via invite codes |
| **Stock Validation** | Order placement | Checks and deducts stock atomically |
| **Status Machine** | Orders | Linear progression with validated transitions |

---

## 12. How to Run the Project

### Prerequisites
- Node.js 18+
- Supabase project (with tables created)
- npm

### Setup

```bash
# 1. Backend
cd ready-mean-api
npm install
# Create .env with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm start                          # Runs on port 5000

# 2. Customer App
cd ready-mean-customer
npm install
# Create .env with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm run dev                        # Runs on port 3000

# 3. Vendor App
cd ready-mean-vendor
npm install
npm run dev                        # Runs on port 3001

# 4. Admin App
cd ready-mean-admin
npm install
npm run dev                        # Runs on port 3002
```

### Database Setup (Supabase SQL Editor)

```sql
-- Create tables
CREATE TABLE vendor_info (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  auth_id UUID,
  phone TEXT,
  shop_name TEXT,
  location TEXT,
  vendor_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_info (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  auth_id UUID,
  is_admin BOOLEAN DEFAULT false,
  vendor_id INTEGER REFERENCES vendor_info(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE product_info (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendor_info(id),
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  image_url TEXT,
  price NUMERIC NOT NULL,
  stock_qty NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_info (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES user_info(id),
  vendor_id INTEGER REFERENCES vendor_info(id),
  status TEXT DEFAULT 'placed',
  total_amt NUMERIC DEFAULT 0,
  shipping_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES order_info(id),
  product_id INTEGER REFERENCES product_info(id),
  qty NUMERIC NOT NULL,
  price NUMERIC NOT NULL
);
```

---

## 13. Security

- **JWT Authentication** on all protected routes
- **Role enforcement** via middleware (customer/vendor/admin)
- **Vendor ownership** verified before product edits/deletes
- **CORS** restricted to localhost:3000/3001/3002
- **Service Role Key** used only server-side (never exposed to frontend)
- **Stock validation** prevents overselling
- **Vendor code** uses collision-resistant generation with retries

---

## 14. Summary

Ready Meen is a complete **multi-vendor fish marketplace** with:
- **3 separate React frontends** for customers, vendors, and admins
- **1 Express.js backend** handling all API logic
- **Supabase** for database + authentication
- **Vendor invite codes** linking customers to specific vendors
- **Full order lifecycle** from placement to delivery
- **Role-based access control** across the entire platform

The platform enables fish vendors to set up their online store, invite customers via unique codes, and manage orders - all through a mobile-friendly interface.
