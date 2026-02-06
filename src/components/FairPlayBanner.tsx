import React from 'react';

export function FairPlayBanner() {
  return (
    <aside
      role="status"
      aria-live="polite"
      className="fair-play-banner"
      data-testid="fair-play-banner"
    >
      <strong>Fair-Play:</strong> Analyse autorisée uniquement après la partie. Aucune assistance en direct.
    </aside>
  );
}

export default FairPlayBanner;
