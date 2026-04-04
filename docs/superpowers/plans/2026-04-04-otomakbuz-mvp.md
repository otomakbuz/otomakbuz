# Otomakbuz MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete MVP for Otomakbuz.com — a receipt/invoice processing platform with instant OCR, document management, and export capabilities.

**Architecture:** Next.js 14 App Router with Server Components and Server Actions. Supabase for PostgreSQL, Auth, and Storage. OCR adapter pattern with mock implementation. Shadcn/ui + Tailwind for UI. All UI text in Turkish, code in English.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Shadcn/ui, TanStack Table, Supabase (DB + Auth + Storage), SheetJS (xlsx)

---

## File Structure

```
otomakbuz/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout (fonts, metadata)
│   │   ├── globals.css                         # Tailwind + global styles
│   │   ├── (landing)/
│   │   │   └── page.tsx                        # Landing page
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                      # Auth layout (centered card)
│   │   │   ├── giris/page.tsx                  # Login
│   │   │   └── kayit/page.tsx                  # Register
│   │   └── (dashboard)/
│   │       ├── layout.tsx                      # Dashboard layout (sidebar + header)
│   │       ├── panel/page.tsx                  # Dashboard
│   │       ├── yukle/page.tsx                  # Upload + instant OCR
│   │       ├── belgeler/page.tsx               # Documents list
│   │       ├── belge/[id]/page.tsx             # Document detail
│   │       ├── raporlar/page.tsx               # Reports & export
│   │       └── ayarlar/page.tsx                # Settings
│   ├── components/
│   │   ├── ui/                                 # Shadcn/ui components (auto-generated)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx                     # Dashboard sidebar navigation
│   │   │   ├── header.tsx                      # Dashboard top header
│   │   │   └── logo.tsx                        # Logo component
│   │   ├── landing/
│   │   │   ├── hero.tsx                        # Hero section
│   │   │   ├── features.tsx                    # Features grid
│   │   │   └── how-it-works.tsx                # 3-step explanation
│   │   ├── auth/
│   │   │   ├── login-form.tsx                  # Login form
│   │   │   └── register-form.tsx               # Register form
│   │   ├── dashboard/
│   │   │   ├── stat-card.tsx                   # Summary stat card
│   │   │   ├── recent-documents.tsx            # Recent docs mini-table
│   │   │   └── category-chart.tsx              # Category distribution chart
│   │   ├── documents/
│   │   │   ├── documents-table.tsx             # TanStack data table
│   │   │   ├── columns.tsx                     # Table column definitions
│   │   │   ├── document-filters.tsx            # Filter controls
│   │   │   ├── document-detail.tsx             # Detail view with edit
│   │   │   ├── confidence-badge.tsx            # Confidence score indicator
│   │   │   └── status-badge.tsx                # Document status badge
│   │   ├── upload/
│   │   │   ├── drop-zone.tsx                   # Drag & drop area
│   │   │   ├── upload-progress.tsx             # Upload + OCR progress list
│   │   │   └── review-form.tsx                 # OCR result review form
│   │   └── reports/
│   │       ├── report-summary.tsx              # Summary cards & charts
│   │       └── export-buttons.tsx              # CSV/Excel export buttons
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                       # Browser Supabase client
│   │   │   ├── server.ts                       # Server Supabase client
│   │   │   └── middleware.ts                   # Auth middleware helper
│   │   ├── ocr/
│   │   │   ├── types.ts                        # OcrResult & OcrAdapter interfaces
│   │   │   ├── mock-adapter.ts                 # Mock OCR implementation
│   │   │   └── index.ts                        # Adapter factory (env-based)
│   │   ├── export/
│   │   │   ├── csv.ts                          # CSV generation
│   │   │   └── excel.ts                        # Excel generation (SheetJS)
│   │   ├── actions/
│   │   │   ├── auth.ts                         # Auth server actions
│   │   │   ├── documents.ts                    # Document CRUD server actions
│   │   │   ├── categories.ts                   # Category CRUD server actions
│   │   │   ├── upload.ts                       # Upload + OCR server action
│   │   │   └── workspace.ts                    # Workspace server actions
│   │   └── utils.ts                            # Shared utilities
│   ├── types/
│   │   └── index.ts                            # All TypeScript types/interfaces
│   └── hooks/
│       ├── use-upload.ts                       # Upload + OCR state management
│       └── use-documents.ts                    # Document filtering/pagination
├── public/
│   └── otomakbuz logo.png                      # App logo
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql              # Tables + RLS
│       └── 002_seed_data.sql                   # Default categories + sample docs
├── middleware.ts                                # Next.js middleware (auth redirect)
├── .env.local.example                          # Environment variables template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json                             # Shadcn/ui config
└── package.json
```

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `.env.local.example`, `components.json`

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/mertaysune/Desktop/otomakbuz
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Select defaults when prompted. This creates the base Next.js 14 project with App Router, TypeScript, Tailwind CSS, and ESLint.

- [ ] **Step 2: Install core dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr xlsx date-fns lucide-react
npm install -D @types/node
```

- [ ] **Step 3: Initialize Shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

- [ ] **Step 4: Install required Shadcn/ui components**

```bash
npx shadcn@latest add button card input label table badge select dropdown-menu dialog tabs separator avatar sheet toast sonner popover calendar command checkbox textarea tooltip
```

- [ ] **Step 5: Install TanStack Table**

```bash
npm install @tanstack/react-table
```

- [ ] **Step 6: Create environment variables template**

Create `.env.local.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OCR_ADAPTER=mock
```

- [ ] **Step 7: Initialize git repository**

```bash
cd /Users/mertaysune/Desktop/otomakbuz
git init
```

Create `.gitignore` additions (append to existing):

```
.env.local
.superpowers/
```

- [ ] **Step 8: Move logo to public directory**

The logo file `otomakbuz logo.png` should be in the project root already. Move it to `public/`:

```bash
# If logo is at project root:
mv "/Users/mertaysune/Desktop/otomakbuz/otomakbuz logo.png" "/Users/mertaysune/Desktop/otomakbuz/public/otomakbuz logo.png"
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js project with Shadcn/ui, Supabase, and TanStack Table"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Define all TypeScript types**

```typescript
// src/types/index.ts

export type DocumentStatus =
  | "uploaded"
  | "processing"
  | "needs_review"
  | "verified"
  | "archived"
  | "failed";

export type DocumentType =
  | "fatura"
  | "fis"
  | "makbuz"
  | "pos_slip"
  | "gider_fisi"
  | null;

export type PaymentMethod =
  | "nakit"
  | "kredi_karti"
  | "banka_karti"
  | "havale"
  | "diger"
  | null;

export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
}

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  default_currency: string;
  created_at: string;
}

export interface Category {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Tag {
  id: string;
  workspace_id: string;
  name: string;
  created_at: string;
}

export interface Document {
  id: string;
  workspace_id: string;
  user_id: string;
  original_file_url: string;
  preview_file_url: string | null;
  file_type: string;
  document_type: DocumentType;
  supplier_name: string | null;
  supplier_tax_id: string | null;
  document_number: string | null;
  issue_date: string | null;
  issue_time: string | null;
  subtotal_amount: number | null;
  vat_amount: number | null;
  vat_rate: number | null;
  total_amount: number | null;
  currency: string;
  payment_method: PaymentMethod;
  category_id: string | null;
  notes: string | null;
  status: DocumentStatus;
  confidence_score: number | null;
  field_scores: Record<string, number> | null;
  raw_ocr_text: string | null;
  parsed_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category | null;
  tags?: Tag[];
}

export interface DocumentTag {
  id: string;
  document_id: string;
  tag_id: string;
}

export interface AuditLog {
  id: string;
  document_id: string;
  user_id: string;
  action_type: "created" | "updated" | "verified" | "deleted" | "reprocessed";
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

export interface DocumentFilters {
  search?: string;
  category_id?: string;
  document_type?: DocumentType;
  status?: DocumentStatus;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  tag_id?: string;
}

export interface DashboardStats {
  documents_this_month: number;
  total_expense_this_month: number;
  pending_review_count: number;
  category_distribution: { name: string; color: string; total: number }[];
  recent_documents: Document[];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions for all entities"
```

---

