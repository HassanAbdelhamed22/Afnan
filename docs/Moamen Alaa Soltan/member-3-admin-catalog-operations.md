# Member 3 — Admin Catalog and Operations Handoff

Date: 15 August 2026  
Owner: Moamen Alaa Soltan  
Scope: Member 3 responsibilities from the Afnan product/engineering plan and team-member brief.

## Delivery status

Member 3's MVP scope is implemented as a stack of reviewable branches and commits. The work preserves the modular-monolith architecture, uses server-side admin authorization, keeps operational data dynamic, and does not introduce excluded features such as internal notifications, analytics, online payments, inventory ledgers, or WhatsApp automation.

| Order | Branch | Commit | Delivered capability |
| --- | --- | --- | --- |
| 1 | `feat/admin-shell-rbac` | `1b86337` | Protected admin layout, responsive navigation, reusable admin UI states |
| 2 | `feat/admin-product-category-management` | `1f503e7` | Product/category projected lists, forms, publication rules, writes, cache invalidation |
| 3 | `feat/product-image-enhancement` | `82b9277` | Signed product-image flow, original retention, background-removal preview and approval |
| 4 | `feat/egypt-shipping-settings` | `41c4a84` | All Egypt governorate rates, quote lookup, store settings and templates |
| 5 | `feat/order-operations-whatsapp` | `39680d8` | Pending-first order queue, immutable details, WhatsApp state, transitions, stock restoration |
| 6 | `feat/custom-request-admin` | `212afc4` | Custom-request queue/detail, private notes, lifecycle and WhatsApp link |
| 7 | `feat/admin-email-alerts` | `416c7f7` | Escaped admin email views and best-effort post-commit delivery |
| 8 | `feat/admin-dashboard` | `6c1ac46` | Operational counts and bounded recent order/request reads |
| 9 | `chore/ci-observability-deployment` | `454a267` | CI gates, Playwright, headers, robots, health, script guards, versioned indexes |
| 10 | `chore/environment-isolation-observability` | `b67241c` | Environment-specific media folders and structured request-error monitoring |
| 11 | `docs/member-3-handoff` | final docs commit | This runbook and handoff |

These branches are intentionally stacked in the order above. Review and merge them sequentially. Each branch should initially target the branch immediately above it; after that parent merges, retarget or rebase the next branch onto `main`. Do not squash the entire stack into one feature commit. A local alternative is to fast-forward `main` through each branch in order after each review succeeds.

## Implemented behavior

### Authorization and admin UI

- `/admin/*` is guarded in the server layout with `requireAdmin()`.
- Unauthenticated access returns to login with a safe `returnTo`; authenticated non-admin access goes to `/unauthorized`.
- Every admin mutation repeats `requireAdmin()` before validation or database access.
- List state uses allow-listed URL parameters, projections, pagination, and bounded page sizes.
- Loading, empty, error, success, and confirmation states are present without a shared operational-data cache.

### Catalog and images

- Product/category writes use Zod, unique slug/SKU checks, fulfillment-specific validation, archive semantics, and typed cache invalidation.
- Active products require publishable category, pricing, image, and variant data.
- Original product images remain stored. Background removal is requested per asset, previewed beside the original, and requires explicit `Use Enhanced` or `Keep Original` approval.
- Storefront DTOs select the enhanced URL only when it is ready and approved; otherwise they safely use the original.
- Signed upload paths are isolated as `afnan/{APP_ENV}/products/...` and `afnan/{APP_ENV}/custom-requests/...`.

### Operations

- The order queue defaults pending confirmation work first and supports status, WhatsApp state, search, sort, and pagination.
- Order detail uses immutable product, customer, address, price, shipping, payment, personalization, and preparation snapshots.
- Order status transitions are allow-listed. Cancellation restores ready-made stock transactionally and at most once.
- WhatsApp URLs use normalized Egyptian numbers and encoded store-setting templates. Opening a link does not mutate contact state.
- Custom requests have a projected queue, simplified lifecycle, contact workflow, and admin-only internal notes.
- Shipping covers all 27 Egyptian governorates with integer EGP minor-unit fees and active-rate enforcement.
- Admin order/request emails are attempted only after persisted business data and cannot roll back a valid order or request.

### Platform

- GitHub Actions uses pinned pnpm `11.2.2` with a frozen lockfile, MongoDB service, typecheck, ESLint, Vitest, production build, and Chromium Playwright gates.
- CSP, clickjacking, MIME-sniffing, referrer, and browser-permission headers are configured.
- `robots.txt` excludes admin, account, cart, checkout, order-success, and order routes.
- `/api/health` is a non-cacheable liveness endpoint and does not expose secrets or database internals.
- Maintenance scripts refuse production execution without an operation-specific override. The destructive seed additionally requires the exact target database name.
- Index creation writes version `2026-08-member-3-v1` to the `_maintenance` collection.
- Unhandled Next server requests emit redacted structured routing context through `src/instrumentation.ts` for the deployment log sink.

## Verification record

The following checks were run locally on the completed implementation:

- `npm run typecheck` — passed.
- `npm run lint` — passed across the repository.
- `npm run test:ci` — 53 files and 162 tests passed on the final branch.
- `npm run build` — passed with all `/admin/*` routes rendered dynamically.
- `npm run test:e2e` — 3 Chromium tests passed against the production server: health, anonymous admin redirect, and private-route robots policy.
- `pnpm install --frozen-lockfile --lockfile-only` — passed, confirming lock consistency.

Cloudinary enhancement and Resend delivery were covered with mocked/provider-boundary tests. No live product image was processed and no live email was sent during implementation.

## Environment configuration

Store secrets only in `.env.local` for development and in the deployment provider's encrypted environment settings. Never commit values.

