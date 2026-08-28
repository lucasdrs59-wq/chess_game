# Checklist qualité — Fair-play

Objectif: confirmer qu’aucun écran ne propose d’assistance de type “meilleur coup” sur position arbitraire.

## Vérifications globales

- [ ] Le bandeau global `FairPlayBanner` est visible sur toutes les pages.
- [ ] Le bandeau indique explicitement: « Analyse après la partie uniquement ».
- [ ] Le bandeau indique explicitement l’interdiction d’analyse live.

## Écran Règles

- [ ] Le texte « Analyse après la partie uniquement » est affiché.
- [ ] Le texte « Interdiction d’analyse live » est affiché.
- [ ] Aucune entrée FEN libre n’est présente.
- [ ] Aucun mode live n’est présent.
- [ ] Aucune fonctionnalité capture/overlay/lecture de fenêtre n’est présente.

## Écran Import

- [ ] Le texte « Analyse après la partie uniquement » est affiché.
- [ ] Le texte « Interdiction d’analyse live » est affiché.
- [ ] Aucune entrée FEN libre n’est présente.
- [ ] Aucun mode live n’est présent.
- [ ] Aucune fonctionnalité capture/overlay/lecture de fenêtre n’est présente.

## Non-régression “meilleur coup”

- [ ] Aucun écran ne propose un bouton, une commande, ou un libellé « meilleur coup » sur une position arbitraire.
- [ ] Aucun workflow ne permet de saisir une position arbitraire pour demander un coup recommandé en direct.
