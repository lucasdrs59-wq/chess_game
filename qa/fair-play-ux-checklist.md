# Checklist QA — Fair Play / UX non-régression

Objectif: confirmer qu’aucun écran ne propose une aide de type “meilleur coup” sur une position arbitraire.

## Vérifications fonctionnelles

- [ ] Le bandeau global `FairPlayBanner` est visible sur toutes les pages.
- [ ] Les pages `Settings` et `Import` affichent explicitement:
  - [ ] “Analyse après la partie uniquement”
  - [ ] “Interdiction d’analyse live”
- [ ] Aucune page ne propose une entrée FEN libre.
- [ ] Aucune page ne propose un mode live.
- [ ] Aucune fonctionnalité de capture/overlay/lecture de fenêtre n’est disponible.
- [ ] Aucun écran n’affiche ou ne promet “meilleur coup” pour une position arbitraire.

## Vérifications techniques (statique)

Exécuter:

```bash
rg -n "FEN|mode live|overlay|capture|lecture de fenêtre|meilleur coup" src qa
```

Critère d’acceptation:

- Les occurrences trouvées ne doivent apparaître que dans des contextes d’interdiction/politique Fair-Play ou checklist QA, jamais comme fonctionnalité active.
