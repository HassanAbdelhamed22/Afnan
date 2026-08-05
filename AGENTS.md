# AGENTS.md

## Afnan — Instructions for AI Coding Agents

This file is the primary repository guide for any AI coding agent working on **Afnan**, an Egypt-only handmade-products e-commerce MVP.

Treat these instructions as an engineering contract. Do not expand scope, replace architectural decisions, or add infrastructure without an explicit request.

---

## 1. Product Summary

Afnan is a full-stack e-commerce application for handmade products.

Customers can:

- Browse ready-made and made-to-order products
- Search, filter, sort, and paginate products
- Register and manage their accounts
- Save Egyptian delivery addresses
- Use a cart and wishlist
- Place cash-on-delivery orders
- View order history and status
- Upload reference images for custom handmade requests

Administrators can:

- Manage products and categories
- Review pending orders
- Contact customers manually through WhatsApp
- Confirm and process orders
- Manage custom handmade requests
- Configure Egypt governorate shipping rates
- Configure basic store settings
- Receive email alerts for new orders and requests

---

## 2. MVP Scope

### Included

- Egypt-only shipping
- EGP only
- Cash on delivery only
- Manual WhatsApp confirmation
- Admin email alerts
- Products and categories
- Ready-made and made-to-order products
- Search and essential filters
- Cart and wishlist
- Customer order history
- Custom handmade requests with image uploads
- Optional admin-approved background removal for product images
- Basic admin dashboard
- Authentication and role protection
- SEO, accessibility, caching, testing, and deployment

### Explicitly excluded

Do not add these unless the task explicitly requests a scope change:

- Online payments
- International shipping
- Multi-currency support
- Internal notification center
- Real-time notifications or WebSockets
- WhatsApp Business API or bots
- Reviews and ratings
- Coupons
- Returns and refunds
- Courier integrations or live tracking
- Multiple warehouses
- Multiple admin roles
- Advanced analytics
- Inventory movement ledger
- Audit-log dashboard
- Formal custom-request quotations
- CSV exports
- Microservices
- Recommendation engine
- Custom AI image-processing model

---

## 3. Technology Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript with strict mode
- **Frontend:** React Server Components by default
- **Backend:** Next.js Server Actions and Route Handlers
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Authentication:** Better Auth with MongoDB
- **Validation:** Zod
- **Styling:** Tailwind CSS
- **Images:** Cloudinary or S3-compatible storage
- **Email:** Resend or another transactional provider
- **Deployment:** Vercel
- **Testing:** Vitest or Jest, React Testing Library, Playwright

Use the package manager established by the repository lockfile.

---

## 4. Architecture

Use a **modular monolith**: one Next.js deployment, one MongoDB database, and feature modules with small public APIs.

### Layer responsibilities

1. **Presentation**
   - Pages and layouts
   - Server Components
   - Small Client Components
   - Forms and UI states

2. **Application**
   - Server Actions
   - Queries and commands
   - Authorization orchestration
   - Cache invalidation
   - DTO mapping

3. **Domain**
   - Product and variant rules
   - Cart and pricing rules
   - Shipping rules
   - Order transitions
   - WhatsApp confirmation
   - Custom-request rules

4. **Data**
   - Mongoose models
   - Repositories
   - Projections and indexes
   - Transactions

5. **Infrastructure**
   - Better Auth
   - Email
   - Cloudinary/S3
   - Logging
   - Rate limiting
   - Deployment

---

## 5. Folder Structure

```text
src/
├── app/
│   ├── (store)/
│   ├── (auth)/
│   ├── (account)/
│   ├── cart/
│   ├── checkout/
│   ├── order-success/
│   ├── custom-request/
│   ├── admin/
│   └── api/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── products/
│   ├── categories/
│   ├── catalog/
│   ├── cart/
│   ├── wishlist/
│   ├── checkout/
│   ├── orders/
│   ├── custom-requests/
│   ├── shipping/
│   ├── uploads/
│   ├── email/
│   └── admin/
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── lib/
├── config/
├── emails/
├── styles/
└── test/
scripts/
├── seed.ts
├── create-admin.ts
└── create-indexes.ts
```

### Folder rules

- Organize business code by feature.
- Keep route files thin.
- Keep domain logic out of page components.
- Never import Mongoose models into Client Components.
- Never fetch internal API routes from Server Components.
- Server Components call queries/services directly.
- Modules expose small public APIs.
- Avoid cross-module deep imports.

---

## 6. Server and Client Components

### Server Components are the default

Use them for:

