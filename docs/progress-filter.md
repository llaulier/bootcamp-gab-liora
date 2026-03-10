# Progress : feat/filter — Events listing avec filtres

## Statut : En cours

---

## Objectif

Implémenter la page `/events` avec un système de filtres persistants via URL query params (`city`, `type`, `period`), en lisant les données statiques de `data/events.json`.

---

## Décisions d'architecture
 
| Décision | Choix | Raison |
|---|---|---|
| Persistance des filtres | URL Search Params (`?city=lille&type=meetup`) | Shareable, SEO-friendly, conforme au PRD |
| Filtrage | Côté serveur dans `page.tsx` | Évite du state client inutile |
| Données | Import statique `events.json` | Phase 1 avant migration Supabase |
| `EventFilters` | Client Component | Nécessite `useRouter` / `useSearchParams` |

---

## Fichiers modifiés / créés

| Fichier | Statut | Description |
|---|---|---|
| `lib/types/content.ts` | ✅ Modifié | Ajout champ `city` à l'interface `Event` |
| `data/events.json` | ✅ Modifié | Ajout `"city": "lille"` aux 4 événements |
| `components/events/event-filters.tsx` | ✅ Créé | Client Component — filtres Ville / Type / Période |
| `app/(public)/events/page.tsx` | ✅ Modifié | Server Component — lecture JSON + filtrage + grille |

---

## Ce qui est implémenté

- [x] Champ `city` structuré (`"lille" | "paris" | "lyon" | "remote" | null`) dans le type et le JSON
- [x] Page `/events` affiche les événements publiés depuis `events.json`
- [x] Filtre **Ville** — badges colorés avec design tokens (Lille vert, Paris bleu, Lyon rouge, Remote violet)
- [x] Filtre **Type** — Meetup, Webinar, Workshop, Conference
- [x] Filtre **Période** — Tous / À venir / Passés
- [x] Compteurs dynamiques dans chaque badge (nb d'events par valeur)
- [x] URL mise à jour à chaque clic (shareable + rechargeable)
- [x] Bouton "Réinitialiser les filtres" conditionnel
- [x] Empty state avec lien de reset si aucun résultat
- [x] Grille responsive 1 / 2 / 3 colonnes
- [x] `npm run lint` ✅ — `npm run build` ✅

---

## Ce qui reste à faire (hors scope de cette feature)

- [ ] Ajouter des événements Paris / Lyon / Remote pour tester les filtres multi-ville
- [ ] Intégration vidéo player modal pour les replays (PRD-01 — phase 2)
- [ ] Migration vers Supabase (remplacement de `events.json`)
- [ ] Page de détail événement (`/events/[slug]`)
- [ ] Formulaire de soumission de talk (PRD-02)

---

## Tests manuels

| URL | Résultat attendu |
|---|---|
| `/events` | Tous les événements publiés |
| `/events?city=lille` | Uniquement les events de Lille |
| `/events?period=upcoming` | Uniquement les events futurs |
| `/events?period=past` | Uniquement les events passés |
| `/events?city=lille&type=meetup&period=past` | Combinaison des 3 filtres |
| URL avec filtre sans résultat | Empty state + bouton reset |

---

## Branche

`feat/filter` — basée sur `feat/event-management`
