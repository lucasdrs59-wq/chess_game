import React from 'react';

export default function Import(): JSX.Element {
  return (
    <section aria-labelledby="import-title">
      <h1 id="import-title">Import</h1>

      <p>Analyse après la partie uniquement.</p>
      <p>Interdiction d’analyse live.</p>

      <ul>
        <li>Import PGN autorisé uniquement pour revue post-partie.</li>
        <li>Pas d’entrée FEN libre.</li>
        <li>Aucun mode live.</li>
        <li>Pas de capture/overlay/lecture de fenêtre.</li>
      </ul>
    </section>
  );
}