## Task 3: Supabase Client Setup

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`, `src/middleware.ts`

- [ ] **Step 1: Create browser Supabase client**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server Supabase client**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create middleware helper**

```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/giris") ||
    request.nextUrl.pathname.startsWith("/kayit");
  const isDashboardPage =
    request.nextUrl.pathname.startsWith("/panel") ||
    request.nextUrl.pathname.startsWith("/yukle") ||
    request.nextUrl.pathname.startsWith("/belgeler") ||
    request.nextUrl.pathname.startsWith("/belge") ||
    request.nextUrl.pathname.startsWith("/raporlar") ||
    request.nextUrl.pathname.startsWith("/ayarlar");

  if (!user && isDashboardPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/panel";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 4: Create Next.js middleware**

```typescript
// middleware.ts (project root, NOT in src/)
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/ middleware.ts
git commit -m "feat: add Supabase client setup with auth middleware"
```

---

## Task 4: Database Schema & Seed Data

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`, `supabase/migrations/002_seed_data.sql`

- [ ] **Step 1: Create initial schema migration**

```sql
-- supabase/migrations/001_initial_schema.sql

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Workspaces
create table public.workspaces (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users on delete cascade not null,
  name text not null,
  default_currency text default 'TRY' not null,
  created_at timestamptz default now() not null
);

alter table public.workspaces enable row level security;

create policy "Users can view own workspaces"
  on public.workspaces for select
  using (auth.uid() = owner_id);

create policy "Users can create workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own workspaces"
  on public.workspaces for update
  using (auth.uid() = owner_id);

-- Auto-create workspace on signup
create or replace function public.handle_new_user_workspace()
returns trigger as $$
begin
  insert into public.workspaces (owner_id, name)
  values (new.id, 'Varsayilan Calisma Alani');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_workspace
  after insert on auth.users
  for each row execute procedure public.handle_new_user_workspace();

-- Categories
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  name text not null,
  color text not null default '#6b7280',
  created_at timestamptz default now() not null
);

alter table public.categories enable row level security;

create policy "Users can view categories in own workspace"
  on public.categories for select
  using (
    workspace_id in (
      select id from public.workspaces where owner_id = auth.uid()
    )
  );

create policy "Users can create categories in own workspace"
  on public.categories for insert
  with check (
    workspace_id in (
      select id from public.workspaces where owner_id = auth.uid()
    )
  );

create policy "Users can update categories in own workspace"
  on public.categories for update
  using (
    workspace_id in (
      select id from public.workspaces where owner_id = auth.uid()
    )
  );

create policy "Users can delete categories in own workspace"
  on public.categories for delete
  using (
    workspace_id in (
      select id from public.workspaces where owner_id = auth.uid()
    )
  );

-- Documents
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  original_file_url text not null,
  preview_file_url text,
  file_type text not null,
  document_type text,
  supplier_name text,
  supplier_tax_id text,
  document_number text,
  issue_date date,
  issue_time time,
  subtotal_amount numeric(12,2),
  vat_amount numeric(12,2),
  vat_rate numeric(5,2),
  total_amount numeric(12,2),
  currency text default 'TRY' not null,
  payment_method text,
  category_id uuid references public.categories on delete set null,
  notes text,
  status text default 'uploaded' not null,
  confidence_score numeric(5,2),
  field_scores jsonb,
  raw_ocr_text text,
  parsed_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.documents enable row level security;

create policy "Users can view documents in own workspace"
  on public.documents for select
  using (
    workspace_id in (
      select id from public.workspaces where owner_id = auth.uid()
    )
  );

create policy "Users can create documents in own workspace"
  on public.documents for insert
  with check (
    workspace_id in (
      select id from public.workspaces where owner_id = auth.uid()
    )
  );

create policy "Users can update documents in own workspace"
  on public.documents for update
  using (
    workspace_id in (
      select id from public.workspaces where owner_id = auth.uid()
    )
  );

create policy "Users can delete documents in own workspace"
  on public.documents for delete
  using (
    workspace_id in (
      select id from public.workspaces where owner_id = auth.uid()
    )
  );

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger documents_updated_at
  before update on public.documents
  for each row execute procedure public.update_updated_at();

-- Tags
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null
);

alter table public.tags enable row level security;

create policy "Users can view tags in own workspace"
  on public.tags for select
  using (
    workspace_id in (
      select id from public.workspaces where owner_id = auth.uid()
    )
  );

create policy "Users can manage tags in own workspace"
  on public.tags for all
  using (
    workspace_id in (
      select id from public.workspaces where owner_id = auth.uid()
    )
  );

-- Document Tags (junction)
create table public.document_tags (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents on delete cascade not null,
  tag_id uuid references public.tags on delete cascade not null,
  unique(document_id, tag_id)
);

alter table public.document_tags enable row level security;

create policy "Users can view document_tags in own workspace"
  on public.document_tags for select
  using (
    document_id in (
      select id from public.documents where workspace_id in (
        select id from public.workspaces where owner_id = auth.uid()
      )
    )
  );

create policy "Users can manage document_tags in own workspace"
  on public.document_tags for all
  using (
    document_id in (
      select id from public.documents where workspace_id in (
        select id from public.workspaces where owner_id = auth.uid()
      )
    )
  );

-- Audit Logs
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  action_type text not null,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz default now() not null
);

alter table public.audit_logs enable row level security;

create policy "Users can view audit_logs in own workspace"
  on public.audit_logs for select
  using (
    document_id in (
      select id from public.documents where workspace_id in (
        select id from public.workspaces where owner_id = auth.uid()
      )
    )
  );

create policy "Users can create audit_logs"
  on public.audit_logs for insert
  with check (auth.uid() = user_id);

-- Indexes for performance
create index idx_documents_workspace_id on public.documents(workspace_id);
create index idx_documents_status on public.documents(status);
create index idx_documents_issue_date on public.documents(issue_date);
create index idx_documents_category_id on public.documents(category_id);
create index idx_documents_supplier_name on public.documents(supplier_name);
create index idx_categories_workspace_id on public.categories(workspace_id);
create index idx_tags_workspace_id on public.tags(workspace_id);
create index idx_audit_logs_document_id on public.audit_logs(document_id);

-- Storage bucket for documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false);

create policy "Users can upload document files"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Users can view own document files"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Users can delete own document files"
  on storage.objects for delete
  using (bucket_id = 'documents' and auth.role() = 'authenticated');
```

- [ ] **Step 2: Create seed data function**

```sql
-- supabase/migrations/002_seed_data.sql
-- This creates a function to seed default categories for a workspace.
-- Called automatically via trigger when workspace is created.

create or replace function public.seed_default_categories()
returns trigger as $$
begin
  insert into public.categories (workspace_id, name, color) values
    (new.id, 'Yakit', '#f97316'),
    (new.id, 'Yemek', '#ef4444'),
    (new.id, 'Ofis', '#3b82f6'),
    (new.id, 'Kargo', '#8b5cf6'),
    (new.id, 'Konaklama', '#06b6d4'),
    (new.id, 'Ulasim', '#10b981'),
    (new.id, 'Diger', '#6b7280');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_workspace_created_seed_categories
  after insert on public.workspaces
  for each row execute procedure public.seed_default_categories();
```

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema with RLS policies and seed data"
```

---

## Task 5: Utility Functions

