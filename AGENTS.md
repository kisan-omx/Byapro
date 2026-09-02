# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Byapro Development Rules

## 1. Core Rule 🔴

**Solve the requested problem with the smallest safe change.**

### Priority

**Security → Data Integrity → Correctness → Performance → Simplicity → UX → Polish**

Before changing anything:

1. Inspect the relevant code.
2. Understand the existing architecture and data flow.
3. Search for existing hooks, services, components, utilities, and types.
4. Inspect the actual Supabase schema when database changes are involved.
5. Check existing RLS, relationships, indexes, views, triggers, and RPCs when relevant.
6. Reuse existing project patterns.
7. Check existing business logic before creating new business logic.
8. Use Tailwind Colors 🎨

    Use the project's Tailwind color system for all UI colors.

    Prefer existing Tailwind classes such as bg-primary, text-primary, bg-surface, text-text, border-border, etc.
    Do not hardcode hex/rgb colors directly in components.
    Use the existing brand colors consistently:
    Primary: primary
    Secondary: secondary
    Success: success
    Warning: warning
    Error: error
    Info: info
    Background: background
    Surface: surface
    Text: text
    Secondary Text: text-secondary
    Border: border
    If a new color is genuinely required, add it to tailwind.config.js first, then use the Tailwind class.
    Do not introduce random colors or create one-off color values inside components.
    Keep the UI visually consistent with the Byapro brand.

**Do not guess about the codebase.**

Do not redesign or refactor unrelated parts of the project.

---

## 2. Keep Changes Small 🔴

Always make the **smallest safe change** that solves the task.

### Do

* Reuse existing code.
* Extend existing components when appropriate.
* Keep functions focused.
* Preserve existing behavior.
* Prefer simple solutions.
* Remove directly related dead code when safe.
* Reuse existing dependencies and patterns.

### Do not

* Refactor unrelated code.
* Rewrite working code without a reason.
* Add unnecessary abstractions.
* Add unnecessary dependencies.
* Introduce new architecture for a small problem.
* Change unrelated UI or behavior.

> If the problem can safely be solved in 10 lines, do not turn it into 100 lines.

---

## 3. Expo / React Native 🔴

This project uses **Expo SDK 57**.

Before writing or modifying Expo/React Native code:

* Read the Expo SDK 57 documentation:
  `https://docs.expo.dev/versions/v57.0.0/`
* Check `package.json`.
* Verify package/API compatibility with SDK 57.
* Prefer dependencies already installed.

### Never without explicit permission

* Upgrade Expo.
* Upgrade React Native.
* Upgrade major dependencies.
* Replace existing libraries unnecessarily.
* Change the project's Expo architecture.

---

## 4. Project Structure

Follow the existing project structure.

Do not reorganize the project unless the task requires it.

Byapro application code is organized under src/.

When creating new code, prefer this responsibility flow:

Screen / Route
      ↓
Hook
      ↓
Service
      ↓
Database Query / Mutation
      ↓
Supabase / PostgreSQL

Typical responsibilities:

src/
├── app/          → Expo Router screens/routes
├── components/   → Reusable UI components
├── hooks/        → React hooks
├── services/     → Data and external service logic
├── database/     → Database queries, mutations, views, RPC
├── cache/        → Cache and local data layer
├── store/        → Global application state
├── types/        → Shared TypeScript types
├── utils/        → Small reusable utilities
├── constants/    → Application constants
└── lib/          → Configuration and integrations
Rules
Keep application code inside the existing src/ structure.
Reuse existing folders and patterns before creating new ones.
Before creating a new file, search for an existing implementation that can be reused.
Do not move files between directories unless required by the task.
Do not create unnecessary architectural layers.
Do not reorganize the project for personal preference.
Follow the existing project's established patterns when they differ from this recommendation.

Do not force this structure onto an existing project if it already uses another valid structure.

The actual codebase is the source of truth for project structure.

## 5. Screens & Hooks 🟠

Screens should mainly handle:

* UI
* User interactions
* Navigation
* Displaying state

Avoid large database queries directly inside screens.

Prefer:

```text
TransactionsScreen
      ↓
useTransactions()
      ↓
transactionService
      ↓
Supabase
```

Hooks should have one clear responsibility.

Examples:

```text
useTransactions()
useParties()
useItems()
useExpenses()
usePurchases()
useDashboard()
```