- Home, shop, category, and product pages
- Account initial reads
- Order history
- Admin lists and detail pages

### Client Components are allowed only when required

Use them for:

- Product galleries
- Variant and quantity controls
- Cart and wishlist interactions
- Filter drawers
- Dialogs
- Upload progress
- Interactive forms
- Optimistic UI

Do not add `"use client"` unless the component needs event handlers, browser APIs, local state, or client-only libraries.

---

## 7. Server Actions and Route Handlers

### Use Server Actions for

- Profile and address mutations
- Cart and wishlist mutations
- Checkout
- Product/category admin forms
- Order status updates
- Custom-request creation
- Shipping and settings updates

### Use Route Handlers for

- Better Auth endpoints
- Signed upload endpoints
- Upload completion verification
- Search suggestions
- Health checks
- Future external integrations

Every server entry point must:

1. Authenticate when required
2. Authorize role and ownership
3. Validate with Zod
4. Normalize input
5. Apply domain rules
6. Execute database operations
7. Invalidate relevant cache tags
8. Return a safe DTO or result

Treat every server function as a public attack surface.

---

## 8. Authentication and Authorization

Required roles:

```ts
type Role = "CUSTOMER" | "ADMIN";
```

Public registration must always create `CUSTOMER`.

Create server-only helpers:

```ts
verifySession()
requireUser()
requireVerifiedUser()
requireAdmin()
```

Rules:

- Customers can access only their own addresses, cart, wishlist, orders, and requests.
- Admin actions require server-side admin verification.
- UI visibility and middleware are not sufficient authorization.
- Never expose password hashes, session tokens, reset tokens, or provider secrets.
- Use generic authentication errors to reduce account enumeration.
- Create the first admin through a protected script or controlled environment process.
- **Admin Guarding**: All admin directories (`/admin/*`) must be wrapped in `admin/layout.tsx` enforcing `requireAdmin()`. Unauthenticated triggers are redirected to `/login?returnTo=...` and forbidden triggers are redirected to `/unauthorized`.
- **Account Guarding**: All account directories (`/account/*`) must be wrapped in `account/layout.tsx` enforcing `requireUser()`.
- **Reverse Auth Middleware**: The proxy middleware must intercept active sessions requesting public auth pages (`/login`, `/register`, `/forgot-password`, `/reset-password`) and redirect them to `/`.
- **Layout Segregation**: Storefront navigation elements (e.g., `Header`, `Footer`) must return `null` on `/admin` path queries to prevent layout bleeding.

---

## 9. Egypt-Specific Rules

### Currency

```ts
type Currency = "EGP";
```

Store money as integer minor units:

```ts
125000 // EGP 1,250.00
```

Never persist floating-point currency values.

### Phone numbers

Normalize Egyptian phone numbers to E.164:

```text
+20...
```

### Address fields

Use:

- Recipient name
- Phone
- Governorate
- City or area
- Street
- Building
- Floor
- Apartment
- Landmark
- Delivery notes

Do not add country selection, currency selection, international address formats, or required postal codes.

### Shipping

Use one shipping-rate record per Egyptian governorate containing:

- Governorate code and name
- Fee
- Minimum and maximum delivery days
- Active state

Checkout rejects unknown or inactive governorates.

---

## 10. Product Rules

```ts
type FulfillmentType = "READY_MADE" | "MADE_TO_ORDER";
```

### Ready-made

- Requires stock
- Rejects quantity above stock
- Uses conditional updates to prevent negative stock

### Made-to-order

- Does not require stock
- Requires preparation time
- Shows preparation time on product, cart, and checkout pages

### Lifecycle

```ts
type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
```

- Draft is admin-only
- Active is public
- Archived is hidden publicly
- Never delete products referenced by orders

### Variants

Variants may represent size, color, material, or style and may contain:

- SKU
- Label
- Option values
- Optional price override
- Optional stock for ready-made products
- Active state

---

## 11. Catalog Search and Filters

MVP filters:

- Category
- Minimum and maximum price
- Material
- Color
- Availability
- Fulfillment type

MVP sorting:

- Newest
- Price ascending
- Price descending

Rules:

- Keep state in URL search parameters.
- Allow-list filter and sort fields.
- Reject arbitrary MongoDB operators.
- Escape text input.
- Paginate every result and cap page size.
- Project only required fields.
- Start with MongoDB text/indexed search.
- Do not add Atlas Search without a measured need or explicit request.

---

## 12. Cart and Wishlist

### Cart