**Files:**
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create utility functions**

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function getConfidenceColor(score: number): string {
  if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

export function getConfidenceLabel(score: number): string {
  if (score >= 90) return "Yuksek";
  if (score >= 70) return "Orta";
  return "Dusuk";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    uploaded: "Yuklendi",
    processing: "Isleniyor",
    needs_review: "Inceleme Bekliyor",
    verified: "Dogrulandi",
    archived: "Arsivlendi",
    failed: "Basarisiz",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    uploaded: "bg-gray-100 text-gray-700",
    processing: "bg-blue-100 text-blue-700",
    needs_review: "bg-amber-100 text-amber-700",
    verified: "bg-green-100 text-green-700",
    archived: "bg-slate-100 text-slate-700",
    failed: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function getDocumentTypeLabel(type: string | null): string {
  if (!type) return "Bilinmiyor";
  const labels: Record<string, string> = {
    fatura: "Fatura",
    fis: "Fis",
    makbuz: "Makbuz",
    pos_slip: "POS Slip",
    gider_fisi: "Gider Fisi",
  };
  return labels[type] || type;
}
```

Note: `cn` function is likely already created by Shadcn/ui init. If so, add the other functions to the existing file.

- [ ] **Step 2: Commit**

```bash
git add src/lib/utils.ts
git commit -m "feat: add utility functions for formatting and display"
```

---

## Task 6: OCR Adapter Layer

**Files:**
- Create: `src/lib/ocr/types.ts`, `src/lib/ocr/mock-adapter.ts`, `src/lib/ocr/index.ts`

- [ ] **Step 1: Define OCR interfaces**

```typescript
// src/lib/ocr/types.ts

export interface OcrFieldScore {
  supplier_name: number;
  supplier_tax_id: number;
  document_type: number;
  document_number: number;
  issue_date: number;
  issue_time: number;
  subtotal_amount: number;
  vat_amount: number;
  vat_rate: number;
  total_amount: number;
  currency: number;
  payment_method: number;
}

export interface OcrResult {
  supplier_name: string | null;
  supplier_tax_id: string | null;
  document_type: string | null;
  document_number: string | null;
  issue_date: string | null;
  issue_time: string | null;
  subtotal_amount: number | null;
  vat_amount: number | null;
  vat_rate: number | null;
  total_amount: number | null;
  currency: string;
  payment_method: string | null;
  raw_ocr_text: string;
  confidence_score: number;
  field_scores: Partial<OcrFieldScore>;
}

export interface OcrAdapter {
  processDocument(fileUrl: string, fileType: string): Promise<OcrResult>;
}
```

- [ ] **Step 2: Create mock OCR adapter**

```typescript
// src/lib/ocr/mock-adapter.ts
import { OcrAdapter, OcrResult } from "./types";

const MOCK_SUPPLIERS = [
  { name: "Migros Ticaret A.S.", tax_id: "1234567890" },
  { name: "Opet Petrolculuk A.S.", tax_id: "9876543210" },
  { name: "Trendyol Express", tax_id: "5678901234" },
  { name: "Hilton Istanbul Bosphorus", tax_id: "3456789012" },
  { name: "Hepsiburada", tax_id: "7890123456" },
  { name: "Yemeksepeti", tax_id: "2345678901" },
  { name: "BIM Birlesik Magazalar", tax_id: "4567890123" },
  { name: "Shell Turkiye", tax_id: "6789012345" },
  { name: "Starbucks Coffee Turkey", tax_id: "8901234567" },
  { name: "Aras Kargo", tax_id: "0123456789" },
];

const MOCK_DOCUMENT_TYPES = ["fatura", "fis", "makbuz", "pos_slip", "gider_fisi"];

const MOCK_PAYMENT_METHODS = ["nakit", "kredi_karti", "banka_karti"];

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomScore(): number {
  return Math.round(Math.random() * 40 + 60);
}

function randomDate(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString().split("T")[0];
}

function randomTime(): string {
  const hours = String(Math.floor(Math.random() * 14) + 8).padStart(2, "0");
  const minutes = String(Math.floor(Math.random() * 60)).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export class MockOcrAdapter implements OcrAdapter {
  async processDocument(_fileUrl: string, _fileType: string): Promise<OcrResult> {
    // Simulate processing delay (300-800ms)
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 500 + 300)
    );

    const supplier =
      MOCK_SUPPLIERS[Math.floor(Math.random() * MOCK_SUPPLIERS.length)];
    const docType =
      MOCK_DOCUMENT_TYPES[Math.floor(Math.random() * MOCK_DOCUMENT_TYPES.length)];
    const payment =
      MOCK_PAYMENT_METHODS[Math.floor(Math.random() * MOCK_PAYMENT_METHODS.length)];
    const subtotal = randomBetween(10, 2000);
    const vatRate = [1, 8, 10, 18, 20][Math.floor(Math.random() * 5)];
    const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;
    const docNumber = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(
      Math.floor(Math.random() * 999999)
    ).padStart(6, "0")}`;

    const fieldScores = {
      supplier_name: randomScore(),
      supplier_tax_id: randomScore(),
      document_type: randomScore(),
      document_number: randomScore(),
      issue_date: randomScore(),
      issue_time: randomScore(),
      subtotal_amount: randomScore(),
      vat_amount: randomScore(),
      vat_rate: randomScore(),
      total_amount: randomScore(),
      currency: 99,
      payment_method: randomScore(),
    };

    const overallScore =
      Math.round(
        Object.values(fieldScores).reduce((a, b) => a + b, 0) /
          Object.values(fieldScores).length
      );

    const rawText = [
      supplier.name,
      `Vergi No: ${supplier.tax_id}`,
      `Tarih: ${randomDate()}`,
      `Belge No: ${docNumber}`,
      `Ara Toplam: ${subtotal.toFixed(2)} TL`,
      `KDV (%${vatRate}): ${vatAmount.toFixed(2)} TL`,
      `TOPLAM: ${total.toFixed(2)} TL`,
      `Odeme: ${payment}`,
    ].join("\n");

    return {
      supplier_name: supplier.name,
      supplier_tax_id: supplier.tax_id,
      document_type: docType,
      document_number: docNumber,
      issue_date: randomDate(),
      issue_time: randomTime(),
      subtotal_amount: subtotal,
      vat_amount: vatAmount,
      vat_rate: vatRate,
      total_amount: total,
      currency: "TRY",
      payment_method: payment,
      raw_ocr_text: rawText,
      confidence_score: overallScore,
      field_scores: fieldScores,
    };
  }
}
```

- [ ] **Step 3: Create adapter factory**

```typescript
// src/lib/ocr/index.ts
import { OcrAdapter } from "./types";
import { MockOcrAdapter } from "./mock-adapter";

export function getOcrAdapter(): OcrAdapter {
  const adapterType = process.env.OCR_ADAPTER || "mock";

  switch (adapterType) {
    case "mock":
      return new MockOcrAdapter();
    // Future adapters:
    // case "google_vision":
    //   return new GoogleVisionAdapter();
    // case "aws_textract":
    //   return new AwsTextractAdapter();
    default:
      return new MockOcrAdapter();
  }
}

export type { OcrAdapter, OcrResult } from "./types";
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/ocr/
git commit -m "feat: add OCR adapter layer with mock implementation"
```

---

## Task 7: Server Actions — Auth

**Files:**
- Create: `src/lib/actions/auth.ts`

- [ ] **Step 1: Create auth server actions**

```typescript
// src/lib/actions/auth.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/panel");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/panel");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/giris");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserWorkspace() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  return workspace;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/auth.ts
git commit -m "feat: add auth server actions (signup, signin, signout)"
```

---

## Task 8: Server Actions — Documents & Upload

**Files:**
- Create: `src/lib/actions/documents.ts`, `src/lib/actions/upload.ts`, `src/lib/actions/categories.ts`, `src/lib/actions/workspace.ts`

- [ ] **Step 1: Create document server actions**

```typescript
// src/lib/actions/documents.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";
import type { DocumentFilters, Document } from "@/types";

export async function getDocuments(filters?: DocumentFilters) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) return [];

  let query = supabase
    .from("documents")
    .select("*, category:categories(*)")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `supplier_name.ilike.%${filters.search}%,document_number.ilike.%${filters.search}%,raw_ocr_text.ilike.%${filters.search}%`
    );
  }
  if (filters?.category_id) {
    query = query.eq("category_id", filters.category_id);
  }
  if (filters?.document_type) {
    query = query.eq("document_type", filters.document_type);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.date_from) {
    query = query.gte("issue_date", filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte("issue_date", filters.date_to);
  }
  if (filters?.amount_min) {
    query = query.gte("total_amount", filters.amount_min);
  }
  if (filters?.amount_max) {
    query = query.lte("total_amount", filters.amount_max);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as Document[];
}

export async function getDocument(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Document;
}

export async function updateDocument(id: string, updates: Partial<Document>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum acilmamis");

  // Get old values for audit log
  const { data: oldDoc } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select("*, category:categories(*)")
    .single();

  if (error) throw new Error(error.message);

  // Create audit log
  await supabase.from("audit_logs").insert({
    document_id: id,
    user_id: user.id,
    action_type: "updated",
    old_value: oldDoc,
    new_value: data,
  });

  return data as Document;
}

export async function verifyDocument(id: string) {
  return updateDocument(id, { status: "verified" });
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum acilmamis");

  // Log deletion
  await supabase.from("audit_logs").insert({
    document_id: id,
    user_id: user.id,
    action_type: "deleted",
    old_value: null,
    new_value: null,
  });

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getDocumentAuditLogs(documentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) {
    return {
      documents_this_month: 0,
      total_expense_this_month: 0,
      pending_review_count: 0,
      category_distribution: [],
      recent_documents: [],
    };
  }

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  // Documents this month
  const { count: docsThisMonth } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id)
    .gte("created_at", firstOfMonth);

  // Total expense this month
  const { data: expenseData } = await supabase
    .from("documents")
    .select("total_amount")
    .eq("workspace_id", workspace.id)
    .gte("created_at", firstOfMonth)
    .not("total_amount", "is", null);

  const totalExpense =
    expenseData?.reduce((sum, d) => sum + (d.total_amount || 0), 0) || 0;

  // Pending review count
  const { count: pendingCount } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id)
    .eq("status", "needs_review");

  // Category distribution
  const { data: catData } = await supabase
    .from("documents")
    .select("category_id, total_amount, category:categories(name, color)")
    .eq("workspace_id", workspace.id)
    .not("category_id", "is", null)
    .not("total_amount", "is", null);

  const categoryMap = new Map<
    string,
    { name: string; color: string; total: number }
  >();
  catData?.forEach((d) => {
    const cat = d.category as unknown as { name: string; color: string } | null;
    if (cat && d.category_id) {
      const existing = categoryMap.get(d.category_id);
      if (existing) {
        existing.total += d.total_amount || 0;
      } else {
        categoryMap.set(d.category_id, {
          name: cat.name,
          color: cat.color,
          total: d.total_amount || 0,
        });
      }
    }
  });

  // Recent documents
  const { data: recentDocs } = await supabase
    .from("documents")
    .select("*, category:categories(*)")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    documents_this_month: docsThisMonth || 0,
    total_expense_this_month: totalExpense,
    pending_review_count: pendingCount || 0,
    category_distribution: Array.from(categoryMap.values()),
    recent_documents: (recentDocs || []) as Document[],
  };
}
```

- [ ] **Step 2: Create upload server action**

```typescript
// src/lib/actions/upload.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { getOcrAdapter } from "@/lib/ocr";
import { getUserWorkspace, getUser } from "./auth";

export async function uploadAndProcessDocument(formData: FormData) {
  const supabase = await createClient();
  const user = await getUser();
  const workspace = await getUserWorkspace();

  if (!user || !workspace) {
    throw new Error("Oturum acilmamis");
  }

  const file = formData.get("file") as File;
  if (!file) throw new Error("Dosya bulunamadi");

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
  const filePath = `${workspace.id}/${crypto.randomUUID()}.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file);

  if (uploadError) throw new Error(`Yukleme hatasi: ${uploadError.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from("documents").getPublicUrl(filePath);

  // Create document record as 'processing'
  const { data: doc, error: insertError } = await supabase
    .from("documents")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      original_file_url: publicUrl,
      file_type: fileExt,
      status: "processing",
    })
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);

  // Run OCR
  try {
    const ocr = getOcrAdapter();
    const result = await ocr.processDocument(publicUrl, fileExt);

    // Update document with OCR results
    const { data: updatedDoc, error: updateError } = await supabase
      .from("documents")
      .update({
        document_type: result.document_type,
        supplier_name: result.supplier_name,
        supplier_tax_id: result.supplier_tax_id,
        document_number: result.document_number,
        issue_date: result.issue_date,
        issue_time: result.issue_time,
        subtotal_amount: result.subtotal_amount,
        vat_amount: result.vat_amount,
        vat_rate: result.vat_rate,
        total_amount: result.total_amount,
        currency: result.currency,
        payment_method: result.payment_method,
        raw_ocr_text: result.raw_ocr_text,
        confidence_score: result.confidence_score,
        field_scores: result.field_scores,
        parsed_json: result as unknown as Record<string, unknown>,
        status: "needs_review",
      })
      .eq("id", doc.id)
      .select("*, category:categories(*)")
      .single();

    if (updateError) throw new Error(updateError.message);

    // Audit log
    await supabase.from("audit_logs").insert({
      document_id: doc.id,
      user_id: user.id,
      action_type: "created",
      new_value: updatedDoc,
    });

    return updatedDoc;
  } catch (ocrError) {
    // Mark as failed
    await supabase
      .from("documents")
      .update({ status: "failed" })
      .eq("id", doc.id);

    throw ocrError;
  }
}
```

- [ ] **Step 3: Create category server actions**

```typescript
// src/lib/actions/categories.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";
import type { Category } from "@/types";

export async function getCategories() {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("name");

  if (error) throw new Error(error.message);
  return (data || []) as Category[];
}

export async function createCategory(name: string, color: string) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Calisma alani bulunamadi");

  const { data, error } = await supabase
    .from("categories")
    .insert({ workspace_id: workspace.id, name, color })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
}

export async function updateCategory(id: string, name: string, color: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .update({ name, color })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
```

- [ ] **Step 4: Create workspace server actions**

```typescript
// src/lib/actions/workspace.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";

export async function updateWorkspace(name: string, defaultCurrency: string) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Calisma alani bulunamadi");

  const { data, error } = await supabase
    .from("workspaces")
    .update({ name, default_currency: defaultCurrency })
    .eq("id", workspace.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/
git commit -m "feat: add server actions for documents, upload, categories, and workspace"
```

---

## Task 9: Export Functions

**Files:**
- Create: `src/lib/export/csv.ts`, `src/lib/export/excel.ts`

- [ ] **Step 1: Create CSV export**

```typescript
// src/lib/export/csv.ts
import type { Document } from "@/types";
import { getDocumentTypeLabel, getStatusLabel } from "@/lib/utils";

export function generateCsv(documents: Document[]): string {
  const headers = [
    "Tarih",
    "Firma",
    "Belge Turu",
    "Belge No",
    "Kategori",
    "Ara Toplam",
    "KDV",
    "KDV Orani",
    "Toplam Tutar",
    "Para Birimi",
    "Odeme Yontemi",
    "Durum",
    "Guven Skoru",
  ];

  const rows = documents.map((doc) => [
    doc.issue_date || "",
    doc.supplier_name || "",
    getDocumentTypeLabel(doc.document_type),
    doc.document_number || "",
    doc.category?.name || "",
    doc.subtotal_amount?.toString() || "",
    doc.vat_amount?.toString() || "",
    doc.vat_rate ? `%${doc.vat_rate}` : "",
    doc.total_amount?.toString() || "",
    doc.currency,
    doc.payment_method || "",
    getStatusLabel(doc.status),
    doc.confidence_score ? `%${doc.confidence_score}` : "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return "\uFEFF" + csvContent; // BOM for Turkish character support in Excel
}

export function downloadCsv(documents: Document[], filename: string = "belgeler.csv") {
  const csv = generateCsv(documents);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Create Excel export**

```typescript
// src/lib/export/excel.ts
import * as XLSX from "xlsx";
import type { Document } from "@/types";
import { getDocumentTypeLabel, getStatusLabel } from "@/lib/utils";

export function downloadExcel(
  documents: Document[],
  filename: string = "belgeler.xlsx"
) {
  const data = documents.map((doc) => ({
    Tarih: doc.issue_date || "",
    Firma: doc.supplier_name || "",
    "Belge Turu": getDocumentTypeLabel(doc.document_type),
    "Belge No": doc.document_number || "",
    Kategori: doc.category?.name || "",
    "Ara Toplam": doc.subtotal_amount || "",
    KDV: doc.vat_amount || "",
    "KDV Orani": doc.vat_rate ? `%${doc.vat_rate}` : "",
    "Toplam Tutar": doc.total_amount || "",
    "Para Birimi": doc.currency,
    "Odeme Yontemi": doc.payment_method || "",
    Durum: getStatusLabel(doc.status),
    "Guven Skoru": doc.confidence_score ? `%${doc.confidence_score}` : "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Belgeler");

  // Auto-width columns
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...data.map((row) => String(row[key as keyof typeof row]).length)
    ),
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, filename);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/export/
git commit -m "feat: add CSV and Excel export functions"
```

---

## Task 10: Layout Components

**Files:**
- Create: `src/components/layout/logo.tsx`, `src/components/layout/sidebar.tsx`, `src/components/layout/header.tsx`

- [ ] **Step 1: Create Logo component**

```tsx
// src/components/layout/logo.tsx
import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/otomakbuz logo.png"
        alt="Otomakbuz"
        width={size}
        height={size}
        className="rounded"
      />
      <span className="font-semibold text-lg">Otomakbuz</span>
    </Link>
  );
}
```

- [ ] **Step 2: Create Sidebar component**

```tsx
// src/components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const navItems = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/yukle", label: "Yukle", icon: Upload },
  { href: "/belgeler", label: "Belgeler", icon: FileText },
  { href: "/raporlar", label: "Raporlar", icon: BarChart3 },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-white">
      <div className="p-6">
        <Logo />
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Create Header component**

```tsx
// src/components/layout/header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  Upload,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const navItems = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/yukle", label: "Yukle", icon: Upload },
  { href: "/belgeler", label: "Belgeler", icon: FileText },
  { href: "/raporlar", label: "Raporlar", icon: BarChart3 },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6">
              <Logo />
            </div>
            <nav className="px-3 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="md:hidden">
          <Logo size={24} />
        </div>

        {/* Desktop right side */}
        <div className="flex items-center gap-2 ml-auto">
          <form action={signOut}>
            <Button variant="ghost" size="sm" className="text-slate-600">
              <LogOut className="h-4 w-4 mr-2" />
              Cikis
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add layout components (Logo, Sidebar, Header)"
```

---

## Task 11: Shared UI Components

**Files:**
- Create: `src/components/documents/confidence-badge.tsx`, `src/components/documents/status-badge.tsx`

- [ ] **Step 1: Create ConfidenceBadge**

```tsx
// src/components/documents/confidence-badge.tsx
import { cn, getConfidenceColor } from "@/lib/utils";

interface ConfidenceBadgeProps {
  score: number | null;
  showLabel?: boolean;
}

export function ConfidenceBadge({ score, showLabel = false }: ConfidenceBadgeProps) {
  if (score === null) return <span className="text-slate-400 text-sm">-</span>;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        getConfidenceColor(score)
      )}
    >
      %{Math.round(score)}
      {showLabel && (
        <span className="hidden sm:inline">
          {score >= 90 ? " Yuksek" : score >= 70 ? " Orta" : " Dusuk"}
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 2: Create StatusBadge**

```tsx
// src/components/documents/status-badge.tsx
import { cn, getStatusLabel, getStatusColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        getStatusColor(status)
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/documents/confidence-badge.tsx src/components/documents/status-badge.tsx
git commit -m "feat: add ConfidenceBadge and StatusBadge components"
```

---

## Task 12: Root Layout & Auth Pages

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/globals.css`
- Create: `src/app/(auth)/layout.tsx`, `src/app/(auth)/giris/page.tsx`, `src/app/(auth)/kayit/page.tsx`, `src/components/auth/login-form.tsx`, `src/components/auth/register-form.tsx`

- [ ] **Step 1: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Otomakbuz - Akilli Evrak Isleme Platformu",
  description:
    "Makbuz, fis ve faturalarinizi yukleyin, sistem otomatik okusun, duzenlesin ve arsivlesin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create auth layout**

```tsx
// src/app/(auth)/layout.tsx
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="mb-8">
        <Logo size={40} />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Create LoginForm component**

```tsx
// src/components/auth/login-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/lib/actions/auth";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Giris Yap</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ornek@sirket.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Sifre</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Giris yapiliyor..." : "Giris Yap"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-slate-600">
          Hesabiniz yok mu?{" "}
          <Link href="/kayit" className="text-blue-600 hover:underline">
            Kayit Ol
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 4: Create RegisterForm component**

```tsx
// src/components/auth/register-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp } from "@/lib/actions/auth";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Kayit Ol</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="full_name">Ad Soyad</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="Ahmet Yilmaz"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ornek@sirket.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Sifre</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="En az 6 karakter"
              minLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Kayit yapiliyor..." : "Kayit Ol"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-slate-600">
          Zaten hesabiniz var mi?{" "}
          <Link href="/giris" className="text-blue-600 hover:underline">
            Giris Yap
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 5: Create auth pages**

```tsx
// src/app/(auth)/giris/page.tsx
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return <LoginForm />;
}
```

```tsx
// src/app/(auth)/kayit/page.tsx
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return <RegisterForm />;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css src/app/\(auth\)/ src/components/auth/
git commit -m "feat: add root layout, auth layout, login and register pages"
```

---

## Task 13: Dashboard Layout

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create dashboard layout**

```tsx
// src/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/giris");

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/layout.tsx
git commit -m "feat: add dashboard layout with sidebar and header"
```

---

## Task 14: Landing Page

**Files:**
- Create: `src/app/(landing)/page.tsx`, `src/components/landing/hero.tsx`, `src/components/landing/features.tsx`, `src/components/landing/how-it-works.tsx`

- [ ] **Step 1: Create Hero component**

```tsx
// src/components/landing/hero.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, BarChart3 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="max-w-5xl mx-auto px-4 py-24 sm:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
          Makbuz ve faturalari yukleyin,{" "}
          <span className="text-blue-600">gerisini Otomakbuz halletsin.</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Makbuz, fis ve faturalarinizi saniyeler icinde okuyup duzenlemenizi
          saglayan akilli evrak isleme platformu.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/kayit">
            <Button size="lg" className="text-base px-8">
              Ucretsiz Dene
            </Button>
          </Link>
          <Link href="#nasil-calisir">
            <Button variant="outline" size="lg" className="text-base px-8">
              Nasil Calisir?
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mt-16 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Hizli Yukleme</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Otomatik Tanima</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Detayli Raporlama</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create HowItWorks component**

```tsx
// src/components/landing/how-it-works.tsx
import { Upload, Scan, FolderCheck } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "1. Yukleyin",
    description:
      "Makbuz, fis veya faturayi surukleyip birakin ya da dosya secin. Tekli veya toplu yukleme yapabilirsiniz.",
  },
  {
    icon: Scan,
    title: "2. Otomatik Taransin",
    description:
      "Sistem belgeyi aninda okur, firma adi, tarih, tutar, KDV gibi onemli alanlari otomatik cikarir.",
  },
  {
    icon: FolderCheck,
    title: "3. Yonetin",
    description:
      "Dogrulayin, kategorize edin, arsivleyin. Istediginiz zaman filtreleyin ve disa aktarin.",
  },
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="bg-slate-50 py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
          Nasil Calisir?
        </h2>
        <p className="text-center text-slate-600 mb-12 max-w-xl mx-auto">
          Uc basit adimda belgelerinizi dijitallestirin ve duzenleyin.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-xl p-8 text-center shadow-sm border"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl mb-5">
                <step.icon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {step.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create Features component**

```tsx
// src/components/landing/features.tsx
import {
  FileText,
  Search,
  Download,
  Shield,
  Zap,
  Tags,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Anlik OCR",
    description: "Belgeleriniz yuklendiginde aninda taranir ve veriler cikarilir.",
  },
  {
    icon: Shield,
    title: "Guven Skoru",
    description:
      "Her alan icin guven skoru gosterilir. Dusuk skorlu alanlar vurgulanir.",
  },
  {
    icon: Tags,
    title: "Kategori ve Etiket",
    description:
      "Belgelerinizi kategorilere ayirin, etiketlerle isaretin.",
  },
  {
    icon: Search,
    title: "Guclu Arama",
    description:
      "Firma, tarih, tutar, kategori veya OCR icerigi ile hizlica arayip bulun.",
  },
  {
    icon: FileText,
    title: "Toplu Yukleme",
    description:
      "Birden fazla belgeyi ayni anda yukleyin, paralel olarak taratin.",
  },
  {
    icon: Download,
    title: "Disa Aktarma",
    description: "Belgelerinizi CSV veya Excel formatinda disa aktarin.",
  },
];