Avoid giant hooks such as:

```text
useAppData()
```

containing unrelated application data.

---

## 6. Database Performance 🟠

### Avoid N+1 Queries

Never fetch related data one row at a time when it can reasonably be batched.

### Bad

```text
Fetch 100 items
    ↓
Query item 1
Query item 2
Query item 3
...
Query item 100
```

### Good

Prefer:

1. One query with relationships.
2. Batched `.in(...)` queries.
3. Database views.
4. RPCs.
5. A small number of batched queries.

Example:

```ts
const ids = items.map(item => item.id);

const { data } = await supabase
  .from('stock')
  .select('item_id, quantity')
  .in('item_id', ids);
```

Then merge results in memory.

### Important

`Promise.all()` does **not** solve N+1.

```ts
await Promise.all(
  items.map(item => fetchStock(item.id))
);
```

This still creates many database requests.

---

## 7. Database Queries 🟠

Only fetch data the screen actually needs.

Avoid unnecessary:

```ts
.select('*')
```

Prefer selecting required columns:

```ts
.select(`
  id,
  name,
  sale_price,
  stock_qty
`)
```

Do not fetch unrelated:

* invoices
* payments
* party history
* item details
* analytics
* dashboard data
* stock history

unless required by the operation.

### Search, Filter & Sort

For large datasets:

* Search on the database/server side.
* Filter on the database/server side.
* Sort on the database/server side.
* Do not download thousands of records just to filter them in JavaScript.
* Ensure search/filter/sort works correctly with pagination.

---

## 8. Pagination & Infinite Scroll 🟠

All potentially large lists must use pagination.

### Default

**20 records per request.**

```ts
const PAGE_SIZE = 20;
```

### Required behavior

```text
Screen opens
    ↓
Load 20 records
    ↓
User scrolls
    ↓
Automatically load next 20
    ↓
User scrolls
    ↓
Automatically load next 20
```

Do not load hundreds or thousands of records just because a screen opened.

### Apply to

* Transactions
* Sales
* Purchases
* Parties
* Payments
* Expenses
* Invoices
* Items / Inventory
* Stock movements
* Party history
* Payment history
* Other large historical lists

Small, guaranteed-bounded lists do not need pagination.

### Infinite-scroll requirements

* Initial request → 20 records.
* Next request → next 20.
* Append new records; do not replace existing records.
* Prevent duplicate page requests.
* Prevent concurrent requests for the same page.
* Preserve already-loaded records.
* Stop when `hasMore === false`.
* Show loading state while loading more.
* Do not unnecessarily refetch the first page.
* Pull-to-refresh resets pagination and loads only the first 20.
* Search/filter changes reset pagination.
* Never mix results from different filters.
* Use stable ordering.
* Maintain the same query/filter state for every page.

### Stable ordering

Recommended:

```sql
ORDER BY created_at DESC, id DESC
```

Use `.range()` or cursor/keyset pagination as appropriate.

This prevents missing or duplicate records when new records are created while the user is scrolling.

### Protection

```ts
if (isLoadingMore || !hasMore) return;
```

### Core rule

**20 records → scroll → next 20 → scroll → next 20.**

Never fetch the entire historical dataset into the Expo client.

---

## 9. Database Schema 🔴

Never assume a table, column, relationship, constraint, index, RLS policy, view, trigger, or RPC exists.

Before database changes, verify:

```text
Tables
Columns
Data types
Foreign keys
Unique constraints
Indexes
RLS policies
Views
Triggers
RPC/functions
Relationships
```

Before creating a migration:

* Check whether the object already exists.
* Check existing indexes.
* Check existing constraints.
* Check existing relationships.
* Check existing RLS.
* Check existing triggers/functions.
* Check whether existing business logic already performs the required operation.

Never create duplicate:

* columns
* indexes
* constraints
* relationships
* ownership fields
* triggers
* functions

---

## 10. Database Migrations 🔴

All schema changes must use reproducible migrations.

### Do

* Keep migrations focused.
* Preserve existing data.
* Verify the existing schema first.
* Make data migrations explicit.
* Check RLS and indexes.
* Check dependencies before modifying database objects.
* Make migrations safe to apply consistently.

### Do not

* Make undocumented production changes.
* Modify unrelated tables.
* Drop data without explicit authorization.
* Use destructive migrations simply to make a feature work.
* Remove existing constraints without understanding their purpose.