- One persisted cart per authenticated customer
- Optional small local guest cart
- Guest-cart merge is lower priority
- Revalidate product status, price, stock, and preparation time on every read and checkout
- Browser/cart prices are informational only
- Calculate final totals on the server
- Quantity must be at least 1
- Ready-made quantity must not exceed stock

### Wishlist

- One wishlist per customer
- Add/remove must be idempotent
- Moving to cart requires a valid variant

---

## 13. Checkout and Orders

```ts
type PaymentMethod = "CASH_ON_DELIVERY";

type OrderStatus =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type WhatsAppConfirmationStatus =
  | "NOT_CONTACTED"
  | "CONTACTED"
  | "CONFIRMED"
  | "NO_RESPONSE"
  | "REJECTED";
```

Required checkout behavior:

- Require verified customer
- Validate Egyptian governorate
- Re-read products and variants
- Recalculate price and shipping
- Validate stock
- Use a unique checkout token
- Store immutable snapshots
- Use a MongoDB transaction when supported
- Clear cart only after successful order creation
- Attempt admin email only after commit

Snapshots preserve:

- Product name, image, SKU, and variant label
- Unit price and quantity
- Personalization
- Fulfillment type and preparation time
- Customer contact
- Egyptian address
- Shipping fee and final total

Never rebuild historical order facts from current product data.

Allowed flow:

```text
PENDING_CONFIRMATION → CONFIRMED | CANCELLED
CONFIRMED → PROCESSING | CANCELLED
PROCESSING → SHIPPED | CANCELLED
SHIPPED → DELIVERED
```

Reject invalid transitions.

---

## 14. Email and WhatsApp

### Email

Send a best-effort admin email after:

- A new order is committed
- A custom request is saved

Email may include:

- Order/request number
- Customer name and phone
- Governorate
- Total when applicable
- Secure admin deep link

Email failure must not roll back or delete business data.

There is no internal notification collection or unread system in MVP.

### WhatsApp

Use:

```text
https://wa.me/{normalizedPhoneWithoutPlus}?text={encodedMessage}
```

Opening WhatsApp must not automatically update contact state. The admin explicitly records the result.

---

## 15. Custom Handmade Requests

A request may include:

- Title and description
- Reference images
- Material and colors
- Dimensions and quantity
- Desired date
- Budget range
- Customer contact snapshot

```ts
type CustomRequestStatus =
  | "SUBMITTED"
  | "CONTACTED"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED";
```

MVP excludes formal quotations, quote approval, revisions, request-to-order conversion, and deposits.

Customers can read only their own requests. Internal admin notes must not appear in customer DTOs.

---

## 16. Product Image Enhancement

The MVP may support optional provider-based background removal.

### Workflow

1. Admin uploads the original image.
2. Store original asset and metadata.
3. Admin optionally requests background removal.
4. Cloudinary or selected provider creates a preview.
5. Show original and enhanced versions side by side.
6. Admin explicitly selects the presentation source.
7. Fall back to original if enhancement is missing or failed.

### Rules

- Never overwrite or delete the original.
- Never automatically process every image without review.
- Never convert the actual product to grayscale.
- Do not build a custom image-removal AI model in Next.js.
- Do not add masking brushes, generative fill, or a full image editor.

### Storefront presentation

- Use approved transparent enhancement when available
- Use `#F7F7F5` as UI background
- Use stable 4:5 ratio
- Use `object-contain`
- Use responsive `next/image`
- Use consistent padding

---

## 17. Caching

Cache only public, non-user-specific data.

### Cacheable

- Home featured sections
- Category navigation
- Product details
- Category metadata
- Stable settings
- Egypt shipping reference data for short periods

### Never shared-cache

- Auth state
- Profile and addresses
- Cart and wishlist
- Checkout and orders
- Custom requests
- Admin operational data

Suggested tags:

```ts
home
products
product:{id}
categories
category:{id}
shipping-rates
store-settings
```

Invalidation:

- Product write → `products`, `product:{id}`, related `category:{id}`, `home`
- Category write → `categories`, `category:{id}`, `home`
- Shipping write → `shipping-rates`
- Settings write → `store-settings`

Keep tags in a typed helper. Do not create unbounded cache entries for every search/filter combination.

---

## 18. Database and Query Rules

- Mongoose is server-only.
- Return DTOs, not raw documents.
- Use `.lean()` when appropriate.
- Project required fields.
- Paginate all lists.
- Add indexes for real query patterns.
- Use unique indexes for slugs, SKUs, order numbers, request numbers, and checkout tokens.
- Use transactions for checkout consistency.
- Use conditional updates to prevent negative stock.
- Avoid N+1 queries.
- Do not store image binaries in MongoDB.
- Store immutable order snapshots.