export function Features() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
          Ozellikler
        </h2>
        <p className="text-center text-slate-600 mb-12 max-w-xl mx-auto">
          Evrak isleme surecini bastan sona kolaylastiran araclar.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border hover:shadow-sm transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg mb-4">
                <feature.icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create Landing page**

```tsx
// src/app/(landing)/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/giris">
              <Button variant="ghost" size="sm">
                Giris Yap
              </Button>
            </Link>
            <Link href="/kayit">
              <Button size="sm">Ucretsiz Dene</Button>
            </Link>
          </div>
        </div>
      </nav>

      <Hero />
      <HowItWorks />
      <Features />

      {/* CTA */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Evrak islemede yeni doneme gecin
          </h2>
          <p className="text-slate-400 mb-8">
            Hemen kayit olun, belgelerinizi yuklemeye baslayin.
          </p>
          <Link href="/kayit">
            <Button size="lg" className="text-base px-8">
              Ucretsiz Dene
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Otomakbuz. Tum haklari saklidir.
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(landing\)/ src/components/landing/
git commit -m "feat: add landing page with hero, features, and how-it-works sections"
```

---

## Task 15: Upload Page (Instant OCR Flow)

**Files:**
- Create: `src/components/upload/drop-zone.tsx`, `src/components/upload/upload-progress.tsx`, `src/components/upload/review-form.tsx`, `src/hooks/use-upload.ts`, `src/app/(dashboard)/yukle/page.tsx`

