import React from 'react';

/**
 * Global fair-play notice displayed across the full application.
 */
export default function FairPlayBanner(): JSX.Element {
  return (
    <aside
      role="note"
      aria-label="Règles de fair-play"
      style={{
        padding: '12px 16px',
        marginBottom: '16px',
        border: '1px solid #e3a008',
        backgroundColor: '#fef3c7',
        color: '#7c2d12',
        borderRadius: '8px',
        fontWeight: 600,
      }}
    >
      Analyse après la partie uniquement — l’analyse live est strictement interdite.
    </aside>
  );
}
