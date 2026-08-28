import type { ReactNode } from "react";

import FairPlayBanner from "./FairPlayBanner";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="app-brand" href="#top" aria-label="Chess Progress Coach — accueil">
          <span aria-hidden="true">♞</span>
          <span>
            <strong>Chess Progress Coach</strong>
            <small>Analyser · Comprendre · Progresser</small>
          </span>
        </a>
        <span className="local-badge">100 % local</span>
      </header>
      <main id="top" className="app-main">
        <FairPlayBanner />
        {children}
      </main>
      <footer className="app-footer">
        Projet open source de démonstration · Aucune assistance pendant une partie.
      </footer>
    </div>
  );
}
