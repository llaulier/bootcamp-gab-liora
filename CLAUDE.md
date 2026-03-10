# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

GAB (GenAI Builders) — community platform for generative AI adoption by professionals. Built with Next.js 15 App Router, deployed on Vercel.

## Commands

```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run start        # Production server
```

**Before every commit:** `npm run lint && npm run build` must both pass without errors.

## Commit Format

Conventional Commits required:
```
<type>(<scope>): <description>
Types: feat, fix, docs, style, refactor, test, chore
Scopes: blog, events, resources, formations, ui, api
```

## Architecture

```
app/
├── (public)/         # Marketing pages (SSG) — landing, events, blog, ressources, formations, soutenir
├── api/newsletter/   # Newsletter API route
└── layout.tsx        # Root layout (fonts, metadata)

components/
├── ui/               # shadcn/ui — DO NOT modify directly
├── layout/           # Header, Footer, Navigation
├── events/           # EventCard, EventFilters
├── blog/             # ArticleCard
├── resources/        # ResourceCard, CopyButton
├── forms/            # NewsletterForm
└── hero/             # Hero, AnimatedStripes

lib/
├── types/content.ts  # Event, Article, Resource interfaces
├── validations/      # Zod schemas
└── utils.ts          # cn(), formatDate(), formatEventDate(), slugify()

data/events.json      # Static event data (future migration to Supabase)
```

## Routing & Data Patterns

- **Routing**: Next.js 15 App Router. Layout group `(public)/` for marketing pages (SSG).
- **searchParams**: Pages receive them as `Promise<{...}>` — always `await searchParams` in async Server Components.
- **Filter state**: URL search params only (no client state). Client components use `useRouter` + `useSearchParams` to read/write params via `router.push()`. Keeps URLs shareable and SSR-friendly.
- **Data source**: `data/events.json` (static import). Planned migration to Supabase.
- **Event type**: Defined in `lib/types/content.ts`. Fields: `city`, `event_type`, `is_past`, `published` are the filter dimensions.

## Key Conventions

- **Styling**: Tailwind CSS only. Use `cn()` from `@/lib/utils` for conditional classes.
- **UI imports**: Always from `@/components/ui/` — shadcn/ui components are not to be modified directly.
- **Forms**: React Hook Form + Zod. Schemas live in `lib/validations/`.
- **Data fetching**: Server Components by default. Mutations via Server Actions.
- **Theme**: Dark-only. Never add light mode. Background `#031106`.
- **Fonts**: `font-heading` (Mode VF) for headings, `font-body` (Capriola) for body text.
- **Icons**: Lucide React only.
- **Language**: French in the UI, English in code.

## Component Variants (shadcn/ui + CVA)

**Button**: `default | secondary | outline | ghost | link | destructive` × sizes `default | sm | lg | icon`
**Badge**: `default | secondary | outline | destructive`
**Card**: always use `Card > CardHeader > CardContent > CardFooter` sub-components

## Design Tokens

- Border-radius: `12px` for cards/buttons/inputs, `9999px` for badges
- City badge colors: Lille (`#14532d`/`#86efac`), Paris (`#1e3a5f`/`#93c5fd`), Lyon (`#7f1d1d`/`#fca5a5`), Remote (`#581c87`/`#d8b4fe`)
- Typography: H1 40px bold, H2 28px bold, H3 22px semibold; Body 16px, Small 14px

## Environment Variables

```
RESEND_API_KEY=           # Newsletter (Resend)
NEXT_PUBLIC_SUPABASE_URL= # Future database
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Detailed Documentation

- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- PRD: `_bmad-output/planning-artifacts/prd.md`
- UX Design: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Feature PRDs: `docs/`