- [ ] **Step 1: Create upload hook**

```tsx
// src/hooks/use-upload.ts
"use client";

import { useState, useCallback } from "react";
import { uploadAndProcessDocument } from "@/lib/actions/upload";
import type { Document } from "@/types";

export type UploadItem = {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  result?: Document;
  error?: string;
};

export function useUpload() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  const addFiles = useCallback((files: File[]) => {
    const newItems: UploadItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "pending",
    }));
    setItems((prev) => [...prev, ...newItems]);

    // Start uploading all in parallel
    newItems.forEach((item) => {
      processItem(item.id, item.file);
    });
  }, []);

  async function processItem(itemId: string, file: File) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: "uploading" } : i))
    );

    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadAndProcessDocument(formData);

      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, status: "done", result } : i
        )
      );

      // Auto-open review for first completed item if none is active
      setActiveReviewId((current) => current ?? itemId);
    } catch (err) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                status: "error",
                error: err instanceof Error ? err.message : "Bilinmeyen hata",
              }
            : i
        )
      );
    }
  }

  const clearCompleted = useCallback(() => {
    setItems((prev) => prev.filter((i) => i.status !== "done"));
    setActiveReviewId(null);
  }, []);

  const removeItem = useCallback(
    (itemId: string) => {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      if (activeReviewId === itemId) setActiveReviewId(null);
    },
    [activeReviewId]
  );

  return {
    items,
    activeReviewId,
    setActiveReviewId,
    addFiles,
    clearCompleted,
    removeItem,
  };
}
```

- [ ] **Step 2: Create DropZone component**

```tsx
// src/components/upload/drop-zone.tsx
"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFiles, disabled }: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const valid = Array.from(fileList).filter((f) => {
        if (!ACCEPTED_TYPES.includes(f.type)) return false;
        if (f.size > MAX_SIZE) return false;
        return true;
      });
      if (valid.length > 0) onFiles(valid);
    },
    [onFiles]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      onClick={() => {
        if (disabled) return;
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = ACCEPTED_TYPES.join(",");
        input.onchange = () => {
          if (input.files) handleFiles(input.files);
        };
        input.click();
      }}
      className={cn(
        "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
        dragActive
          ? "border-blue-400 bg-blue-50"
          : "border-slate-300 hover:border-slate-400 bg-white",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Upload className="h-10 w-10 text-slate-400 mx-auto mb-4" />
      <p className="font-medium text-slate-700 mb-1">
        Dosyalari surukleyin veya tiklayin
      </p>
      <p className="text-sm text-slate-500">
        JPG, PNG, PDF, WEBP &bull; Maks 10MB
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create UploadProgress component**

```tsx
// src/components/upload/upload-progress.tsx
"use client";

import { CheckCircle, Loader2, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadItem } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
  items: UploadItem[];
  activeReviewId: string | null;
  onSelect: (id: string) => void;
}

