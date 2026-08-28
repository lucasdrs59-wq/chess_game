# Chess Progress Coach

[![CI](https://github.com/lucasdrs59-wq/chess_game/actions/workflows/ci.yml/badge.svg)](https://github.com/lucasdrs59-wq/chess_game/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-8EE3B7)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-D3B66F.svg)](LICENSE)

Coach d’échecs local pour transformer des parties terminées en entraînements
ciblés. L’application importe les parties publiques Chess.com, conserve les
données dans le navigateur et applique une règle stricte : **aucune assistance
pendant une partie**.

## Preuves actuelles

- application React/Vite installable et responsive ;
- import des archives publiques Chess.com avec reprise sur limitation `429` ;
- déduplication locale des parties ;
- parseur PGN et reconstruction des positions ;
- heuristiques post-partie explicables ;
- sélection d’exercices et répétition espacée ;
- pack d’entraînement dont chaque ligne SAN est validée automatiquement ;
- CI avec lint, TypeScript strict, tests et build de production.

> Statut : prototype public. Les heuristiques orientent la revue pédagogique ;
> elles ne remplacent pas l’analyse d’un moteur ni le jugement d’un entraîneur.

## Démarrage

Prérequis : Node.js 22 et npm 10 ou supérieur.

```bash
git clone https://github.com/lucasdrs59-wq/chess_game.git
cd chess_game
npm ci
npm run dev
```

Ouvrir ensuite [http://localhost:5173](http://localhost:5173).

## Commandes

| Commande | Usage |
|---|---|
| `npm run dev` | Serveur local avec rechargement |
| `npm run lint` | Contrôle ESLint sans avertissement |
| `npm run typecheck` | Vérification TypeScript stricte |
| `npm run test:run` | Tests unitaires reproductibles |
| `npm run build` | Bundle de production dans `dist/` |
| `npm run verify` | Tous les contrôles dans l’ordre CI |

## Architecture

```text
src/
├── components/        # shell, import et règle de fair-play
├── data/              # exercices publics validés
├── lib/               # base IndexedDB locale
├── pages/             # accueil, entraînement, détail et règles
├── services/          # API, import, PGN, heuristiques et planification
└── types/             # modèle de domaine
```

Les décisions structurantes sont tracées dans
[docs/architecture/DECISIONS.md](docs/architecture/DECISIONS.md).

## Confidentialité et fair-play

- aucune clé API n’est nécessaire ;
- aucune donnée n’est envoyée vers un backend du projet ;
- les imports utilisent uniquement l’API publique Chess.com ;
- l’historique reste dans `localStorage` ou IndexedDB ;
- aucune entrée FEN libre, capture d’écran, surcouche ou analyse live ;
- les données d’entraînement du dépôt sont synthétiques et testées.

Consulter [SECURITY.md](SECURITY.md) pour signaler une vulnérabilité et la
[checklist fair-play](qa/ux-non-regression-checklist.md) avant chaque release.

## Feuille de route

- [x] socle de build, CI et qualité ;
- [x] import Chess.com et déduplication ;
- [x] pack d’exercices légalement rejouable ;
- [ ] relier l’import à la bibliothèque de parties dans l’interface ;
- [ ] ajouter un échiquier interactif accessible ;
- [ ] mesurer la précision des heuristiques sur un corpus public ;
- [ ] publier une démonstration statique.

## Licence

Code sous [licence MIT](LICENSE). Chess.com est une marque de son propriétaire ;
ce projet indépendant n’est ni affilié ni approuvé par Chess.com.
