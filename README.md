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

