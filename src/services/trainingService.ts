import trainingPack from "../data/training-pack.json";

export type HintLevel = "none" | "light" | "standard" | "full";

export interface TrainingPuzzle {
  type: string;
  tags: string[];
  difficulty: number;
  fen: string;
  solutionMovesSAN: string[];
  explanation: string;
}

export interface TrainingSettings {
  trainingDifficulty: number;
  difficultyWindow?: number;
}

export interface MistakeRecord {
  tags: string[];
  count?: number;
}

export type TrainingResult = "fail" | "ok";

export interface TrainingHistoryEntry {
  puzzleFen: string;
  result: TrainingResult;
  reviewedAt: string;
  nextReviewAt: string;
  okStreak: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const TRAINING_PACK: TrainingPuzzle[] = trainingPack as TrainingPuzzle[];

export const getDifficultyWindow = (settings: TrainingSettings): [number, number] => {
  const center = settings.trainingDifficulty;
  const halfWindow = settings.difficultyWindow ?? 150;
  return [center - halfWindow, center + halfWindow];
};

const getTagWeights = (mistakes: MistakeRecord[]): Map<string, number> => {
  const weights = new Map<string, number>();
  for (const item of mistakes) {
    const count = item.count ?? 1;
    for (const tag of item.tags) {
      weights.set(tag, (weights.get(tag) ?? 0) + count);
    }
  }
  return weights;
};

const getLatestHistory = (
  history: TrainingHistoryEntry[],
  fen: string,
): TrainingHistoryEntry | undefined => {
  return history
    .filter((entry) => entry.puzzleFen === fen)
    .sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime())[0];
};

const isDue = (entry: TrainingHistoryEntry | undefined, now: Date): boolean => {
  if (!entry) {
    return true;
  }

  return new Date(entry.nextReviewAt).getTime() <= now.getTime();
};

const scorePuzzle = (
  puzzle: TrainingPuzzle,
  mistakes: MistakeRecord[],
  history: TrainingHistoryEntry[],
  now: Date,
): number => {
  const weights = getTagWeights(mistakes);
  const historyEntry = getLatestHistory(history, puzzle.fen);

  const tagScore = puzzle.tags.reduce((sum, tag) => sum + (weights.get(tag) ?? 0), 0);
  const dueBoost = isDue(historyEntry, now) ? 25 : -100;
  const failBoost = historyEntry?.result === "fail" ? 15 : 0;

  return tagScore + dueBoost + failBoost + Math.random();
};

export const selectTrainingPuzzle = (
  settings: TrainingSettings,
  mistakes: MistakeRecord[] = [],
  history: TrainingHistoryEntry[] = [],
  now: Date = new Date(),
): TrainingPuzzle => {
  const [minDifficulty, maxDifficulty] = getDifficultyWindow(settings);
  const candidates = TRAINING_PACK.filter(
    (puzzle) => puzzle.difficulty >= minDifficulty && puzzle.difficulty <= maxDifficulty,
  );

  const pool = candidates.length > 0 ? candidates : TRAINING_PACK;

  return [...pool].sort(
    (a, b) => scorePuzzle(b, mistakes, history, now) - scorePuzzle(a, mistakes, history, now),
  )[0];
};

export const computeNextReviewAt = (
  result: TrainingResult,
  previousEntries: TrainingHistoryEntry[],
  now: Date = new Date(),
): { nextReviewAt: string; okStreak: number } => {
  if (result === "fail") {
    return {
      nextReviewAt: new Date(now.getTime() + DAY_MS).toISOString(),
      okStreak: 0,
    };
  }

  const previousOkStreak = previousEntries
    .slice()
    .sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime())
    .find((entry) => entry.result === "ok")?.okStreak ?? 0;

  const nextStreak = previousOkStreak + 1;
  const dayOffset = nextStreak === 1 ? 3 : nextStreak === 2 ? 7 : 14;

  return {
    nextReviewAt: new Date(now.getTime() + dayOffset * DAY_MS).toISOString(),
    okStreak: nextStreak,
  };
};

export const recordTrainingResult = (
  puzzle: TrainingPuzzle,
  result: TrainingResult,
  history: TrainingHistoryEntry[],
  now: Date = new Date(),
): TrainingHistoryEntry[] => {
  const puzzleHistory = history.filter((entry) => entry.puzzleFen === puzzle.fen);
  const { nextReviewAt, okStreak } = computeNextReviewAt(result, puzzleHistory, now);

  const nextEntry: TrainingHistoryEntry = {
    puzzleFen: puzzle.fen,
    result,
    reviewedAt: now.toISOString(),
    nextReviewAt,
    okStreak,
  };

  return [...history, nextEntry];
};