---

## 11. Supabase Security & RLS 🔴

Byapar is a **multi-tenant application**.

A business must only access its own data.

Important business data includes:

* Sales
* Purchases
* Payments
* Expenses
* Inventory
* Items
* Invoices
* Returns
* Financial records
* Party/customer records
* Employee/user records

**Never disable RLS to make a feature work.**

Every relevant table must have appropriate authorization/RLS policies.

---

## 12. Ownership & Authorization 🔴

Never trust ownership values supplied by the frontend.

Do not rely only on:

```ts
.eq('business_id', businessId)
```

if the client can manipulate `businessId`.

Always verify authorization using trusted authenticated/backend/database state.

Never blindly trust:

```text
user_id
business_id
owner_id
employee_id
role
permissions
```

Frontend checks are for UX, **not security**.

A user must never be able to modify an ID and access another business's data.

---

## 13. Secrets & API Security 🔴

Never expose secrets in Expo/frontend code.

Never ship:

```text
Supabase service-role key
Database passwords
Private API keys
Admin credentials
Private signing keys
Server secrets
```

The Supabase service-role key must never be included in the Expo application.

Use secure server-side functionality when elevated privileges are required.

Use HTTPS for external requests.

Never log secrets or sensitive authentication information.

---

## 14. Cache-First Data Loading 🟠

Byapar should feel fast and responsive.

Preferred flow:

```text
Screen opens
    ↓
Read cached/local data
    ↓
Render immediately
    ↓
Fetch/revalidate in background
    ↓
Update cache
    ↓
Update UI
```

Do not show a full loading screen every time a user returns to a screen when usable cached data already exists.

Cache should not hide incorrect database logic.

### Important

Cached data must be clearly treated as potentially stale.

Server/database state remains authoritative for important business data.

---

## 15. Financial Data Integrity & Atomicity 🔴

For sales, purchases, payments, expenses, returns, inventory changes, balances, invoices, and other financial/business operations:

**Never allow partial updates or inconsistent state.**

When an operation requires multiple related database changes, they should succeed or fail together whenever possible.

Example:

```text
Create Sale
    ↓
Create Sale Items
    ↓
Update Stock
    ↓
Update Party Balance
    ↓
Commit
```

Do not allow:

```text
Sale created ✓
Sale items created ✓
Stock update failed ✗
Party balance failed ✗
```

while showing the user "Sale successful."

### Rules

* Use database transactions/RPCs when multiple related records must change atomically.
* Preserve referential integrity.
* Do not hide database consistency problems in the UI.
* Do not show fake success.
* Do not silently discard failed operations.
* Financial data must remain consistent after failures.
* Database state is the source of truth.

---

## 16. Concurrency & Race Conditions 🔴

Assume multiple requests can happen at the same time.

Important cases include:

* Two users selling the same stock.
* Two users updating the same party balance.
* Multiple payments happening simultaneously.
* Two devices editing the same record.
* Double submission.
* Rapid taps.
* Multiple sync requests.
* Multiple background refetches.

Never rely only on frontend checks for concurrency protection.

Use appropriate:

* Database constraints
* Atomic updates
* Transactions
* RPCs
* Server-side validation
* Locking mechanisms where appropriate

### Core rule

**The database must remain correct even when requests arrive concurrently.**

A frontend check such as:

```ts
if (stock > 0)
```

is not sufficient protection against two simultaneous sales.

---

## 17. Idempotency & Duplicate Financial Operations 🔴

Financial mutations must be safe against retries and duplicate requests.

Protect against:

* Double taps.
* Network retries.
* App reloads.
* Duplicate sync attempts.
* Repeated API requests.
* Multiple devices submitting the same operation.

Important operations include:

* Sales
* Purchases
* Payments
* Expenses
* Returns
* Stock movements
* Invoices

Where appropriate, use:

* Unique client/request IDs.
* Database unique constraints.
* Idempotency keys.
* Server-side duplicate detection.

**Retrying a request must not accidentally create the same financial transaction twice.**

---

## 18. Offline Sync & Conflict Handling 🟠

If offline/local persistence is supported, define its behavior explicitly.

### Offline rules

* Clearly distinguish pending/local data from confirmed server data.
* Never silently lose pending user changes.
* Queue offline mutations safely.
* Give pending mutations a unique identifier.
* Retry safely when connectivity returns.
* Retrying must not create duplicates.
* Preserve mutation order when order matters.
* Server data remains authoritative.
* Failed synchronization must be visible when it affects important business data.