| Variable | Purpose | Production requirement |
| --- | --- | --- |
| `APP_ENV` | Media namespace: `development`, `preview`, `production`, or `test` | Set explicitly to `production` |
| `MONGODB_URI` | MongoDB connection | Dedicated production database user/cluster |
| `MONGODB_DB_NAME` | Database selection | Dedicated production database name |
| `BETTER_AUTH_SECRET` | Session/auth signing | Unique value, at least 32 characters |
| `BETTER_AUTH_URL` | Better Auth canonical URL | Production HTTPS origin |
| `NEXT_PUBLIC_APP_URL` | Public links, sitemap, email/WhatsApp deep links | Production HTTPS origin |
| `CLOUDINARY_CLOUD_NAME` | Signed uploads/enhancement | Required for live uploads |
| `CLOUDINARY_API_KEY` | Signed uploads/enhancement | Server environment only |
| `CLOUDINARY_API_SECRET` | Upload/resource signatures | Server environment only; never expose to client |
| `RESEND_API_KEY` | Transactional admin email | Restricted production sending key |
| `AUTH_EMAIL_FROM` | Verified sender | Address on the verified sending domain |
| `ADMIN_EMAIL` | Initial/fallback admin recipient | Monitored operational inbox |

The three Cloudinary values are still required before a live end-to-end image-enhancement check. Add them directly to `.env.local` and Vercel; do not paste them into chat or Git. The Resend variables exist locally, but production still needs a verified domain and a deliberate live smoke email.

After first admin access, configure `/admin/settings` with the operational recipient, WhatsApp number/template, order/request prefixes, and public social links.

## Suggested deployment strategy

1. Protect `main` and require the `CI` workflow before merge. Review the stacked branches sequentially so each domain change remains independently auditable.
2. Connect the Git repository to Vercel. Use preview deployments for feature branches and reserve `main` as the production branch. Vercel supports environment-specific variables and creates preview deployments for non-production branches ([Vercel environment variables](https://vercel.com/docs/environment-variables), [Vercel Git deployments](https://vercel.com/docs/git)).
3. Use separate MongoDB databases and credentials for development, preview, and production. Grant the application only the database privileges it needs; MongoDB documents database-scoped built-in roles such as `readWrite` ([MongoDB built-in roles](https://www.mongodb.com/docs/manual/reference/built-in-roles/)). Enable Atlas backups and assign backup/restore permissions separately from application access ([Atlas user roles](https://www.mongodb.com/docs/atlas/reference/user-roles/)).
4. Set `APP_ENV` per Vercel environment so uploads cannot share Cloudinary folders. Keep signed uploads, validate returned assets, and enable the managed background-removal capability on the chosen Cloudinary account. Cloudinary documents signed/direct upload behavior and upload restrictions in its [upload guide](https://cloudinary.com/documentation/upload_images).
5. Verify a dedicated Resend subdomain, publish its SPF/DKIM records, and add DMARC when ready. Resend recommends a subdomain to isolate sender reputation ([Resend domain verification](https://resend.com/docs/dashboard/domains/introduction)).
6. Enable Vercel Authentication for preview deployments where plan support permits it, because previews can contain operational test data ([Vercel Deployment Protection](https://vercel.com/docs/deployment-protection)).
7. Deploy preview first. Run Playwright against the preview with `PLAYWRIGHT_BASE_URL`, then manually verify admin catalog writes, signed upload, image approval, order transition/stock restoration, WhatsApp encoding, request notes, shipping quote, and a test admin email.
8. Take/confirm a MongoDB backup. Run the versioned index script once against production, then seed missing shipping rows without overwriting configured rates:

   ```powershell
   $env:NODE_ENV = "production"
   $env:ALLOW_PRODUCTION_MAINTENANCE = "create-indexes"
   pnpm db:indexes

   $env:ALLOW_PRODUCTION_MAINTENANCE = "seed-shipping"
   pnpm seed:shipping
   ```

9. Create the first admin only after that user has registered normally as a customer:

   ```powershell
   $env:NODE_ENV = "production"
   $env:ALLOW_PRODUCTION_MAINTENANCE = "create-admin"
   pnpm admin:create -- admin@example.com
   ```

10. Merge to `main`, allow Vercel to promote the production deployment, and check `/api/health`, authentication, one read-only storefront flow, and the admin dashboard before enabling operational use.

## Rollback and recovery

- For an application regression, immediately promote the last known-good Vercel deployment or revert the failing feature commit. Vercel's Git deployment model supports restoring a prior deployment through a revert/promotion workflow.
- Do not run the destructive seed in production. It requires both `ALLOW_PRODUCTION_MAINTENANCE=seed` and `ALLOW_DESTRUCTIVE_SEED` equal to the exact database name.
- New operational fields are additive and image presentation fields are optional, so a code rollback does not require deleting new data.
- For data corruption, stop admin writes, restore to a separate Atlas database, validate counts and critical orders, then change the production connection only after verification.
- Preserve original Cloudinary assets. A failed enhancement always falls back to the original and should not trigger asset deletion.
- Watch structured Vercel logs for `unhandled_request_error`, `admin_order_email_failed`, and `admin_custom_request_email_failed`. Add an external log drain/error provider later if alert routing beyond Vercel is required; that would be a separate infrastructure decision.

## Known external follow-ups

- Supply the Cloudinary credentials and enabled background-removal capability for a live verification.
- Verify the production Resend domain and perform one deliberate delivery test.
- Provision separate preview/production MongoDB credentials, backups, and network access rules.
- Configure Vercel environment variables, branch protection, deployment protection, custom domain, and rollback ownership.
- Decide the external alerting destination for structured production errors. No new monitoring vendor was added without approval.
