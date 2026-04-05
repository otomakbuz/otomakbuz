# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Next.js dev server (Turbopack), http://localhost:3000
npm run build    # Production build
npm run start    # Run built app
npm run lint     # ESLint (eslint-config-next)
npx tsc --noEmit # Type check only — used as primary pre-commit validation
```

No test runner is configured. Validation flow is `tsc --noEmit` + manual smoke test via the running preview server.

Supabase migrations live under `supabase/migrations/NNN_*.sql` and are applied through the Supabase dashboard (or CLI) directly against the managed project — there is no local Supabase docker setup in this repo.

## Architecture

### Stack
Next.js 16 (App Router, React 19, Turbopack) · Supabase (Auth + Postgres + Storage, `@supabase/ssr`) · Tailwind v4 · shadcn/ui + Base UI · React Three Fiber (landing hero) · Recharts · XLSX export.

### Route groups (`src/app/`)
Three top-level groups share a root layout:
- `(auth)` — `giris`, `kayit` (login/signup). Public.
- `(landing)` — marketing `page.tsx` at `/`. Public.
- `(dashboard)` — authenticated app: `panel`, `yukle`, `belgeler`, `belge/[id]`, `rehber`, `cari`, `raporlar`, `hatirlaticilar`, `ayarlar`. The dashboard layout does `getUser()` + `redirect("/giris")` on its own; the root `middleware.ts` additionally refreshes the Supabase session cookie on every non-static request via `src/lib/supabase/middleware.ts`.

All route segments use Turkish slugs (`yukle`, `belgeler`, `ayarlar`, etc.). UI copy is Turkish — keep new strings consistent.

### Supabase clients — three entry points
Pick the right one:
- `@/lib/supabase/server` (`createClient()`) — server components, server actions, route handlers. Reads/writes the request cookies.
- `@/lib/supabase/client` — client components needing a browser-side client.
- `@/lib/supabase/middleware` (`updateSession`) — used only from root `middleware.ts` to keep the auth cookie fresh.

### Server actions as the data layer
All DB access goes through `src/lib/actions/*.ts` (`"use server"`). Organised per domain: `auth`, `workspace`, `categories`, `documents`, `upload`, `contacts`, `ledger`, `patterns`, `reminders`, `reports`, `team`, `ocr-settings`, `settings-page`. Client components import these directly and await them.

**Critical Next.js behaviour**: server actions from the same client session are **serialized over the wire** (Next.js queues them to prevent races). A client-side `Promise.all([actionA(), actionB()])` does **not** run in parallel. To actually parallelize multiple queries for one page, wrap them in a single server action that runs `Promise.allSettled` server-side — see `src/lib/actions/settings-page.ts` as the reference pattern (5 queries for `/ayarlar` bundled into one `getSettingsPageData()` call, with `errors[]` surfaced to the UI for partial-failure toasts).

Other perf conventions in the actions layer:
- Hot auth helpers in `src/lib/actions/auth.ts` (`getUser`, `getUserWorkspace`) are wrapped in React `cache()` for request-scoped dedup.
- Prefer relying on RLS (`workspace_id = get_user_workspace_id()`) over re-fetching the workspace in every action. `getCategories` is the reference — it does one `SELECT * FROM categories ORDER BY name` and lets RLS filter.
- When you need the workspace id in a write path, call `supabase.rpc("get_user_workspace_id")` (one round-trip) instead of `getUserWorkspace()` (auth + table lookup).

### Multi-tenant model & RLS
The data model is workspace-scoped multi-tenant. `001_initial_schema.sql` creates `workspaces`, `categories`, `documents`, `tags`, etc. with RLS policies; `003_performance_optimizations.sql` **replaces all RLS subqueries with a SECURITY DEFINER function `get_user_workspace_id()`** so every policy is `workspace_id = get_user_workspace_id()` — a single function call per row instead of a subquery. When writing new tables or policies, follow this pattern (don't reintroduce `exists (select ... from workspaces where owner_id = auth.uid())` subqueries).

Later migrations layer on: `005_contacts`, `006_income_expense`, `007_ledger`, `008_recurring_patterns`, `009_reminders`, `010_report_rpcs`, `011_multi_user` (adds `workspace_members` + roles), `012_document_fields_expansion`. RPCs used from actions include `get_user_workspace_id`, `get_user_role`, `get_pending_reminder_count`, `get_upcoming_reminders`, `accept_invitation`, and the report RPCs in `010_report_rpcs.sql`.

### OCR pipeline
The upload flow in `src/lib/actions/upload.ts` and `src/hooks/use-upload.ts` calls `getOcrAdapter(workspaceId)` from `@/lib/ocr`. That factory:

1. Reads `workspaces.ocr_provider`, `ocr_api_key`, `ocr_model` (BYOK — keys stored per workspace, not global env).
2. Builds a **`FallbackOcrAdapter` chain**: the user's primary model first, then a curated pool (`OPENROUTER_FALLBACK_POOL` or `OPENAI_FALLBACK_POOL`). On 429/5xx the router auto-advances to the next entry.
3. Falls back to `MockOcrAdapter` when no key is configured (controlled by `OCR_ADAPTER` env var).

All adapters implement `OcrAdapter` (`src/lib/ocr/types.ts`). `OpenAIOcrAdapter` is reused for OpenRouter by passing `baseURL` + `extraHeaders`. When adding a new provider, extend `getOcrAdapter` and register it in the same pattern — don't bypass the fallback wrapper.

### Storage
Supabase Storage buckets are private; URLs in the UI are **signed URLs with 1-year expiry** generated server-side. `next.config.ts` whitelists `*.supabase.co/storage/v1/object/**` for `next/image`.

### Types
Shared domain types live in `src/types/index.ts` (`Category`, `Document`, `Workspace`, `WorkspaceMember`, `WorkspaceInvitation`, `WorkspaceRole`, `Reminder`, etc.). Import from `@/types`, not from action files.

### UI conventions
- Paper/receipt aesthetic: classes like `receipt-card`, `paper-bg`, `border-paper-lines`, colour tokens `receipt-brown`, `receipt-gold`, `ink`, `ink-muted`, `ink-faint` — defined in `globals.css` and Tailwind config. Reuse them instead of raw Tailwind greys.
- `ConfidenceBadge` (`src/components/documents/confidence-badge.tsx`) shows a tick ≥80% and an X below. Don't re-introduce the older colour-gradient variant.
- Toast notifications via `sonner` (`toast.success` / `toast.error`). Error messages in Turkish.
- 3D landing hero is `src/components/landing/hero-3d-scene.tsx` (React Three Fiber). It's heavy — keep it in a Suspense boundary and don't import it from the dashboard bundle.

### Workspace / settings area
The `/ayarlar` page is the canonical example of the bundled-action + `Promise.allSettled` pattern. If you add a new piece of data to this page, extend `getSettingsPageData()` rather than adding a new client-side action call — otherwise you re-introduce the serial round-trip problem.

### Language & naming
Route slugs, UI copy, toast messages, action error strings, and in-code comments on business logic are **Turkish**. TypeScript identifiers, types, and function names stay in English. When adding new strings, follow the surrounding file's language.