### Conflict handling

Never allow stale cached data to blindly overwrite newer server data.

Before implementing synchronization, define:

* Which data can be edited offline.
* Which data requires server confirmation.
* Which side wins when conflicts occur.
* Whether records can be merged.
* Whether a conflict requires user action.

**Do not invent a conflict-resolution strategy during implementation.**

---

## 19. Optimistic UI & Rollback 🟠

Optimistic UI may be used to make Byapar feel fast, but it must never create permanent fake business data.

### Rules

* Update UI optimistically only when the operation can safely be rolled back.
* Keep enough information to restore the previous state.
* If the database operation fails, rollback the optimistic change.
* Show a clear error.
* Never leave a failed financial operation displayed as successfully saved.
* Revalidate affected data when necessary.
* Do not allow optimistic state to permanently override server state.

For high-risk financial operations, prefer confirmed server state when optimistic behavior could create inconsistency.

---

## 20. Mutations & UI Updates 🟠

After creating/updating data, do not automatically refetch a large dataset when only a small part changed.

Prefer:

```text
User creates transaction
        ↓
Update local UI/cache when safe
        ↓
Persist to database
        ↓
Revalidate affected data if necessary
```

Avoid:

```text
Create transaction
        ↓
Fetch thousands of transactions
        ↓
Replace entire list
```

When safe, update the affected record/list locally.

Financial data must remain consistent with the database source of truth.

---

## 21. Business Logic & Financial Data 🔴

Do not duplicate business calculations across multiple files.

Maintain one authoritative source of truth for:

* Transaction types
* Balances
* Stock calculations
* Totals
* Financial calculations
* Business rules
* Receivables
* Payables
* Profit
* Payment totals
* Invoice totals

### Important

The same calculation must not be independently implemented in:

* Screen A
* Screen B
* Hook A
* Hook B
* Service A
* Dashboard

If a business calculation changes, identify the authoritative implementation and all callers.

Before changing business logic:

1. Find all callers.
2. Check related screens.
3. Check hooks/services.
4. Check database views/triggers/RPCs.
5. Check related calculations.
6. Preserve existing behavior unless the task requires a change.

For financial/inventory operations, consider:

* Duplicate submissions
* Partial failures
* Race conditions
* Incorrect totals
* Quantity changes
* Referential integrity
* Transaction consistency
* Concurrent updates
* Offline retries
* Sync conflicts

Never hide database consistency problems by making the UI appear successful.

---

## 22. Deletion, Cancellation & Historical Records 🔴

Important business records should not be casually destroyed.

For:

* Sales
* Purchases
* Payments
* Expenses
* Invoices
* Returns
* Stock movements
* Financial records

prefer appropriate:

* Cancel
* Void
* Reverse
* Archive

mechanisms when business history must be preserved.

Never permanently delete important financial data unless explicitly required and authorized.

When a record is cancelled or reversed, ensure related balances and stock are handled consistently.

---

## 23. Audit & Change History 🟠

Important financial/business changes should preserve accountability when required.

Where appropriate, track:

* Who created the record.
* Who modified the record.
* Who cancelled/reversed it.
* When the change happened.
* What important value changed.

Do not remove audit information simply to simplify implementation.

---

## 24. Prevent Duplicate Requests 🟠

Watch for duplicate requests caused by:

* Double taps
* React re-renders
* Incorrect `useEffect` dependencies
* Multiple mounted screens
* Navigation
* Focus events
* Infinite-scroll events
* Unnecessary refetching
* Offline retries
* Synchronization

Before adding a request:

1. Search for an existing request.
2. Check existing hooks/services.
3. Prevent duplicate in-flight requests where appropriate.
4. Keep loading/error states predictable.
5. Ensure retries are safe.

---

## 25. Navigation 🔴

Navigation must remain safe under rapid interaction.

For normal navigation to an existing destination, prefer:

```ts
router.navigate(...)
```

Use:

```ts
router.push(...)
```

only when intentionally creating another route instance.

Use:

```ts
router.replace(...)
```

when the current screen should not remain in the back stack.

Do not create a global navigation abstraction to solve one button's problem.

### Verify important navigation

Test:

* Single tap.
* Rapid 2–5 taps.
* Only one destination opens.
* Back navigation works.
* No duplicate API requests.
* Screen effects do not execute multiple times.

Important flows include:

```text
Settings
Add Item
Add Party
Sale
Purchase
Stock Summary
Invoice Preview
Quick Actions
```

---

## 26. React & TypeScript 🟠

### TypeScript

* Avoid `any` unless genuinely necessary.
* Do not use `@ts-ignore` just to silence errors.
* Prefer correct types.
* Reuse shared types.
* Prefer generated Supabase types when available.
* Do not duplicate database types manually when generated types already exist.

### React

* Avoid unnecessary re-renders.
* Do not add `useMemo`/`useCallback` everywhere without a reason.
* Keep effects focused.
* Avoid `useEffect` when derived state or event handling is sufficient.
* Clean up subscriptions/listeners when required.
* Avoid unnecessary state duplication.

---

## 27. Components & Files 🟠

Before creating a new component/file:

1. Search for an existing implementation.
2. Check whether it can be reused.
3. Check existing hooks, utilities, and types.
4. Create a new file only when it provides a clear benefit.

Avoid creating many tiny files without a clear reason.

---

## 28. UI / UX 🟠

Byapar is designed for small businesses.

Prefer:

* Simple screens.
* Clear labels.
* Fast data entry.
* Large obvious actions.
* Short workflows.
* Consistent navigation.
* Clear loading states.
* Clear error states.
* Responsive layouts.
* Existing design-system patterns.

Follow the existing design system.

Do not introduce a new visual system for a small feature unless necessary.

### Responsive behavior

UI must work across supported device sizes.

Avoid:

* Hardcoded widths that break layouts.
* Content overflowing the screen.
* Buttons becoming inaccessible on smaller devices.
* Keyboard covering important fields.
* Unsafe-area problems.
* Layouts that only work on one device size.

---

## 29. Error Handling 🟠

Never silently ignore important errors.

For user-facing operations:

* Show a useful message.
* Preserve entered data where practical.
* Do not expose sensitive technical details.
* Log useful debugging information when appropriate.
* Never show fake success when the operation failed.
* Clearly distinguish network failure from validation failure when useful.
* Do not silently discard failed financial operations.

### Important

If the database result is uncertain, do not tell the user that the operation definitely succeeded.

---

## 30. Dependencies 🟠

Before installing a package:

1. Check `package.json`.
2. Check whether an existing dependency already solves the problem.
3. Verify Expo SDK 57 compatibility.
4. Confirm the dependency is actually necessary.
5. Check whether the package adds unnecessary bundle or maintenance cost.

Do not add a library for something that can safely use existing APIs.

Do not upgrade dependencies unless explicitly requested or required for a verified issue.

---

## 31. No Unrequested Changes 🔴

If the task is:

> Fix duplicate navigation on Add Item.

Do **not** also:

* Redesign Add Item.
* Rewrite navigation architecture.
* Rename unrelated files.
* Upgrade Expo.
* Rewrite unrelated database queries.
* Change unrelated UI.
* Install unnecessary packages.
* Refactor unrelated components.

**Fix the requested problem and stop.**

---

## 32. No Unsupported Performance Claims 🟠

Do not claim that something is:

* Faster
* More optimized
* More efficient
* Better performing
* Lower latency

without reasonable verification.

If performance was not measured, use precise language such as:

> "This reduces the number of database requests."

rather than:

> "This is 2x faster."

When performance is important, verify using appropriate measurements.

For indexes, justify them based on actual query patterns rather than adding indexes blindly.

---

## 33. Date, Time & Monetary Data 🔴

Financial calculations must use safe numeric handling.

### Money

* Do not rely on JavaScript floating-point arithmetic for authoritative monetary calculations.
* Use appropriate database `numeric`/decimal types.
* Define consistent rounding behavior.
* Keep currency calculations consistent across the application.
* Never silently round financial values differently on different screens.

### Date and time

Use one consistent date/time strategy.

Do not mix:

* Device-local dates
* UTC dates
* Database timestamps

inconsistently when calculating:

* Daily sales
* Monthly sales
* Expenses
* Profit
* Payments
* Reports
* Transaction history

---

## 34. Verification 🟠

After making changes, run the smallest relevant verification available.

Check:

```text
TypeScript errors
Lint errors
Relevant tests
Build errors
Affected user flow
```

