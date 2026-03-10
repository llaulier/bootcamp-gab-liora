# PRD-03 — Migration des événements vers Supabase

**Date :** 2026-03-10
**Branche cible :** feat/supabase-events
**Statut :** Draft
**Auteur :** GAB / Hoko

---

## 1. Contexte

La page `/events` charge actuellement les données depuis `data/events.json` via un import statique Next.js. Cette approche a atteint ses limites :

- Ajouter ou modifier un événement nécessite un commit + déploiement
- Aucune possibilité de filtrage côté base — tout est chargé en mémoire
- Le fichier `docs/events-seed.sql` existant est incomplet (colonne `city` manquante, seulement 4 événements sur 8)

Cette migration vise à remplacer la source de données statique par **Supabase** (PostgreSQL), tout en conservant l'interface utilisateur existante et les URL de filtres (`?city=…&type=…&period=…`).

---

## 2. Objectifs

| Objectif | Mesure |
|---|---|
| Source de données dynamique | Les événements sont lus depuis Supabase, plus depuis le JSON |
| Filtrage performant | Les filtres sont poussés en SQL (`WHERE`), pas en JS |
| `is_past` toujours exact | Colonne calculée automatiquement depuis `event_date` |
| Données complètes | Les 8 événements du JSON actuel sont seedés en base |
| Zéro régression UI | La page `/events` s'affiche identiquement avant/après |

---

## 3. Hors périmètre

- Interface d'administration pour créer/éditer des événements
- Authentification utilisateur
- Pagination
- Système de cache ou ISR avancé
- Suppression du fichier `data/events.json` (conservé comme fallback documentaire)

---

## 4. User Stories

### US-1 — Consultation des événements
**En tant que** visiteur de la page `/events`,
**je veux** voir les événements chargés depuis la base de données,
**afin d'** avoir des données toujours à jour sans redéploiement.

**Critères :**
- Les événements `published = true` sont affichés
- L'ordre est chronologique (`event_date ASC`)
- Le comportement visuel est identique à l'état actuel

### US-2 — Filtrage par ville
**En tant que** visiteur,
**je veux** filtrer les événements par ville via `?city=lille`,
**afin de** voir uniquement les événements de ma ville.

**Critères :**
- Le filtre est appliqué en SQL (`WHERE city = $1`)
- L'URL reste la source de vérité (pas de state client)
- Le résultat est identique au filtre JS actuel

### US-3 — Filtrage par type
**En tant que** visiteur,
**je veux** filtrer par type via `?type=meetup`,
**afin de** trouver les formats qui m'intéressent.

**Critères :**
- Le filtre est appliqué en SQL (`WHERE event_type = $1`)

### US-4 — Filtrage par période
**En tant que** visiteur,
**je veux** filtrer par `?period=upcoming` ou `?period=past`,
**afin de** ne voir que les événements à venir ou les replays.

**Critères :**
- `upcoming` → `WHERE event_date >= now()`
- `past` → `WHERE event_date < now()`
- `is_past` est une colonne calculée, pas besoin de la filtrer explicitement

---

## 5. Architecture technique

### 5.1 Stack

- **Base de données :** Supabase (PostgreSQL)
- **Client :** `@supabase/ssr` — pattern officiel Next.js 15 App Router
- **Fetch :** Server Component uniquement, pas de client-side fetch
- **Typage :** Types générés par `supabase gen types typescript`

### 5.2 Nouveaux fichiers

```
lib/
└── supabase/
    ├── server.ts        # createServerClient() — client SSR
    └── events.ts        # getEvents(filters) — requête filtrée
```

### 5.3 Fichiers modifiés

```
app/(public)/events/page.tsx   # Remplace l'import JSON par getEvents()
lib/types/content.ts           # Optionnel: sync avec types générés Supabase
```

### 5.4 Fichiers remplacés

```
docs/events-seed.sql           # Remplacé par migration SQL complète (8 événements, colonne city)
```

---

## 6. Schéma de base de données

### 6.1 Table `public.events`

```sql
create table if not exists public.events (
  id                text        primary key,
  slug              text        not null unique,
  title             text        not null,
  description       text,
  event_date        timestamptz not null,
  event_end_date    timestamptz,
  location          text,
  city              text,
  image_url         text,
  registration_url  text,
  replay_url        text,
  -- is_past: computed in application layer (event_date < now())
  event_type        text        not null,
  capacity          integer,
  published         boolean     not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
```

**Décisions de conception :**
- `city` et `event_type` sont `text` (pas d'enum SQL) — la validation des valeurs autorisées reste dans le TypeScript ; plus flexible pour ajouter des villes/types sans migration DDL
- `is_past` **n'est pas une colonne** — PostgreSQL interdit `now()` dans les colonnes générées (non-immuable). `is_past` est calculé dans `getEvents()` via `new Date(event.event_date) < new Date()`, et le filtre `period` utilise `event_date < now()` directement en SQL
- `description` est nullable pour permettre des événements courts sans description complète

### 6.2 Index

```sql
create index if not exists events_city_idx        on public.events (city);
create index if not exists events_event_type_idx  on public.events (event_type);
create index if not exists events_event_date_idx  on public.events (event_date);
create index if not exists events_published_idx   on public.events (published);
```

### 6.3 Row Level Security

```sql
alter table public.events enable row level security;

-- Lecture publique des événements publiés
create policy "Public read published events"
  on public.events for select
  using (published = true);

-- Écriture réservée au service_role (scripts de seed, futurs admins)
create policy "Service role manage events"
  on public.events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
```

---

## 7. Couche données Next.js

### 7.1 `lib/supabase/server.ts`

Crée un `createServerClient` Supabase configuré pour Next.js App Router (lecture des cookies via `next/headers`).

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
}
```

### 7.2 `lib/supabase/events.ts`

Fonction `getEvents()` qui pousse les filtres actifs en SQL :

```ts
interface EventFilters {
  city?: string
  type?: string
  period?: 'upcoming' | 'past'
}