export function UploadProgress({
  items,
  activeReviewId,
  onSelect,
}: UploadProgressProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-slate-700">
        {items.length} belge yuklendi
      </h3>
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border text-sm",
            activeReviewId === item.id
              ? "border-blue-300 bg-blue-50"
              : "bg-white"
          )}
        >
          {item.status === "uploading" && (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
          )}
          {item.status === "done" && (
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          )}
          {item.status === "error" && (
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          )}
          {item.status === "pending" && (
            <div className="h-4 w-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
          )}

          <span className="flex-1 truncate">{item.file.name}</span>

          {item.status === "uploading" && (
            <span className="text-xs text-blue-600">Taraniyor...</span>
          )}
          {item.status === "error" && (
            <span className="text-xs text-red-600">{item.error}</span>
          )}
          {item.status === "done" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(item.id)}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Incele
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create ReviewForm component**

```tsx
// src/components/upload/review-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfidenceBadge } from "@/components/documents/confidence-badge";
import { updateDocument, verifyDocument } from "@/lib/actions/documents";
import { formatCurrency, getConfidenceColor } from "@/lib/utils";
import { toast } from "sonner";
import type { Document, Category } from "@/types";
import { cn } from "@/lib/utils";
import { Save, CheckCircle, RefreshCw } from "lucide-react";

interface ReviewFormProps {
  document: Document;
  categories: Category[];
  onSaved?: () => void;
}

export function ReviewForm({ document: doc, categories, onSaved }: ReviewFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const fieldScores = (doc.field_scores || {}) as Record<string, number>;

  function FieldRow({
    label,
    field,
    children,
  }: {
    label: string;
    field: string;
    children: React.ReactNode;
  }) {
    const score = fieldScores[field];
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-2.5 rounded-lg border",
          score !== undefined ? getConfidenceColor(score) : "border-slate-200"
        )}
      >
        <div className="flex-1 space-y-1">
          <Label className="text-xs text-slate-500">{label}</Label>
          {children}
        </div>
        {score !== undefined && <ConfidenceBadge score={score} />}
      </div>
    );
  }

  async function handleSave(formData: FormData) {
    setSaving(true);
    try {
      await updateDocument(doc.id, {
        supplier_name: formData.get("supplier_name") as string,
        document_number: formData.get("document_number") as string,
        issue_date: formData.get("issue_date") as string,
        total_amount: parseFloat(formData.get("total_amount") as string) || null,
        vat_amount: parseFloat(formData.get("vat_amount") as string) || null,
        vat_rate: parseFloat(formData.get("vat_rate") as string) || null,
        subtotal_amount:
          parseFloat(formData.get("subtotal_amount") as string) || null,
        category_id: (formData.get("category_id") as string) || null,
        notes: (formData.get("notes") as string) || null,
        document_type: (formData.get("document_type") as string) || null,
        payment_method: (formData.get("payment_method") as string) || null,
      });
      toast.success("Belge kaydedildi");
      router.refresh();
      onSaved?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Kaydetme hatasi"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleVerify() {
    setSaving(true);
    try {
      await verifyDocument(doc.id);
      toast.success("Belge dogrulandi");
      router.refresh();
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Dogrulama hatasi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form action={handleSave} className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-900">Belge Bilgileri</h3>
        <ConfidenceBadge score={doc.confidence_score} showLabel />
      </div>

      <FieldRow label="Firma Adi" field="supplier_name">
        <Input
          name="supplier_name"
          defaultValue={doc.supplier_name || ""}
          className="h-8 text-sm"
        />
      </FieldRow>

      <FieldRow label="Belge Turu" field="document_type">
        <Select name="document_type" defaultValue={doc.document_type || ""}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Sec..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fatura">Fatura</SelectItem>
            <SelectItem value="fis">Fis</SelectItem>
            <SelectItem value="makbuz">Makbuz</SelectItem>
            <SelectItem value="pos_slip">POS Slip</SelectItem>
            <SelectItem value="gider_fisi">Gider Fisi</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow label="Tarih" field="issue_date">
        <Input
          name="issue_date"
          type="date"
          defaultValue={doc.issue_date || ""}
          className="h-8 text-sm"
        />
      </FieldRow>

      <FieldRow label="Belge No" field="document_number">
        <Input
          name="document_number"
          defaultValue={doc.document_number || ""}
          className="h-8 text-sm"
        />
      </FieldRow>

      <FieldRow label="Ara Toplam" field="subtotal_amount">
        <Input
          name="subtotal_amount"
          type="number"
          step="0.01"
          defaultValue={doc.subtotal_amount?.toString() || ""}
          className="h-8 text-sm"
        />
      </FieldRow>

      <FieldRow label="KDV Tutari" field="vat_amount">
        <Input
          name="vat_amount"
          type="number"
          step="0.01"
          defaultValue={doc.vat_amount?.toString() || ""}
          className="h-8 text-sm"
        />
      </FieldRow>

      <FieldRow label="KDV Orani (%)" field="vat_rate">
        <Input
          name="vat_rate"
          type="number"
          step="0.01"
          defaultValue={doc.vat_rate?.toString() || ""}
          className="h-8 text-sm"
        />
      </FieldRow>

      <FieldRow label="Toplam Tutar" field="total_amount">
        <Input
          name="total_amount"
          type="number"
          step="0.01"
          defaultValue={doc.total_amount?.toString() || ""}
          className="h-8 text-sm"
        />
      </FieldRow>

      <FieldRow label="Odeme Yontemi" field="payment_method">
        <Select name="payment_method" defaultValue={doc.payment_method || ""}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Sec..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nakit">Nakit</SelectItem>
            <SelectItem value="kredi_karti">Kredi Karti</SelectItem>
            <SelectItem value="banka_karti">Banka Karti</SelectItem>
            <SelectItem value="havale">Havale</SelectItem>
            <SelectItem value="diger">Diger</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      <div className="space-y-1">
        <Label className="text-xs text-slate-500">Kategori</Label>
        <Select name="category_id" defaultValue={doc.category_id || ""}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Kategori sec..." />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-slate-500">Not</Label>
        <Textarea
          name="notes"
          defaultValue={doc.notes || ""}
          rows={2}
          className="text-sm"
          placeholder="Opsiyonel not ekleyin..."
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          Kaydet
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleVerify}
          disabled={saving}
          className="flex-1"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Dogrula
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 5: Create Upload page**

```tsx
// src/app/(dashboard)/yukle/page.tsx
"use client";

import { useEffect, useState } from "react";
import { DropZone } from "@/components/upload/drop-zone";
import { UploadProgress } from "@/components/upload/upload-progress";
import { ReviewForm } from "@/components/upload/review-form";
import { useUpload } from "@/hooks/use-upload";
import { getCategories } from "@/lib/actions/categories";
import type { Category } from "@/types";

