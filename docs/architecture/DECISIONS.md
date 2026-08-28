# Décisions d’architecture

## ADR-001 — Application locale

**Décision :** exécuter l’application dans le navigateur et stocker les données
avec `localStorage` derrière des adaptateurs dédiés.

**Pourquoi :** le prototype ne nécessite ni compte, ni donnée partagée, ni
secret serveur. Cette architecture réduit les coûts et protège les historiques.

## ADR-002 — Analyse post-partie uniquement

**Décision :** refuser toute entrée de position arbitraire et toute intégration
à une partie en cours.

**Pourquoi :** le produit doit favoriser l’apprentissage sans fournir
d’assistance contraire au fair-play des plateformes.

## ADR-003 — Fonctionnalités verticales

**Décision :** regrouper interface, logique métier, stockage et tests sous
`src/features/<fonctionnalité>/`.

**Pourquoi :** une fonctionnalité peut évoluer ou être supprimée sans laisser
des dossiers génériques remplis de modules orphelins.

## ADR-004 — Données d’entraînement testées

**Décision :** toute ligne SAN du pack est rejouée par `chess.js` en CI.

**Pourquoi :** un exercice invalide détruit la confiance plus vite qu’un petit
catalogue. Le volume augmente uniquement avec des positions vérifiées.
