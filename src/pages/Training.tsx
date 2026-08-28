import { useMemo, useState } from "react";
import {
  HintLevel,
  Mistake,
  Settings,
  TrainingHistoryItem,
  recordTrainingResult,
  selectTrainingPuzzle,
} from "../services/trainingService";

const TRAINING_HISTORY_KEY = "trainingHistory";

const loadHistory = (): TrainingHistoryItem[] => {
  const raw = localStorage.getItem(TRAINING_HISTORY_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as TrainingHistoryItem[];
  } catch {
    return [];
  }
};

const saveHistory = (history: TrainingHistoryItem[]): void => {
  localStorage.setItem(TRAINING_HISTORY_KEY, JSON.stringify(history));
};

const settings: Settings = {
  trainingDifficulty: 1200,
};

const mistakes: Mistake[] = [
  { category: "fork", createdAt: new Date().toISOString() },
  { category: "back-rank", createdAt: new Date().toISOString() },
  { category: "fork", createdAt: new Date().toISOString() },
];

export default function Training() {
  const [history, setHistory] = useState<TrainingHistoryItem[]>(() => loadHistory());
  const [hintLevel, setHintLevel] = useState<HintLevel>("light");
  const [solutionVisible, setSolutionVisible] = useState(false);

  const puzzle = useMemo(
    () =>
      selectTrainingPuzzle({
        settings,
        mistakes,
        history,
      }),
    [history],
  );

  const hintText = useMemo(() => {
    if (!puzzle || hintLevel === "none") {
      return "Aucun indice.";
    }
    if (hintLevel === "light") {
      return `Thème principal : ${puzzle.tags.join(", ")}. Difficulté estimée ${puzzle.difficulty}.`;
    }
    if (hintLevel === "standard") {
      return `Premier coup candidat : ${puzzle.solutionMovesSAN[0]}.`;
    }
    return `Ligne complète : ${puzzle.solutionMovesSAN.join(" ")} — ${puzzle.explanation}`;
  }, [puzzle, hintLevel]);

  const onResult = (result: "fail" | "ok") => {
    if (!puzzle) {
      return;
    }
    const nextHistory = recordTrainingResult({
      history,
      puzzleId: puzzle.id,
      result,
    });
    setHistory(nextHistory);
    saveHistory(nextHistory);
    setSolutionVisible(false);
  };

  if (!puzzle) {
    return (
      <section className="content-page">
        <h1>Entraînement</h1>
        <p>Aucun puzzle disponible pour le moment.</p>
      </section>
    );
  }

  return (
    <section className="content-page" aria-labelledby="training-heading">
      <p className="eyebrow">Répétition espacée</p>
      <h1 id="training-heading">Entraînement ciblé</h1>
      <div className="puzzle-card">
        <div><span>Puzzle</span><strong>#{puzzle.id}</strong></div>
        <div><span>Difficulté</span><strong>{puzzle.difficulty}</strong></div>
        <div><span>Thèmes</span><strong>{puzzle.tags.join(" · ")}</strong></div>
      </div>
      <details className="fen-details">
        <summary>Position FEN</summary>
        <code>{puzzle.fen}</code>
      </details>

      <label htmlFor="hint-level">Niveau d'indice</label>
      <select
        id="hint-level"
        value={hintLevel}
        onChange={(event) => setHintLevel(event.target.value as HintLevel)}
      >
        <option value="none">Aucun</option>
        <option value="light">Léger</option>
        <option value="standard">Standard</option>
        <option value="full">Complet</option>
      </select>

      <p>{hintText}</p>

      <button type="button" onClick={() => setSolutionVisible((value) => !value)}>
        {solutionVisible ? "Masquer la solution" : "Afficher la solution"}
      </button>

      {solutionVisible && (
        <div>
          <p>Solution SAN: {puzzle.solutionMovesSAN.join(" ")}</p>
          <p>{puzzle.explanation}</p>
        </div>
      )}

      <div className="result-actions">
        <button type="button" className="secondary" onClick={() => onResult("fail")}>À revoir</button>
        <button type="button" onClick={() => onResult("ok")}>Réussi</button>
      </div>
    </section>
  );
}
