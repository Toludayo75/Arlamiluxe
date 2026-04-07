# Arlamiluxe Design Guidelines

## Design Approach
**Reference-Based: Luxury E-commerce**
Drawing inspiration from high-end fashion e-commerce (Net-a-Porter, luxury Shopify themes) while maintaining cultural authenticity for Adire heritage. Focus on visual storytelling through premium fabric imagery and elegant restraint.

---

## Typography System

**Headings:** Playfair Display (Google Fonts) - luxury serif
- H1: 3.5rem (56px) / font-bold / tracking-tight
- H2: 2.5rem (40px) / font-semibold / tracking-tight  
- H3: 1.75rem (28px) / font-semibold
- H4: 1.25rem (20px) / font-medium

**Body:** Inter (Google Fonts) - clean sans-serif
- Large: 1.125rem (18px) / font-normal / leading-relaxed
- Base: 1rem (16px) / font-normal / leading-relaxed
- Small: 0.875rem (14px) / font-normal

---

## Layout System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Section padding: py-20 (desktop), py-12 (mobile)
- Card padding: p-6 to p-8
- Element gaps: gap-6 to gap-8
- Container max-width: max-w-7xl with px-4/px-6 horizontal padding

**Grid Systems:**
- Product grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Featured sections: grid-cols-1 lg:grid-cols-2
- Admin dashboard: Sidebar (w-64) + main content area

---

## Page-Specific Design

### Home Page
**Hero Section (80vh):**
- Full-width background image showcasing premium fabric texture/drape
- Centered content overlay with burgundy backdrop-blur button
- H1: "Arlamiluxe" + tagline "Where Luxury Meets Cultural Heritage"
- Primary CTA button with burgundy background

**Featured Collections (multi-column):**
- 2-column grid: Adire Collection (left) + Unisex Fabrics (right)
- Large card images (aspect-ratio-4/3) with overlay titles
- Hover effect: subtle scale transform

**Product Showcase:**
- 3-column product grid with 6-8 featured items
- Product cards: image + name + price in Naira + "View Details" link

**Brand Story Teaser:**
- Single column, centered, max-w-3xl
- Brief paragraph linking to About Us page

### About Us Page
**Hero (60vh):**
- Cultural imagery (Adire artisan or fabric close-up)
- Overlay: "Our Story" heading

**Story Sections:**
- Alternating 2-column layouts (text + image)
- Section 1: Brand heritage and luxury positioning
- Section 2: Adire cultural significance
- Section 3: Commitment to quality

**Team/Process (optional):**
- 3-column grid with process steps or team photos

### Product Catalog Page
**Filter Sidebar (desktop):**
- Fixed left sidebar (w-64): Collection filter, price range
- Mobile: Collapsible filter drawer

**Product Grid:**
- 3-column responsive grid (1/2/3 columns)
- Pagination or infinite scroll
- Each card: Image (aspect-square) + name + price + quick view icon

### Product Detail Page
**Layout:**
- 2-column split: Image gallery (60%) + Product info (40%)
- Gallery: Large main image + thumbnail strip below
- Info panel: Name, price, description, fabric details, inquiry CTA

### Admin Dashboard
**Sidebar Navigation:**
- Burgundy sidebar with white text
- Icons from Heroicons
- Sections: Products, Collections, Inquiries, Media

**Content Area:**
- Data tables with action buttons
- Forms with consistent input styling
- Image upload dropzones

---

## Component Library

**Navigation:**
- Fixed header with Arlamiluxe logo (left), nav links (center), search + cart icons (right)
- Burgundy underline on active page
- Mobile: Hamburger menu with slide-in drawer

**Buttons:**
- Primary: burgundy bg, white text, rounded-lg, px-8 py-3
- Secondary: white bg, burgundy border/text, rounded-lg
- All buttons: backdrop-blur-sm when on images, subtle shadow, smooth hover transitions

**Product Cards:**
- White background, rounded-xl, shadow-md
- Image: rounded-t-xl, object-cover
- Content padding: p-6
- Hover: shadow-lg lift effect

**Forms:**
- Input fields: border-2, rounded-lg, p-3, focus:burgundy border
- Labels: font-medium, mb-2
- Consistent spacing: space-y-4

**Footer:**
- 4-column layout: About, Collections, Contact, Social
- Burgundy background, white text
- Newsletter signup form
- Copyright + links

---

## Images

**Required Images:**
1. **Hero Background:** High-resolution fabric texture or draped Adire fabric (full-width, 1920x1080+)
2. **Collection Cards:** Adire pattern close-up + Unisex fabric variety (1200x900 each)
3. **Product Images:** Square fabric swatches/drapes (800x800 minimum, multiple per product)
4. **About Page:** Cultural/artisan imagery, process photos (1200x800)
5. **Featured Products:** 6-8 fabric photos for homepage showcase

---

## SEO Optimization

**Meta Tags:**
```
Title: "Arlamiluxe - Premium Nigerian Fabrics & Adire Collection"
Description: "Shop luxury unisex fabrics and authentic Adire collections. Premium quality Nigerian fabrics delivered nationwide."
Keywords: Nigerian fabrics, Adire fabric, luxury fabrics Nigeria, unisex fabrics, African prints, traditional Adire
```

**Structured Data:** Product schema for all fabric items, Organization schema with brand info

**Heading Hierarchy:** Proper H1-H6 usage, single H1 per page with primary keywords

---

## Accessibility
- Consistent focus states: burgundy ring-2 on all interactive elements
- Alt text for all fabric images with descriptive details
- ARIA labels for icon-only buttons
- Keyboard navigation support throughout