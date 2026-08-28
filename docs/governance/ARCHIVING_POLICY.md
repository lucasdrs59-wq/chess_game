# Politique d’archivage

- `main` est l’unique branche durable de développement ;
- une refonte majeure peut créer `archive/pre-<sujet>-YYYY-MM-DD` ;
- une branche fusionnée est supprimée sous 30 jours ;
- les releases utilisent des tags sémantiques ;
- un document remplacé rejoint `docs/archive/YYYY/` avec date, motif et lien
  vers son successeur ;
- aucun dossier `old/`, `backup/` ou copie numérotée ne remplace Git.

L’état antérieur à la standardisation est conservé sur
`archive/pre-standardization-2026-08-27`.