export default function UploadPage() {
  const { items, activeReviewId, setActiveReviewId, addFiles } = useUpload();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const activeItem = items.find((i) => i.id === activeReviewId);
  const activeDoc = activeItem?.result;
  const hasItems = items.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Belge Yukle</h1>
        <p className="text-slate-600 text-sm mt-1">
          Makbuz, fis veya fatura yukleyin. Sistem otomatik tarayacak.
        </p>
      </div>

      <DropZone onFiles={addFiles} disabled={false} />

      {hasItems && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Upload list */}
          <UploadProgress
            items={items}
            activeReviewId={activeReviewId}
            onSelect={setActiveReviewId}
          />

          {/* Right: Review form */}
          {activeDoc && (
            <div className="bg-white rounded-xl border p-4">
              <ReviewForm
                document={activeDoc}
                categories={categories}
                onSaved={() => {
                  // Move to next unreviewed item
                  const next = items.find(
                    (i) =>
                      i.id !== activeReviewId &&
                      i.status === "done" &&
                      i.result?.status === "needs_review"
                  );
                  setActiveReviewId(next?.id || null);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/upload/ src/hooks/use-upload.ts src/app/\(dashboard\)/yukle/
git commit -m "feat: add upload page with instant OCR, drop zone, and review form"
```

---

## Task 16: Documents List Page

**Files:**
- Create: `src/components/documents/columns.tsx`, `src/components/documents/documents-table.tsx`, `src/components/documents/document-filters.tsx`, `src/app/(dashboard)/belgeler/page.tsx`

- [ ] **Step 1: Create table columns**

```tsx
// src/components/documents/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { Document } from "@/types";
import { StatusBadge } from "./status-badge";
import { ConfidenceBadge } from "./confidence-badge";
import {
  formatCurrency,
  formatDate,
  getDocumentTypeLabel,
} from "@/lib/utils";

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: "issue_date",
    header: "Tarih",
    cell: ({ row }) => {
      const date = row.getValue("issue_date") as string | null;
      return date ? formatDate(date) : "-";
    },
  },
  {
    accessorKey: "supplier_name",
    header: "Firma",
    cell: ({ row }) => (
      <Link
        href={`/belge/${row.original.id}`}
        className="font-medium text-blue-600 hover:underline"
      >
        {row.getValue("supplier_name") || "Bilinmiyor"}
      </Link>
    ),
  },
  {
    accessorKey: "document_type",
    header: "Belge Turu",
    cell: ({ row }) =>
      getDocumentTypeLabel(row.getValue("document_type")),
  },
  {
    accessorKey: "category",
    header: "Kategori",
    cell: ({ row }) => {
      const cat = row.original.category;
      if (!cat) return "-";
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: cat.color }}
          />
          <span>{cat.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: "Toplam",
    cell: ({ row }) => {
      const amount = row.getValue("total_amount") as number | null;
      return amount !== null
        ? formatCurrency(amount, row.original.currency)
        : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "confidence_score",
    header: "Guven",
    cell: ({ row }) => (
      <ConfidenceBadge
        score={row.getValue("confidence_score") as number | null}
      />
    ),
  },
];
```

- [ ] **Step 2: Create DocumentsTable component**

```tsx
// src/components/documents/documents-table.tsx
"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import type { Document } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DocumentsTableProps {
  data: Document[];
}

export function DocumentsTable({ data }: DocumentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div>
      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-slate-500"
                >
                  Henuz belge yok. Yukle sayfasindan belge ekleyin.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-slate-500">
          {data.length} belgeden{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}
          -
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            data.length
          )}{" "}
          arasi gosteriliyor
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create DocumentFilters component**

```tsx
// src/components/documents/document-filters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { Category } from "@/types";

interface DocumentFiltersProps {
  categories: Category[];
}

export function DocumentFilters({ categories }: DocumentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/belgeler?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/belgeler");
  }

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Firma, belge no veya icerik ara..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        defaultValue={searchParams.get("status") || "all"}
        onValueChange={(v) => updateFilter("status", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Durum" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tum Durumlar</SelectItem>
          <SelectItem value="needs_review">Inceleme Bekliyor</SelectItem>
          <SelectItem value="verified">Dogrulandi</SelectItem>
          <SelectItem value="archived">Arsivlendi</SelectItem>
          <SelectItem value="failed">Basarisiz</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("category_id") || "all"}
        onValueChange={(v) => updateFilter("category_id", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tum Kategoriler</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("document_type") || "all"}
        onValueChange={(v) => updateFilter("document_type", v)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Belge Turu" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tum Turler</SelectItem>
          <SelectItem value="fatura">Fatura</SelectItem>
          <SelectItem value="fis">Fis</SelectItem>
          <SelectItem value="makbuz">Makbuz</SelectItem>
          <SelectItem value="pos_slip">POS Slip</SelectItem>
          <SelectItem value="gider_fisi">Gider Fisi</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Temizle
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create Belgeler page**

```tsx
// src/app/(dashboard)/belgeler/page.tsx
import { Suspense } from "react";
import { getDocuments } from "@/lib/actions/documents";
import { getCategories } from "@/lib/actions/categories";
import { DocumentsTable } from "@/components/documents/documents-table";
import { DocumentFilters } from "@/components/documents/document-filters";
import type { DocumentFilters as Filters } from "@/types";

export default async function BelgelerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const filters: Filters = {
    search: params.search,
    status: params.status as Filters["status"],
    category_id: params.category_id,
    document_type: params.document_type as Filters["document_type"],
    date_from: params.date_from,
    date_to: params.date_to,
  };

  const [documents, categories] = await Promise.all([
    getDocuments(filters),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Belgeler</h1>
        <p className="text-slate-600 text-sm mt-1">
          Tum belgelerinizi goruntuleyin, filtreleyin ve yonetin.
        </p>
      </div>

      <Suspense fallback={null}>
        <DocumentFilters categories={categories} />
      </Suspense>

      <DocumentsTable data={documents} />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/documents/ src/app/\(dashboard\)/belgeler/
git commit -m "feat: add documents list page with data table, filters, and pagination"
```

---

## Task 17: Document Detail Page

**Files:**
- Create: `src/components/documents/document-detail.tsx`, `src/app/(dashboard)/belge/[id]/page.tsx`

- [ ] **Step 1: Create DocumentDetail component**

```tsx
// src/components/documents/document-detail.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/upload/review-form";
import { StatusBadge } from "./status-badge";
import { deleteDocument } from "@/lib/actions/documents";
import { toast } from "sonner";
import { Trash2, ArrowLeft, FileText } from "lucide-react";
import type { Document, Category, AuditLog } from "@/types";
import { formatDate } from "@/lib/utils";

interface DocumentDetailProps {
  document: Document;
  categories: Category[];
  auditLogs: AuditLog[];
}

export function DocumentDetail({
  document: doc,
  categories,
  auditLogs,
}: DocumentDetailProps) {
  const router = useRouter();
  const [showOcr, setShowOcr] = useState(false);

  const isImage = ["jpg", "jpeg", "png", "webp"].includes(
    doc.file_type.toLowerCase()
  );

  async function handleDelete() {
    if (!confirm("Bu belgeyi silmek istediginize emin misiniz?")) return;
    try {
      await deleteDocument(doc.id);
      toast.success("Belge silindi");
      router.push("/belgeler");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Silme hatasi");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/belgeler")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Geri
          </Button>
          <h1 className="text-xl font-bold text-slate-900">
            {doc.supplier_name || "Belge Detayi"}
          </h1>
          <StatusBadge status={doc.status} />
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-1" />
          Sil
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="aspect-[3/4] relative bg-slate-100 flex items-center justify-center">
              {isImage ? (
                <Image
                  src={doc.original_file_url}
                  alt="Belge"
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <FileText className="h-16 w-16 mx-auto mb-2" />
                  <p>PDF Onizleme</p>
                  <a
                    href={doc.original_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Dosyayi Ac
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* OCR Text */}
          <div className="bg-white rounded-xl border p-4">
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              onClick={() => setShowOcr(!showOcr)}
            >
              {showOcr ? "OCR Metnini Gizle" : "OCR Metnini Goster"}
            </Button>
            {showOcr && (
              <pre className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap max-h-64 overflow-y-auto">
                {doc.raw_ocr_text || "OCR metni bulunamadi"}
              </pre>
            )}
          </div>

          {/* Audit Log */}
          {auditLogs.length > 0 && (
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-semibold text-sm text-slate-900 mb-3">
                Degisiklik Gecmisi
              </h3>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="text-xs text-slate-600 flex items-center gap-2"
                  >
                    <span className="text-slate-400">
                      {formatDate(log.created_at)}
                    </span>
                    <span className="capitalize">{log.action_type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Edit form */}
        <div className="bg-white rounded-xl border p-4">
          <ReviewForm document={doc} categories={categories} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Document detail page**

```tsx
// src/app/(dashboard)/belge/[id]/page.tsx
import { notFound } from "next/navigation";
import {
  getDocument,
  getDocumentAuditLogs,
} from "@/lib/actions/documents";
import { getCategories } from "@/lib/actions/categories";
import { DocumentDetail } from "@/components/documents/document-detail";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const [document, categories, auditLogs] = await Promise.all([
      getDocument(id),
      getCategories(),
      getDocumentAuditLogs(id),
    ]);

    return (
      <DocumentDetail
        document={document}
        categories={categories}
        auditLogs={auditLogs}
      />
    );
  } catch {
    notFound();
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/documents/document-detail.tsx src/app/\(dashboard\)/belge/
git commit -m "feat: add document detail page with preview, edit form, and audit log"
```

---

## Task 18: Dashboard Page

**Files:**
- Create: `src/components/dashboard/stat-card.tsx`, `src/components/dashboard/recent-documents.tsx`, `src/components/dashboard/category-chart.tsx`, `src/app/(dashboard)/panel/page.tsx`

- [ ] **Step 1: Create StatCard**

```tsx
// src/components/dashboard/stat-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-500">{title}</p>
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create RecentDocuments**

```tsx
// src/components/dashboard/recent-documents.tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/documents/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Document } from "@/types";

interface RecentDocumentsProps {
  documents: Document[];
}

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Son Belgeler</CardTitle>
          <Link
            href="/belgeler"
            className="text-sm text-blue-600 hover:underline"
          >
            Tumunu Gor
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            Henuz belge yok.
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/belge/${doc.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">
                    {doc.supplier_name || "Bilinmiyor"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {doc.issue_date ? formatDate(doc.issue_date) : "-"}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className="text-sm font-medium text-slate-900">
                    {doc.total_amount !== null
                      ? formatCurrency(doc.total_amount, doc.currency)
                      : "-"}
                  </span>
                  <StatusBadge status={doc.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create CategoryChart**

```tsx
// src/components/dashboard/category-chart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface CategoryChartProps {
  data: { name: string; color: string; total: number }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Kategori Dagilimi</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            Henuz veri yok.
          </p>
        ) : (
          <div className="space-y-3">
            {data
              .sort((a, b) => b.total - a.total)
              .map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.total / maxTotal) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Create Dashboard page**

```tsx
// src/app/(dashboard)/panel/page.tsx
import { FileText, TrendingDown, AlertCircle } from "lucide-react";
import { getDashboardStats } from "@/lib/actions/documents";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel</h1>
        <p className="text-slate-600 text-sm mt-1">
          Bu ayki ozet ve son belgeler.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          title="Bu Ay Belge"
          value={stats.documents_this_month}
          icon={FileText}
          description="Yuklenen belge sayisi"
        />
        <StatCard
          title="Bu Ay Gider"
          value={formatCurrency(stats.total_expense_this_month)}
          icon={TrendingDown}
          description="Toplam harcama"
        />
        <StatCard
          title="Inceleme Bekleyen"
          value={stats.pending_review_count}
          icon={AlertCircle}
          description="Dogrulama gerektiren"
        />
      </div>

      {/* Charts and recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentDocuments documents={stats.recent_documents} />
        <CategoryChart data={stats.category_distribution} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ src/app/\(dashboard\)/panel/
git commit -m "feat: add dashboard page with stats, recent documents, and category chart"
```

---

## Task 19: Reports & Export Page

**Files:**
- Create: `src/components/reports/report-summary.tsx`, `src/components/reports/export-buttons.tsx`, `src/app/(dashboard)/raporlar/page.tsx`

- [ ] **Step 1: Create ExportButtons**

```tsx
// src/components/reports/export-buttons.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadCsv } from "@/lib/export/csv";
import { downloadExcel } from "@/lib/export/excel";
import type { Document } from "@/types";

interface ExportButtonsProps {
  documents: Document[];
}

export function ExportButtons({ documents }: ExportButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadCsv(documents)}
        disabled={documents.length === 0}
      >
        <Download className="h-4 w-4 mr-2" />
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadExcel(documents)}
        disabled={documents.length === 0}
      >
        <Download className="h-4 w-4 mr-2" />
        Excel
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Create ReportSummary**

```tsx
// src/components/reports/report-summary.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Document } from "@/types";

interface ReportSummaryProps {
  documents: Document[];
}

export function ReportSummary({ documents }: ReportSummaryProps) {
  const totalAmount = documents.reduce(
    (sum, d) => sum + (d.total_amount || 0),
    0
  );
  const totalVat = documents.reduce(
    (sum, d) => sum + (d.vat_amount || 0),
    0
  );

  // Category totals
  const categoryTotals = new Map<string, { name: string; color: string; total: number; count: number }>();
  documents.forEach((doc) => {
    if (doc.category) {
      const existing = categoryTotals.get(doc.category.id);
      if (existing) {
        existing.total += doc.total_amount || 0;
        existing.count += 1;
      } else {
        categoryTotals.set(doc.category.id, {
          name: doc.category.name,
          color: doc.category.color,
          total: doc.total_amount || 0,
          count: 1,
        });
      }
    }
  });

  // Supplier totals
  const supplierTotals = new Map<string, { total: number; count: number }>();
  documents.forEach((doc) => {
    const name = doc.supplier_name || "Bilinmiyor";
    const existing = supplierTotals.get(name);
    if (existing) {
      existing.total += doc.total_amount || 0;
      existing.count += 1;
    } else {
      supplierTotals.set(name, {
        total: doc.total_amount || 0,
        count: 1,
      });
    }
  });

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-500">Toplam Belge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{documents.length}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-500">Toplam Tutar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-500">Toplam KDV</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(totalVat)}</p>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-500">
            Kategori Bazli
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from(categoryTotals.values())
              .sort((a, b) => b.total - a.total)
              .map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>
                      {cat.name} ({cat.count})
                    </span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(cat.total)}
                  </span>
                </div>
              ))}
            {categoryTotals.size === 0 && (
              <p className="text-sm text-slate-400">Veri yok</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Supplier breakdown */}
      <Card className="sm:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-500">
            Firma Bazli (En Yuksek 10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from(supplierTotals.entries())
              .sort((a, b) => b[1].total - a[1].total)
              .slice(0, 10)
              .map(([name, data]) => (
                <div
                  key={name}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {name} ({data.count})
                  </span>
                  <span className="font-medium">
                    {formatCurrency(data.total)}
                  </span>
                </div>
              ))}
            {supplierTotals.size === 0 && (
              <p className="text-sm text-slate-400">Veri yok</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Create Reports page**

```tsx
// src/app/(dashboard)/raporlar/page.tsx
import { Suspense } from "react";
import { getDocuments } from "@/lib/actions/documents";
import { ReportSummary } from "@/components/reports/report-summary";
import { ExportButtons } from "@/components/reports/export-buttons";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const documents = await getDocuments({
    date_from: params.date_from,
    date_to: params.date_to,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Raporlar</h1>
          <p className="text-slate-600 text-sm mt-1">
            Belgelerinizin ozeti ve disa aktarma.
          </p>
        </div>
        <ExportButtons documents={documents} />
      </div>

      {/* Date filters */}
      <form className="flex gap-3 items-end">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">
            Baslangic
          </label>
          <input
            type="date"
            name="date_from"
            defaultValue={params.date_from || ""}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Bitis</label>
          <input
            type="date"
            name="date_to"
            defaultValue={params.date_to || ""}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800"
        >
          Filtrele
        </button>
      </form>

      <ReportSummary documents={documents} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/reports/ src/app/\(dashboard\)/raporlar/
git commit -m "feat: add reports page with summary, category/supplier breakdown, and export"
```

---

## Task 20: Settings Page

**Files:**
- Create: `src/app/(dashboard)/ayarlar/page.tsx`

- [ ] **Step 1: Create Settings page**

```tsx
// src/app/(dashboard)/ayarlar/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/categories";
import { getUserWorkspace } from "@/lib/actions/auth";
import { updateWorkspace } from "@/lib/actions/workspace";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { Category, Workspace } from "@/types";

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6b7280");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  useEffect(() => {
    getUserWorkspace().then((ws) => setWorkspace(ws as Workspace | null));
    getCategories().then(setCategories);
  }, []);

  async function handleSaveWorkspace(formData: FormData) {
    const name = formData.get("name") as string;
    const currency = formData.get("currency") as string;
    try {
      await updateWorkspace(name, currency);
      toast.success("Ayarlar kaydedildi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    }
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    try {
      const cat = await createCategory(newCatName, newCatColor);
      setCategories((prev) => [...prev, cat]);
      setNewCatName("");
      setNewCatColor("#6b7280");
      toast.success("Kategori eklendi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    }
  }

  async function handleUpdateCategory(id: string) {
    try {
      const updated = await updateCategory(id, editName, editColor);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
      toast.success("Kategori guncellendi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Bu kategoriyi silmek istediginize emin misiniz?")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Kategori silindi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
        <p className="text-slate-600 text-sm mt-1">
          Calisma alani ve kategori ayarlarinizi yonetin.
        </p>
      </div>

      {/* Workspace settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Calisma Alani</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSaveWorkspace} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Calisma Alani Adi</Label>
              <Input
                id="name"
                name="name"
                defaultValue={workspace?.name || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Varsayilan Para Birimi</Label>
              <Input
                id="currency"
                name="currency"
                defaultValue={workspace?.default_currency || "TRY"}
              />
            </div>
            <Button type="submit" size="sm">
              Kaydet
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Category management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kategoriler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-xs">Yeni Kategori</Label>
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Kategori adi"
              />
            </div>
            <div>
              <Label className="text-xs">Renk</Label>
              <Input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
            </div>
            <Button size="sm" onClick={handleAddCategory}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* List */}
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 p-2 rounded-lg border"
              >
                {editingId === cat.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 flex-1"
                    />
                    <Input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-10 h-8 p-0.5 cursor-pointer"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateCategory(cat.id)}
                    >
                      Kaydet
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Iptal
                    </Button>
                  </>
                ) : (
                  <>
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="flex-1 text-sm">{cat.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                        setEditColor(cat.color);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/ayarlar/
git commit -m "feat: add settings page with workspace and category management"
```

---

## Task 21: Supabase Project Setup

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Create Supabase project**

Go to [supabase.com](https://supabase.com), create a new project. Note the project URL and anon key.

- [ ] **Step 2: Create `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OCR_ADAPTER=mock
```

- [ ] **Step 3: Run SQL migrations**

Go to Supabase Dashboard → SQL Editor. Run the contents of:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_seed_data.sql`

- [ ] **Step 4: Configure Supabase Auth**

In Supabase Dashboard → Authentication → Settings:
- Enable Email provider
- Disable email confirmation for development (optional)

- [ ] **Step 5: Create storage bucket**

If the SQL migration didn't create the storage bucket automatically, go to Supabase Dashboard → Storage and create a bucket named `documents` with private access.

- [ ] **Step 6: Verify setup**

```bash
npm run dev
```

Visit `http://localhost:3000` — landing page should render. Navigate to `/kayit`, register a user, and verify redirect to `/panel`.

---

## Task 22: Final Verification & Cleanup

- [ ] **Step 1: Test complete flow**

1. Visit landing page — verify hero, features, how-it-works
2. Register new account at `/kayit`
3. Verify redirect to `/panel` with empty dashboard
4. Navigate to `/yukle`, drag a test image
5. Verify mock OCR runs, review form appears
6. Edit fields, save, verify document saved
7. Navigate to `/belgeler`, verify table shows document
8. Test filters (status, category)
9. Click document to go to `/belge/[id]`, verify detail page
10. Navigate to `/raporlar`, verify summary and export buttons
11. Test CSV and Excel export
12. Navigate to `/ayarlar`, verify category management

- [ ] **Step 2: Fix any TypeScript errors**

```bash
npx tsc --noEmit
```

Fix any type errors found.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and verification"
```
