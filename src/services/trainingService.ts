import trainingPack from "../data/training-pack.json";

export type HintLevel = "none" | "light" | "standard" | "full";

export interface Settings {
  trainingDifficulty: number;
}

export interface Mistake {
  category: string;
  createdAt: string;
}

export interface TrainingPuzzle {
  id: string;
  type: string;
  tags: string[];
  difficulty: number;
  fen: string;
  solutionMovesSAN: string[];
  explanation: string;
}

export interface TrainingHistoryItem {
  puzzleId: string;
  result: "fail" | "ok";
  reviewedAt: string;
  nextReviewAt: string;
}

const DEFAULT_DIFFICULTY = 1200;
const DEFAULT_DIFFICULTY_WINDOW = 150;

const toTime = (dateLike: string | Date): number =>
  typeof dateLike === "string" ? new Date(dateLike).getTime() : dateLike.getTime();

const addDays = (baseDate: Date, days: number): string => {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString();
};

const countByCategory = (mistakes: Mistake[]): Record<string, number> => {
  return mistakes.reduce<Record<string, number>>((acc, mistake) => {
    acc[mistake.category] = (acc[mistake.category] ?? 0) + 1;
    return acc;
  }, {});
};

const getConsecutiveSuccesses = (
  puzzleId: string,
  history: TrainingHistoryItem[],
): number => {
  const results = history
    .filter((entry) => entry.puzzleId === puzzleId)
    .sort((a, b) => toTime(b.reviewedAt) - toTime(a.reviewedAt));

  let streak = 0;
  for (const item of results) {
    if (item.result !== "ok") {
      break;
    }
    streak += 1;
  }
  return streak;
};

export const getTrainingPack = (): TrainingPuzzle[] => {
  return trainingPack as TrainingPuzzle[];
};

export const selectTrainingPuzzle = ({
  settings,
  mistakes,
  history,
  now = new Date(),
  difficultyWindow = DEFAULT_DIFFICULTY_WINDOW,
}: {
  settings?: Settings;
  mistakes: Mistake[];
  history: TrainingHistoryItem[];
  now?: Date;
  difficultyWindow?: number;
}): TrainingPuzzle | null => {
  const difficultyTarget = settings?.trainingDifficulty ?? DEFAULT_DIFFICULTY;
  const pack = getTrainingPack();

  const dueById = new Map<string, TrainingHistoryItem>();
  for (const entry of history) {
    const previous = dueById.get(entry.puzzleId);
    if (!previous || toTime(previous.reviewedAt) < toTime(entry.reviewedAt)) {
      dueById.set(entry.puzzleId, entry);
    }
  }

  const duePuzzles = pack.filter((puzzle) => {
    const last = dueById.get(puzzle.id);
    return !last || toTime(last.nextReviewAt) <= now.getTime();
  });

  const inRange = duePuzzles.filter(
    (puzzle) =>
      puzzle.difficulty >= difficultyTarget - difficultyWindow &&
      puzzle.difficulty <= difficultyTarget + difficultyWindow,
  );

  const pool = inRange.length > 0 ? inRange : duePuzzles;
  if (pool.length === 0) {
    return null;
  }

  const categoryCounts = countByCategory(mistakes);

  const scored = pool.map((puzzle) => {
    const categoryWeight = puzzle.tags.reduce(
      (sum, tag) => sum + (categoryCounts[tag] ?? 0),
      0,
    );
    const distance = Math.abs(puzzle.difficulty - difficultyTarget);
    return {
      puzzle,
      score: categoryWeight * 1000 - distance,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].puzzle;
};

export const scheduleNextReview = ({
  puzzleId,
  result,
  history,
  now = new Date(),
}: {
  puzzleId: string;
  result: "fail" | "ok";
  history: TrainingHistoryItem[];
  now?: Date;
}): TrainingHistoryItem => {
  const streak = getConsecutiveSuccesses(puzzleId, history);

  let intervalDays = 1;
  if (result === "ok") {
    if (streak <= 0) {
      intervalDays = 3;
    } else if (streak === 1) {
      intervalDays = 7;
    } else {
      intervalDays = 14;
    }
  }

  return {
    puzzleId,
    result,
    reviewedAt: now.toISOString(),
    nextReviewAt: addDays(now, intervalDays),
  };
};

export const recordTrainingResult = ({
  history,
  puzzleId,
  result,
  now = new Date(),
}: {
  history: TrainingHistoryItem[];
  puzzleId: string;
  result: "fail" | "ok";
  now?: Date;
}): TrainingHistoryItem[] => {
  const newEntry = scheduleNextReview({
    puzzleId,
    result,
    history,
    now,
  });

  return [...history, newEntry];
};
