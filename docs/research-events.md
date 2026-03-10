# Research — Events Feature

Document de référence technique pour toute évolution de la section `/events`.
Basé sur l'exploration du codebase (branche `feat/filter`) — 2026-03-10.

---

## Contexte technique découvert

### Stack & environnement
- Next.js 15 App Router (Turbopack en dev)
- React Server Components par défaut — Client Components opt-in avec `"use client"`
- Tailwind CSS + shadcn/ui + CVA (`class-variance-authority`)
- TypeScript strict
- Données statiques : `data/events.json` — migration Supabase prévue (phase 2)

### Fichiers clés de la feature events

| Fichier | Rôle |
|---|---|
| `app/(public)/events/page.tsx` | Server Component — reçoit searchParams, filtre, render grille |
| `components/events/event-card.tsx` | Composant d'affichage d'un événement |
| `components/events/event-filters.tsx` | Client Component — UI des filtres, lecture/écriture URL |
| `lib/types/content.ts` | Interface `Event` — source de vérité des champs |
| `data/events.json` | Données statiques (4 events, tous Lille actuellement) |
| `lib/utils.ts` | `cn()`, `formatDate()`, `formatEventDate()`, `slugify()` |

### Interface `Event` — dimensions filtrables

```typescript
{
  city: "lille" | "paris" | "lyon" | "remote" | null
  event_type: "meetup" | "webinar" | "workshop" | "conference"
  is_past: boolean
  published: boolean  // seuls les events published: true sont affichés
}
```

### Pattern searchParams Next.js 15

Les pages App Router reçoivent `searchParams` comme une **Promise** — toujours awaiter :

```typescript
interface EventsPageProps {
  searchParams: Promise<{ city?: string; type?: string; period?: string }>
}
export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { city, type, period } = await searchParams
}
```

### Pattern URL filter (Client Component)

```typescript
function updateParam(key: string, value: string | null) {
  const params = new URLSearchParams(searchParams.toString())
  if (value === null || value === "all") {
    params.delete(key)
  } else {
    params.set(key, value)
  }
  router.push(`/events${params.size ? `?${params}` : ""}`)
}
```

---

## Patterns à suivre

- Filtrage **côté serveur** dans `page.tsx` — ne pas recréer de state client pour les données filtrées
- **URL search params** comme unique source de vérité pour l'état des filtres (pas de `useState`)
- Tout nouveau composant event doit utiliser `cn()` pour les classes conditionnelles
- Les couleurs de ville sont hardcodées dans un objet `CITY_CONFIG` — ajouter toute nouvelle ville là-dedans
- Les icônes sont **Lucide React uniquement** — pas d'autres librairies d'icônes
- Les composants UI (`Badge`, `Button`, `Card`) viennent de `@/components/ui/` — ne pas recréer
- `formatEventDate()` de `lib/utils.ts` pour tout affichage de date (locale française)
- Toute nouvelle page dans `(public)/` est Server Component par défaut
- Les compteurs dans les filtres se calculent sur `allEvents` (avant filtrage), pas sur les résultats filtrés

---

## Contraintes identifiées

- **Dark-only** — aucune variante claire, jamais de `dark:` préfixe (tout est déjà sombre)
- **Pas de state client** pour les données — le filtrage se fait côté serveur
- `shadcn/ui` ne se modifie pas directement (`components/ui/` est en lecture seule)
- La migration Supabase est prévue : ne pas coupler la logique de fetch à `events.json` — isoler les appels data pour faciliter le remplacement
- `searchParams` est une Promise en Next.js 15 — les accès synchrones cassent le build
- Tous les événements sans `published: true` sont exclus de l'affichage
- Le champ `city` est nullable (`null`) — les composants doivent gérer ce cas sans crasher
- Pas de librairie de gestion de state (Zustand, Jotai…) dans le projet actuellement
- `npm run lint && npm run build` doit passer avant tout commit

---

## Décisions préliminaires prises

| Décision | Choix retenu | Raison |
|---|---|---|
| Persistance des filtres | URL Search Params | Shareable, bookmarkable, SEO-friendly, back-button natif |
| Logique de filtrage | Côté serveur (`page.tsx`) | Pas de state client inutile, cohérent avec RSC |
| Source de données | Import statique `events.json` | Phase 1 — migration Supabase plus tard |
| `EventFilters` | `"use client"` | Nécessite `useRouter` et `useSearchParams` |
| Compteurs de filtres | Calculés sur tous les events (non filtrés) | UX : montrer ce qui est disponible, pas ce qui reste |
| Empty state | Affiché avec bouton reset | Évite une page blanche sans explication |
| Grille events | Responsive 1/2/3 colonnes | Mobile-first, cohérent avec le reste du design |
| Couleurs villes | Hardcodées dans `CITY_CONFIG` | Tokens explicites, cohérents avec le design system |

---

## Ce qui reste à implémenter (scope futur)

- [ ] Page de détail événement — `/events/[slug]`
- [ ] Données multi-villes dans `events.json` (Paris, Lyon, Remote)
- [ ] Player vidéo modal pour les replays
- [ ] Migration fetch vers Supabase (remplacer l'import JSON)
- [ ] Formulaire de soumission de talk (PRD-02)
- [ ] Pagination ou infinite scroll si le nombre d'events augmente
