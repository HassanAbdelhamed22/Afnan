# Authentication & Authorization Guide

This document defines how to protect layouts, pages, Server Actions, Route Handlers, and database queries using the core authentication primitives we built.

---

## 1. Context: Team Roles & File Protection

*   **Member 1 (Auth infrastructure)** built the Better Auth configurations, server actions, error handlers, and the central DAL.
*   **Member 2 (Customer commerce)** and **Member 3 (Admin operations)** are responsible for implementing layout guards, action checks, and ownership constraints inside their respective features (e.g. products catalog, customer profile, admin orders).

Use the patterns below when implementing these feature pages.

---

## 2. Layout & Page Guards

When protecting page components or layouts (e.g. `/admin/layout.tsx` or `/account/page.tsx`), use the central DAL within a `try/catch` block to handle errors gracefully:

```typescript
import { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/modules/auth/dal";
import { ForbiddenError, UnauthenticatedError } from "@/lib/errors/app-error";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  try {
    // Assert active ADMIN session
    const session = await requireAdmin();

    return (
      <div>
        <aside>Admin sidebar</aside>
        <main>{children}</main>
      </div>
    );
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      // Redirect to login and preserve target path
      redirect("/login?returnTo=/admin");
    }

    if (error instanceof ForbiddenError) {
      // Show 404 for unauthorized users to prevent admin route disclosure
      notFound();
    }

    throw error;
  }
}
```

---

## 3. Server Action Security

Every Server Action is a public HTTP endpoint. **Never assume the user is authorized.** Perform DAL checks as the **very first line** of your action function:

```typescript
"use server";

import { requireAdmin } from "@/modules/auth/dal";
import { actionSuccess, actionFailure } from "@/lib/results/action-result";

export async function archiveProductAction(input: unknown) {
  // 1. Authorize user internally first
  const admin = await requireAdmin();

  // 2. Parse and validate parameters
  const parsed = archiveProductSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure("VALIDATION_ERROR", "Invalid payload", parsed.error.flatten().fieldErrors);
  }

  // 3. Perform operation
  await productService.archive(parsed.data.productId, admin.user.id);

  return actionSuccess({}, "Product archived successfully");
}
```

---

## 4. Route Handler Security

Wrap API Route Handlers in the central error handling decorator `withApiHandler`, and invoke DAL checks inside the handler body:

```typescript
import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { apiSuccess } from "@/lib/http/api-response";
import { requireAdmin } from "@/modules/auth/dal";

export const GET = withApiHandler(async (request: NextRequest) => {
  // Assert authorized administrator
  await requireAdmin();

  const orders = await orderService.listOrders();
  return apiSuccess(orders);
});
```

---

## 5. Database Resource Ownership Guards

When querying data owned by specific customers (e.g. custom requests, wishlists, carts, order records), **always enforce ownership filters directly inside the database query query criteria**. 

Do not query the record first and check ownership in JavaScript afterward.

```typescript
import { requireUser } from "@/modules/auth/dal";
import { OrderModel } from "./model";

export async function getCustomerOrder(orderNumber: string) {
  // 1. Retrieve authorized session
  const session = await requireUser();

  // 2. Query record with strict user ownership filter
  const order = await OrderModel.findOne({
    orderNumber,
    userId: session.user.id, // Enforced direct ownership check
  }).lean();

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  return order;
}
```