export async function getEvents(filters: EventFilters = {}): Promise<Event[]> {
  const supabase = createClient()

  let query = supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .order('event_date', { ascending: true })

  if (filters.city)            query = query.eq('city', filters.city)
  if (filters.type)            query = query.eq('event_type', filters.type)
  if (filters.period === 'upcoming') query = query.gte('event_date', new Date().toISOString())
  if (filters.period === 'past')     query = query.lt('event_date', new Date().toISOString())

  const { data, error } = await query
  if (error) throw error
  return data as Event[]
}
```

### 7.3 `app/(public)/events/page.tsx` — diff conceptuel

```diff
- import eventsData from "@/data/events.json";
- import type { Event } from "@/lib/types/content";
+ import { getEvents } from "@/lib/supabase/events";

- const allEvents = (eventsData as Event[]).filter((e) => e.published);

  export default async function EventsPage({ searchParams }) {
    const { city, type, period } = await searchParams;

-   const filtered = allEvents.filter((event) => {
-     if (city && event.city !== city) return false;
-     if (type && event.event_type !== type) return false;
-     if (period === "upcoming" && event.is_past) return false;
-     if (period === "past" && !event.is_past) return false;
-     return true;
-   });
+   const allEvents = await getEvents()          // pour les compteurs des filtres
+   const filtered  = await getEvents({ city, type, period })
```

**Note :** deux appels Supabase sont nécessaires — `allEvents` pour alimenter `<EventFilters>` (compteurs), `filtered` pour la grille. Les deux sont exécutés en parallèle avec `Promise.all`.

---

## 8. Seed des données

Le fichier `docs/events-seed.sql` sera remplacé par une migration complète contenant :

- La définition de la table (DDL)
- Les index
- Les politiques RLS
- Les **8 événements** du JSON actuel (`event-1` à `event-8`)
- Un `ON CONFLICT (slug) DO UPDATE` pour rejouer le seed sans erreur

Champs mappés depuis le JSON :

| JSON | SQL |
|---|---|
| `id` | `id` |
| `slug` | `slug` |
| `title` | `title` |
| `description` | `description` |
| `event_date` | `event_date` |
| `event_end_date` | `event_end_date` |
| `location` | `location` |
| `city` | `city` ✅ (manquait dans l'ancien SQL) |
| `image_url` | `image_url` |
| `registration_url` | `registration_url` |
| `replay_url` | `replay_url` |
| `is_past` | ❌ non inséré (colonne générée) |
| `event_type` | `event_type` |
| `capacity` | `capacity` |
| `published` | `published` |
| `created_at` | `created_at` |
| `updated_at` | `updated_at` |

---

## 9. Variables d'environnement

Requises dans `.env.local` et dans les secrets Vercel :

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

La `SUPABASE_SERVICE_ROLE_KEY` n'est pas nécessaire pour la lecture publique. Elle sera utile uniquement pour les scripts de seed ou un futur admin.

---

## 10. Dépendances

```bash
npm install @supabase/ssr @supabase/supabase-js
```

---

## 11. Critères d'acceptation

| # | Critère | Vérifié par |
|---|---|---|
| AC-1 | La page `/events` affiche les 8 événements sans import JSON | Inspection visuelle |
| AC-2 | `?city=lille` filtre en SQL et retourne uniquement les événements de Lille | Test manuel + logs Supabase |
| AC-3 | `?type=meetup` filtre en SQL par type | Test manuel |
| AC-4 | `?period=upcoming` retourne les événements dont `event_date >= now()` | Test manuel |
| AC-5 | `?period=past` retourne les événements dont `event_date < now()` | Test manuel |
| AC-6 | `is_past` est correct automatiquement sans valeur insérée | Vérification SQL : `SELECT is_past, event_date FROM events` |
| AC-7 | Les compteurs des filtres (`EventFilters`) reflètent les données Supabase | Inspection visuelle |
| AC-8 | Aucune régression UI (layout, badges couleur, cartes) | Inspection visuelle |
| AC-9 | `npm run lint && npm run build` passent sans erreur | Terminal |
| AC-10 | La page se charge correctement en production Vercel | Déploiement preview |
| AC-11 | Les variables d'environnement sont documentées dans `.env.local.example` | Inspection fichier |

---

## 12. Fichiers impactés (récapitulatif)

```
Créés :
  lib/supabase/server.ts
  lib/supabase/events.ts
  docs/events-seed.sql          (remplacé — migration complète)

Modifiés :
  app/(public)/events/page.tsx
  package.json + package-lock.json

Optionnel :
  lib/types/content.ts          (sync avec types générés Supabase si souhaité)
  .env.local.example            (documenter les nouvelles variables)
```
