import React from 'react';

export default function Settings(): JSX.Element {
  return (
    <section aria-labelledby="settings-title">
      <h1 id="settings-title">Settings</h1>

      <p>Analyse après la partie uniquement.</p>
      <p>Interdiction d’analyse live.</p>

      <ul>
        <li>Pas d’entrée FEN libre.</li>
        <li>Aucun mode live.</li>
        <li>Pas de capture/overlay/lecture de fenêtre.</li>
      </ul>
    </section>
  );
}