For database changes also verify:

```text
Schema
RLS
Indexes
Relationships
Queries
Triggers/RPCs
Data integrity
```

For financial operations verify when relevant:

```text
Duplicate submission
Concurrent updates
Partial failure
Rollback
Balance calculation
Stock calculation
Retry behavior
```

Do not claim a fix is complete when relevant verification was possible but not performed.

---

## 35. Final Checklist

Before reporting a task as complete:

### Code

* [ ] Change is minimal.
* [ ] No unrelated refactoring.
* [ ] Existing patterns reused.
* [ ] No unnecessary dependency.
* [ ] No unnecessary abstraction.
* [ ] Existing business logic reused where appropriate.
* [ ] No unnecessary duplicate code.

### Database

* [ ] Actual schema inspected.
* [ ] Existing indexes checked.
* [ ] No N+1 queries.
* [ ] Related data is batched.
* [ ] Large lists are paginated.
* [ ] Initial large-list request is limited to 20 records.
* [ ] Only required data is fetched.
* [ ] Search/filter/sort is database-side for large datasets.
* [ ] Migrations are reproducible.
* [ ] Existing constraints checked.
* [ ] Existing triggers/RPCs/views checked.

### Security

* [ ] RLS remains enabled.
* [ ] Ownership is verified.
* [ ] Users cannot access another business's data.
* [ ] No secrets are exposed.
* [ ] Sensitive operations are authorized.
* [ ] Frontend checks are not treated as security.
* [ ] Service-role credentials are never exposed.

### Financial Integrity

* [ ] No duplicate financial transaction can be created accidentally.
* [ ] Related financial/inventory updates are atomic where required.
* [ ] Financial calculations have one authoritative source.
* [ ] Database is the source of truth.
* [ ] Partial failures are handled.
* [ ] Race conditions are considered.
* [ ] Concurrent updates are safe.
* [ ] Monetary calculations use appropriate numeric handling.
* [ ] Important deletion/cancellation behavior is safe.

### Performance

* [ ] No unnecessary duplicate requests.
* [ ] Cache used where appropriate.
* [ ] Mutations do not cause unnecessary full refetches.
* [ ] Infinite scroll loads only the required page.
* [ ] Initial large-list request is limited to 20 records.
* [ ] Pagination has stable ordering.
* [ ] Pagination prevents duplicate/concurrent page requests.
* [ ] Indexes are justified by actual queries.
* [ ] No unsupported performance claims.

### Pagination

* [ ] Initial load = 20.
* [ ] Scroll = next 20.
* [ ] Existing records are appended.
* [ ] `hasMore` is respected.
* [ ] Stable `created_at + id` ordering is used where appropriate.
* [ ] Search/filter changes reset pagination.
* [ ] Pull-to-refresh loads only the first 20.
* [ ] Different filters never mix results.
* [ ] New records do not cause missing/duplicate records.

### Offline & Sync

* [ ] Pending local changes are not silently lost.
* [ ] Offline mutations have unique identifiers where required.
* [ ] Retries cannot create duplicates.
* [ ] Server remains authoritative.
* [ ] Stale cache cannot blindly overwrite newer server data.
* [ ] Conflict behavior is explicitly defined.
* [ ] Failed synchronization is handled visibly when important.

### Optimistic UI

* [ ] Optimistic changes can be rolled back.
* [ ] Previous state can be restored.
* [ ] Failed mutations rollback correctly.
* [ ] Failed financial operations never remain as fake success.
* [ ] Affected data is revalidated when necessary.

### Navigation

* [ ] Rapid taps do not create duplicate screens.
* [ ] Correct router method is used.
* [ ] Back behavior is correct.
* [ ] Duplicate API calls are avoided.
* [ ] Important navigation flows were verified.

### Verification

* [ ] Relevant typecheck/lint/test was run.
* [ ] Affected flow was verified when possible.
* [ ] Database changes were verified when relevant.
* [ ] Offline/error behavior was considered when relevant.
* [ ] No obvious new errors were introduced.
* [ ] No unrelated changes were made.

---

# Final Rule 🔴

**Inspect the code → inspect the schema → understand the data flow → understand the business rules → make the smallest safe change → protect data integrity → verify the result.**

**Do not redesign the project.
Do not guess.
Do not make unrelated changes.
Never sacrifice financial/data integrity for UI convenience.**
