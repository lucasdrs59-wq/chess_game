/**
 * Global fair-play notice displayed across the full application.
 */
export default function FairPlayBanner() {
  return (
    <aside className="fair-play" role="note" aria-label="Règles de fair-play">
      <span aria-hidden="true">✓</span>
      <p>
        <strong>Fair-play par conception</strong>
        Analyse après la partie uniquement — aucune analyse live, capture ou surcouche.
      </p>
    </aside>
  );
}
