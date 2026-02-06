import { useEffect, useMemo, useState } from "react";
import {
  HintLevel,
  MistakeRecord,
  TrainingHistoryEntry,
  TrainingPuzzle,
  TrainingSettings,
  recordTrainingResult,
  selectTrainingPuzzle,
} from "../services/trainingService";

const HINT_LABELS: Record<HintLevel, string> = {
  none: "Aucun indice",
  light: "Indice léger",
  standard: "Indice standard",
  full: "Solution complète",
};

const defaultSettings: TrainingSettings = {
  trainingDifficulty: 1200,
};

const defaultMistakes: MistakeRecord[] = [
  { tags: ["fork", "knight"], count: 3 },
  { tags: ["back-rank"], count: 2 },
];

export default function Training() {
  const [settings] = useState<TrainingSettings>(defaultSettings);
  const [mistakes] = useState<MistakeRecord[]>(defaultMistakes);
  const [trainingHistory, setTrainingHistory] = useState<TrainingHistoryEntry[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = window.localStorage.getItem("trainingHistory");
    return saved ? (JSON.parse(saved) as TrainingHistoryEntry[]) : [];
  });
  const [hintLevel, setHintLevel] = useState<HintLevel>("light");
  const [showSolution, setShowSolution] = useState(false);
  const [seed, setSeed] = useState(0);


  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("trainingHistory", JSON.stringify(trainingHistory));
    }
  }, [trainingHistory]);

  const puzzle = useMemo<TrainingPuzzle>(() => {
    return selectTrainingPuzzle(settings, mistakes, trainingHistory, new Date(Date.now() + seed));
  }, [settings, mistakes, trainingHistory, seed]);

  const hint = useMemo(() => {
    if (hintLevel === "none") {
      return "";
    }

    if (hintLevel === "light") {
      return `Thème: ${puzzle.tags.slice(0, 1).join(", ")}`;
    }

    if (hintLevel === "standard") {
      return `Thèmes: ${puzzle.tags.join(", ")} · Type: ${puzzle.type}`;
    }

    return `Thèmes: ${puzzle.tags.join(", ")} · Suite SAN: ${puzzle.solutionMovesSAN.join(" ")}`;
  }, [hintLevel, puzzle]);

  const handleResult = (result: "fail" | "ok") => {
    setTrainingHistory((previous) => recordTrainingResult(puzzle, result, previous));
    setShowSolution(false);
    setSeed((value) => value + 1);
  };

  return (
    <section>
      <h1>Training</h1>
      <p>Difficulté cible: {settings.trainingDifficulty}</p>

      <article>
        <h2>Puzzle</h2>
        <p><strong>FEN:</strong> {puzzle.fen}</p>
        <p><strong>Type:</strong> {puzzle.type}</p>
        <p><strong>Difficulté:</strong> {puzzle.difficulty}</p>
      </article>

      <label htmlFor="hint-level">Niveau d'indice</label>
      <select
        id="hint-level"
        value={hintLevel}
        onChange={(event) => setHintLevel(event.target.value as HintLevel)}
      >
        {(Object.keys(HINT_LABELS) as HintLevel[]).map((key) => (
          <option key={key} value={key}>
            {HINT_LABELS[key]}
          </option>
        ))}
      </select>

      {hint && <p><strong>Indice:</strong> {hint}</p>}

      <button type="button" onClick={() => setShowSolution((value) => !value)}>
        {showSolution ? "Masquer" : "Afficher"} la solution
      </button>

      {showSolution && (
        <div>
          <p><strong>Coups SAN:</strong> {puzzle.solutionMovesSAN.join(" ")}</p>
          <p>{puzzle.explanation}</p>
        </div>
      )}

      <div>
        <button type="button" onClick={() => handleResult("fail")}>Échec</button>
        <button type="button" onClick={() => handleResult("ok")}>Réussi</button>
      </div>

      <h3>Historique ({trainingHistory.length})</h3>
      <ul>
        {trainingHistory.slice().reverse().map((entry, index) => (
          <li key={`${entry.reviewedAt}-${index}`}>
            {entry.result.toUpperCase()} · revu: {new Date(entry.reviewedAt).toLocaleString()} · prochaine révision: {new Date(entry.nextReviewAt).toLocaleDateString()} · streak: {entry.okStreak}
          </li>
        ))}
      </ul>
    </section>
  );
}
