import { useState } from "react";

import AppLayout from "./components/AppLayout";
import HomePanel from "./features/home/HomePanel";
import ImportPanel from "./features/import/ImportPanel";
import PolicyPanel from "./features/policy/PolicyPanel";
import TrainingPanel from "./features/training/TrainingPanel";

const views = {
  home: { label: "Accueil", component: <HomePanel /> },
  import: { label: "Importer", component: <ImportPanel /> },
  training: { label: "S'entraîner", component: <TrainingPanel /> },
  policy: { label: "Règles", component: <PolicyPanel /> },
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
