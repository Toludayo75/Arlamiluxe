# Arlamiluxe
Arlamiluxe is where cultural elegance meets premium quality. We celebrate the rich heritage of Nigerian textiles, particularly the authentic Adire tradition, while offering a diverse range of luxury fabrics for the modern individual.

1. Overview

Arlamiluxe is an online fabric brand offering a wide range of unisex fabrics and a dedicated Adire collection. The platform provides a smooth browsing and shopping experience, focusing on brand identity, visual appeal, and ease of management.

This documentation covers the system architecture, technologies, setup process, code structure, and maintenance workflow.

2. Project Goals

Showcase premium fabric collections (including Adire).

Provide easy product browsing and filtering.

Allow customers to place orders or make inquiries.

Reflect brand identity through colors, typography, and visual style.

Provide an admin dashboard for managing products, categories, and media.

3. Technology Stack

Frontend:

React

TypeScript

Tailwind CSS 

Backend:

Node.js (Express)

Database:

PostgreSQL

4. System Architecture

Arlamiluxe is built on a React frontend, Node.js backend, and PostgreSQL database. The architecture follows a clean separation of concerns, ensuring scalability and maintainability.

4.1 Architecture Flow

Client (React):

Renders UI components

Sends requests to backend via REST API

Manages state for products, cart/inquiries, and collections

Backend (Node.js + Express):

Handles API routes

Validates requests

Interacts with PostgreSQL via an ORM or query builder

Manages authentication (optional)

Database (PostgreSQL):

Stores products, collections, images, and order inquiries

Media Storage:

Images stored in a cloud bucket (e.g., Supabase storage, Cloudinary, or local uploads depending on project decisions)

6. API Endpoints

Below are detailed backend routes for developers.

6.1 Product Endpoints

GET /api/products

Returns a list of all fabrics.
Response:

[
  {
    "id": 1,
    "name": "Adire Blue Mix",
    "price": 15000,
    "collection": "Adire",
    "image_url": "..."
  }
]

