# Instructions pour l'agent

Plateforme communautaire GAB (GenAI Builders) pour l'adoption de l'IA générative par les professionnels.

## Conventions de code

- **Langue** : Français pour la communication, anglais pour le code
- **Framework** : Next.js 15 (App Router, React 19)
- **Styling** : Tailwind CSS uniquement, utiliser `cn()` pour les classes conditionnelles
- **UI** : shadcn/ui (composants dans `components/ui/`, ne pas modifier directement)
- **Forms** : React Hook Form + Zod (schémas dans `lib/validations/`)
- **Data fetching** : Server Components par défaut
- **Mutations** : Server Actions
- **Routing** : App Router (file-based)
- **Imports UI** : Toujours depuis `@/components/ui/`
- **Hosting** : Vercel
- **Intégrations** : Luma (events), Resend (newsletter)

## Structure

```
app/
├── (marketing)/          # Pages publiques (SSG)
│   ├── page.tsx          # Landing
│   ├── events/           # Événements + replays
│   ├── blog/             # Articles [slug]
│   ├── ressources/       # Ressources [slug]
│   ├── formations/       # Formations [slug]
│   └── soutenir/         # Page de soutien
├── api/newsletter/       # Route API newsletter
└── layout.tsx            # Layout racine

components/
├── ui/                   # shadcn (ne pas modifier directement)
├── layout/               # Header, Footer, Navigation
├── events/               # EventCard, EventList
├── blog/                 # ArticleCard
├── resources/            # ResourceCard, CopyButton
└── forms/                # NewsletterForm

lib/
├── validations/          # Schémas Zod
└── utils.ts              # Helpers (cn, formatDate)

design/
└── pencil-gab.pen        # Design system de référence (Pencil)
```

## Commandes

```bash
npm install          # Installer les dépendances
npm run dev          # Serveur de développement (Turbopack)
npm run build        # Build de production
npm run lint         # Linter ESLint
npm run start        # Serveur de production
```

## Vérifications avant commit

Toujours exécuter avant de commiter :

```bash
npm run lint && npm run build
```

Les deux doivent passer sans erreur.

## Conventions de commits

Format Conventional Commits obligatoire :

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
Scope: optionnel (blog, events, resources, formations, ui, api)
```

Exemples :

- `feat(blog): add article sharing buttons`
- `fix(events): correct date formatting for past events`
- `chore: update dependencies`

## Variables d'environnement

```
RESEND_API_KEY=
```

## Design System

Le fichier `design/pencil-gab.pen` est la source de vérité visuelle. Respecter ces tokens lors de l'intégration.

### Typographie

- **Headings** : Police `Mode` — H1 40px bold, H2 28px bold, H3 22px semibold, H4 18px semibold
- **Body** : Police `Capriola` — Large 18px, Regular 16px, Small 14px, Caption 12px
- **UI (boutons, labels, badges)** : Police `Inter`

### Composants réutilisables

- **Boutons** : Primary, Secondary, Outline, Ghost, Destructive — border-radius `12px`, padding `12×24`
- **Badges** : Default, Secondary, Outline — border-radius pill (`9999px`)
- **Badges ville** : Lille (`#14532d`/`#86efac`), Paris (`#1e3a5f`/`#93c5fd`), Lyon (`#7f1d1d`/`#fca5a5`), Remote (`#581c87`/`#d8b4fe`)
- **InputGroup** : Label + champ input (height `44px`, border-radius `12px`)
- **EventCard** : Image gradient, badges, titre, date, lieu, CTA
- **Checkbox / Radio** : Avec labels

### Icônes

Famille **Lucide** : `calendar`, `map-pin`, `play`, `external-link`, `arrow-right`, `eye-off`, `trash-2`, `mail`, `menu`, `x`, `search`, `chevron-right`, `users`, `book-open`, `sparkles`

### Règles

- Thème **dark-only** (fond sombre `#031106`)
- Border-radius standard : `12px` (boutons, inputs, cartes) ; `9999px` pour les badges
- Cartes : stroke 1px `--border`, fond `--card`

## Documentation détaillée

- Architecture : `_bmad-output/planning-artifacts/architecture.md`
- PRD : `_bmad-output/planning-artifacts/prd.md`
- UX Design : `_bmad-output/planning-artifacts/ux-design-specification.md`
- Design System : `design/pencil-gab.pen`