---

## 19. Validation and Errors

Use Zod for forms, search parameters, Server Actions, Route Handlers, environment variables, and database-bound normalization.

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: string;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };
```

Never expose stack traces, database internals, secrets, or raw provider errors.

---

## 20. Security Checklist

Always consider:

- IDOR
- NoSQL injection
- XSS
- CSRF
- Open redirects
- Mass assignment
- Upload abuse
- Brute force
- Account enumeration
- Sensitive-log leakage

Required practices:

- Authorize inside server functions.
- Allow-list mutable fields.
- Normalize identifiers.
- Rate-limit sensitive operations.
- Validate upload type, size, count, and ownership.
- Restrict remote image domains.
- Use least-privilege credentials.
- Redact cookies, authorization headers, passwords, reset tokens, and upload signatures.

---

## 21. Testing

### Unit

- Money calculations
- Egyptian phone normalization
- Address validation
- Filter parsing
- Product publication rules
- Variant price resolution
- Shipping calculation
- Cart totals
- Order idempotency and snapshots
- Status transitions
- WhatsApp link generation
- Custom-request validation
- Image-enhancement fallback

### Integration

- Better Auth flows
- Ownership enforcement
- Product/category CRUD
- Catalog queries
- Cart behavior
- Checkout transaction
- Duplicate checkout token
- Conditional stock updates
- Shipping lookup
- Upload ownership
- Admin authorization
- Cache invalidation
- Email failure not affecting persisted data

### E2E

1. Browse and filter products
2. Register and verify email
3. Add to cart and checkout
4. Prevent duplicate order
5. Admin confirms through WhatsApp workflow
6. Customer sees updated status
7. Customer submits a custom request
8. Admin manages catalog
9. Unauthorized users cannot access foreign or admin data

Do not claim tests passed unless they were run.

---

## 22. Team Ownership

### Member 1 — Authentication, Storefront, and Discovery

- Better Auth and auth pages
- Session/role helpers
- Design system
- Public catalog pages
- Public DTOs and queries
- Search and filters
- SEO and public caching

### Member 2 — Customer Commerce and Custom Requests

- Profile and Egyptian addresses
- Cart and wishlist
- Checkout and order creation
- Customer order pages
- Custom-request submission
- Secure upload flow

### Member 3 — Admin Catalog and Operations

- Admin layout
- Product/category admin forms and writes
- Image-enhancement approval
- Order operations and WhatsApp confirmation
- Custom-request administration
- Egypt shipping
- Admin emails
- Store settings
- Deployment and integration

Mention cross-owner impact before changing shared contracts.

---

## 23. Agent Workflow

Before editing:

1. Read this file.
2. Inspect the relevant route, module, schema, and tests.
3. Identify the owning module/member.
4. Confirm MVP scope.
5. State a plan.
6. Identify security, caching, transaction, and ownership implications.

While editing:

- Make the smallest coherent change.
- Avoid unrelated refactors.
- Preserve public contracts unless necessary.
- Add or update tests.
- Update cache invalidation when needed.
- Implement loading, empty, error, and success states.
- Reuse schemas and components.
- Do not duplicate domain logic.

After editing:

1. Run type checking.
2. Run linting.
3. Run relevant tests.
4. Run production build when practical.
5. Summarize changed files and decisions.
6. Report remaining risks honestly.

---

## 24. Commands

Use scripts from `package.json`. Typical examples:

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Do not invent scripts without a reason.

---

## 25. Definition of Done

A feature is complete only when:

- It matches MVP scope.
- Server validation and authorization exist.
- Loading, empty, error, and success states exist.
- Mobile and keyboard behavior are checked.
- Queries are projected and paginated.
- Required indexes are considered.
- Cache behavior and invalidation are implemented.
- Relevant tests pass.
- No secrets or sensitive data reach the client.
- No unrelated scope is added.
- Another developer can understand the change.

---

## 26. Forbidden Agent Behavior

Do not:

- Add post-MVP features without permission
- Replace the modular monolith with microservices
- Move business logic into UI components
- Use Client Components by default
- Trust client-submitted prices, roles, stock, or totals
- Store image binaries in MongoDB
- Delete originals after image enhancement
- Add internal notifications
- Add online payments or international shipping
- Add heavy dependencies for minor functionality
- Perform broad refactors during a feature task
- Change public contracts without documenting impact
- Claim tests passed without running them
