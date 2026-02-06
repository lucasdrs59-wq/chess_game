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
      <section>
        <h1>Training</h1>
        <p>Aucun puzzle disponible pour le moment.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Training</h1>
      <p>Puzzle #{puzzle.id}</p>
      <p>FEN: {puzzle.fen}</p>

      <label htmlFor="hint-level">Indice:</label>
      <select
        id="hint-level"
        value={hintLevel}
        onChange={(event) => setHintLevel(event.target.value as HintLevel)}
      >
        <option value="none">none</option>
        <option value="light">light</option>
        <option value="standard">standard</option>
        <option value="full">full</option>
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

      <div>
        <button type="button" onClick={() => onResult("fail")}>Échec</button>
        <button type="button" onClick={() => onResult("ok")}>Réussi</button>
      </div>
    </section>
  );
}