GET /api/products/****************************:id

Returns a single product.

POST /api/products (Admin)

Used to create a product.
Payload:

{
  "name": "African Print Ankara",
  "price": 12000,
  "description": "...",
  "collection": "Unisex Fabrics",
  "image_url": "..."
}

PUT /api/products/****************************:id

Updates product information.

DELETE /api/products/****************************:id

Deletes a product.

6.2 Collections Endpoints

GET /api/collections

Lists all available collections: Adire, Unisex Fabrics, etc.

POST /api/collections (Admin)

Create new collection.

6.3 Order/Inquiry Endpoints

POST /api/orders

Creates a customer inquiry or order.
Payload:

{
  "customer_name": "Aisha",
  "phone": "08012345678",
  "product_id": 3
}

7. Database Schema

The system uses a relational database structure optimized for product management.

7.1 ERD Overview

Tables:

products (stores individual fabrics)

collections (Adire, Unisex Fabrics)

orders (optional inquiries)

7.2 Products Table

Field

Type

Description

id

SERIAL PK

Unique identifier

name

VARCHAR

Fabric name

description

TEXT

Detailed description

price

INT

Price in Naira

collection_id

INT FK

Links to collections table

image_url

VARCHAR

Image file URL

created_at

TIMESTAMP

Auto timestamp

updated_at

TIMESTAMP

Auto timestamp

7.3 Collections Table

| Field | Type | Description |
| id | SERIAL PK | Unique identifier |
| title | VARCHAR | e.g., "Adire", "Unisex Fabrics" |
| created_at | TIMESTAMP | Auto timestamp |

7.4 Orders Table (Optional)

| Field | Type | Description |
| id | SERIAL PK | Unique identifier |
| customer_name | VARCHAR | Customer name |
| phone | VARCHAR | Phone number |
| product_id | INT FK | Product requested |
| status | VARCHAR | pending/confirmed |
| created_at | TIMESTAMP | Auto timestamp |

9. Admin Workflow

Login to dashboard

Create or edit products

Upload fabric images

Manage collections (e.g., Adire)

View inquiries or orders

10. Branding Guidelines

Branding is essential for Arlamiluxe as a luxury fabric seller. Developers must ensure UI components reflect the premium feel.

10.1 Brand Identity

Brand Name: Arlamiluxe

Business: Unisex fabrics + exclusive Adire collection

Positioning: Luxury, cultural elegance, premium quality

10.2 Colors (Primary Palette)

Burgundy — Luxury, richness

White — Clean, modern contrast

Developers should use these for backgrounds, accents, and CTAs.

10.3 Typography

Headings: Modern serif

Body Text: Minimal sans-serif

10.4 UI Style Guide

Clean spacing

Rounded edges for buttons/cards

Fabric images must be sharp and high‑resolution

Use subtle shadows for depth

Keep layouts airy, not cluttered

13. Contact Information

For internal use only.

Developer: TAE

Client: Arlamiluxe

Last Updated: (Insert Date)



```
Arlamiluxe/
├── client/                  # React frontend application
│  ├── index.html               # HTML entry point (Vite)
│  ├── vite.config.ts           # Vite build configuration
│  ├── tsconfig.json            # Client-specific TypeScript config
│  ├── tailwind.config.ts       # Tailwind CSS configuration
│  ├── postcss.config.js        # PostCSS configuration
│  ├── package.json             # Client-specific dependencies
│  │
│  ├── public/                  # Static assets served as-is
│  │   ├── robots.txt           # Search engine crawl rules
│  │   ├── sitemap.xml          # SEO sitemap
│  │   ├── site.webmanifest     # PWA manifest
│  │   └── analytics.html       # Analytics snippet
│  │
│ └── src/                     # Application source code
│      ├── main.tsx             # React app entry point
│      ├── App.tsx              # Root component & router setup
│      ├── index.css            # Global styles & Tailwind directives
│      │
│      ├── pages/               # Route-level page components
│      │   ├── home.tsx         # Homepage (hero, featured collections, products)
│      │   ├── products.tsx     # Product catalog with filters
│      │   ├── product-detail.tsx  # Single product view
│      │   ├── collections.tsx  # Collections listing page
│      │   ├── cart.tsx         # Shopping cart page
│      │   ├── checkout.tsx     # Checkout & payment flow
│      │   ├── payment-success.tsx  # Post-payment confirmation
│      │   ├── my-orders.tsx    # Customer order history
│      │   ├── order-detail.tsx # Single order detail view
│      │   ├── auth.tsx         # Login / Register page
      │   ├── about.tsx        # About Us page
      │   ├── contact.tsx      # Contact page
      │   ├── not-found.tsx    # 404 page
      │   │
      │   └── admin/           # Admin dashboard pages (protected)
      │       ├── layout.tsx   # Admin shell with sidebar
      │       ├── dashboard.tsx  # Overview & analytics
      │       ├── products.tsx   # Product management (CRUD)
      │       ├── collections.tsx  # Collection management
      │       ├── orders.tsx     # Order management & status
      │       ├── shipping.tsx   # Shipping settings
      │       └── support.tsx    # Customer support / inquiries
      │
      ├── components/          # Reusable UI components
      │   ├── Navigation.tsx   # Fixed top navigation bar
      │   ├── Hero.tsx         # Homepage hero section
      │   ├── ProductCard.tsx  # Product card (grid item)
      │   ├── CollectionCard.tsx  # Collection card (grid item)
      │   ├── CartDrawer.tsx   # Slide-in cart drawer
      │   ├── Footer.tsx       # Site-wide footer
      │   ├── admin-sidebar.tsx  # Admin dashboard sidebar
      │   │
      │   ├── ui/              # shadcn/ui primitive components
      │   │   ├── button.tsx, input.tsx, card.tsx, badge.tsx ...
      │   │   └── (40+ auto-generated shadcn components)
      │   │
      │   └── examples/        # Reference/example component versions
      │       └── (mirrors of main components for design reference)
      │
      ├── hooks/               # Custom React hooks
      │   ├── use-auth.tsx     # Authentication state & actions
      │   ├── use-toast.ts     # Toast notification hook
      │   └── use-mobile.tsx   # Responsive breakpoint detection
      │
      ├── lib/                 # Utility & configuration modules
      │   ├── utils.ts         # General utility functions (cn, formatPrice, etc.)
      │   ├── queryClient.ts   # TanStack Query client setup
      │   └── protected-route.tsx  # Auth-guarded route wrapper
      │
      └── shared/              # Client-side copy of shared schema
          └── schema.ts        # Zod/Drizzle types re-exported for client use
├── 
server/
  ├── index.ts             # Server entry point (Express app bootstrap)
  ├── routes.ts            # All API route definitions
  ├── auth.ts              # Passport.js authentication setup (local strategy)
  ├── admin-middleware.ts  # Middleware to protect admin-only routes
  ├── storage.ts           # Data access layer (DB queries via Drizzle)
  ├── db.ts                # Drizzle ORM + Neon DB connection setup
  ├── paystack.ts          # Paystack payment gateway integration
  ├── vite.ts              # Vite dev server middleware (development only)
  ├── seed.ts              # Database seeder (products, collections)
  └── seed-admin.ts        # Admin user seeder

├── shared/                  # Shared types and schema (used by both client & server)
  └── schema.ts 
├── migrations/              # Drizzle ORM database migration files
  ├── 0000_absurd_sister_grimm.sql   # Initial schema migration
  ├── 0001_fine_cerise.sql           # Subsequent schema update
  └── meta/
      ├── _journal.json              # Drizzle migration journal
      ├── 0000_snapshot.json         # Schema snapshot at migration 0
      └── 0001_snapshot.json         # Schema snapshot at migration 1
├── package.json             # Root scripts & dependencies (monorepo)
├── tsconfig.json            # Root TypeScript configuration
├── drizzle.config.ts        # Drizzle ORM configuration
├── components.json          # shadcn/ui component registry config
├── design_guidelines.md     # Brand & UI design reference
├── README.md                # Project documentation
├── .gitignore
└── ca.pem                   # Database SSL certificate
```