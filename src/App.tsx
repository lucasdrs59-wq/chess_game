import { useState } from "react";

import AppLayout from "./components/AppLayout";
import Import from "./components/Import";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Training from "./pages/Training";

const views = {
  home: { label: "Accueil", component: <Home /> },
  import: { label: "Importer", component: <Import /> },
  training: { label: "S'entraîner", component: <Training /> },
  settings: { label: "Règles", component: <Settings /> },
} as const;

type View = keyof typeof views;

export default function App() {
  const [activeView, setActiveView] = useState<View>("home");

  return (
    <AppLayout>
      <nav className="app-nav" aria-label="Navigation de l'application">
        {Object.entries(views).map(([key, view]) => (
          <button
            key={key}
            type="button"
            className={activeView === key ? "is-active" : undefined}
            aria-current={activeView === key ? "page" : undefined}
            onClick={() => setActiveView(key as View)}
          >
            {view.label}
          </button>
        ))}
      </nav>
      <div className="app-panel">{views[activeView].component}</div>
    </AppLayout>
  );
}
