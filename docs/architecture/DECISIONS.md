# Décisions d’architecture

## ADR-001 — Application locale

**Décision :** exécuter l’application dans le navigateur et stocker les données
avec `localStorage` et IndexedDB.

**Pourquoi :** le prototype ne nécessite ni compte, ni donnée partagée, ni
secret serveur. Cette architecture réduit les coûts et protège les historiques.

## ADR-002 — Analyse post-partie uniquement

**Décision :** refuser toute entrée de position arbitraire et toute intégration
à une partie en cours.

**Pourquoi :** le produit doit favoriser l’apprentissage sans fournir
d’assistance contraire au fair-play des plateformes.

## ADR-003 — Heuristiques explicables

**Décision :** détecter des thèmes pédagogiques par des règles lisibles avant
d’envisager un moteur d’analyse hors ligne.

**Conséquence :** chaque résultat est interprétable, mais sa précision doit être
mesurée et ne peut être présentée comme une évaluation exhaustive.

## ADR-004 — Données d’entraînement testées

**Décision :** toute ligne SAN du pack est rejouée par `chess.js` en CI.

**Pourquoi :** un exercice invalide détruit la confiance plus vite qu’un petit
catalogue. Le volume augmente uniquement avec des positions vérifiées.
