# Journal des changements

Les changements notables suivent Keep a Changelog et le versionnement
sémantique.

## [Non publié]

### Prévu

- bibliothèque de parties importées ;
- échiquier d’entraînement accessible ;
- corpus public de validation des heuristiques.

## [0.1.0] — 2026-08-28

### Ajouté

- socle Vite, React 19 et TypeScript strict ;
- interface responsive et navigation accessible ;
- lint, tests, build et CI ;
- documentation, sécurité et politique d’archivage ;
- validation automatique des lignes d’entraînement.

### Corrigé

- reconstruction du dernier coup entre deux positions pour les heuristiques ;
- remplacement du pack historique de 100 lignes illégales par un pack réduit,
  légal et testé.

### Sécurité

- aucune variable d’environnement ni clé API requise ;
- état antérieur conservé sur `archive/pre-standardization-2026-08-27`.
