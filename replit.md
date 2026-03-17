# Burney's Sweets and More - Website

## Overview

Modern website for Burney's Sweets and More, a bakery in Clinton, NC celebrating 10 years. Features a product catalog, online ordering with NC sales tax (6.75%), customer receipt emails, order notifications, and admin portal for managing products/pricing.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **State management**: Zustand (auth), React Query (server state)
- **Routing**: Wouter
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: JWT (admin), bcryptjs for password hashing
- **Email**: Nodemailer (SMTP config via env vars)
- **Build**: esbuild (CJS bundle)

## Key Features

- **Product Catalog**: 6 categories (Cakes, Cupcakes, Pies, Cookies & Pastries, Savory Items, Specialty Items), 31 products
- **Online Ordering**: Cart with add/remove, checkout form, NC 6.75% sales tax calculation
- **Email Notifications**: Customer receipt emails + order notifications to john@shotgunninjas.com
- **Admin Portal**: Login at /admin (Admin/Burney2026!), full CRUD for products and categories
- **Branding**: Bold, warm bakery design with maroon/gold/cream palette

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   └── src/
│   │       ├── routes/     # categories.ts, orders.ts, admin.ts
│   │       └── lib/        # auth.ts (JWT), email.ts (nodemailer)
│   └── web/                # React + Vite frontend
│       └── src/
│           ├── pages/      # home.tsx, admin-login.tsx, admin-dashboard.tsx
│           ├── components/ # cart-drawer, checkout-dialog, admin forms
│           └── hooks/      # use-auth.ts (zustand), use-cart.ts
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/     # categories, products, orders, orderItems, adminUsers
├── scripts/
│   └── src/seed.ts         # Seeds categories, products, admin user
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## API Endpoints

- `GET /api/categories` - List all categories
- `GET /api/products` - List all products with category names
- `POST /api/orders` - Create order (validates email, quantities, calculates tax)
- `POST /api/admin/login` - Admin login (returns JWT)
- `GET /api/admin/products` - List products (auth required)
- `POST /api/admin/products` - Create product (auth required)
- `PUT /api/admin/products/:id` - Update product (auth required)
- `DELETE /api/admin/products/:id` - Delete product (auth required)
- `GET /api/admin/categories` - List categories (auth required)
- `POST /api/admin/categories` - Create category (auth required)
- `PUT /api/admin/categories/:id` - Update category (auth required)
- `DELETE /api/admin/categories/:id` - Delete category (auth required)

## Database Tables

- `categories` - id, name, displayOrder
- `products` - id, name, description, price, imageUrl, categoryId, available
- `orders` - id, customerName, customerEmail, customerPhone, specialInstructions, subtotal, taxRate, taxAmount, total, status, createdAt
- `order_items` - id, orderId, productId, productName, quantity, unitPrice, lineTotal
- `admin_users` - id, username, passwordHash

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection (auto-provided by Replit)
- `JWT_SECRET` - Secret for admin JWT tokens (falls back to random bytes if unset)
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - Email SMTP config (optional, emails are best-effort)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files during typecheck; actual JS bundling handled by esbuild/tsx/vite
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`

## Key Commands

- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm --filter @workspace/web run dev` — run frontend
- `pnpm --filter @workspace/scripts run seed` — seed database
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push schema changes to DB
