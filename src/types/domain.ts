export enum TrainingDifficulty {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
}

export enum GameResult {
  Win = "win",
  Loss = "loss",
  Draw = "draw",
  Unknown = "unknown",
}

export enum MistakeSeverity {
  Inaccuracy = "inaccuracy",
  Mistake = "mistake",
  Blunder = "blunder",
}

export enum TrainingItemStatus {
  New = "new",
  Learning = "learning",
  Review = "review",
  Suspended = "suspended",
}

export interface Settings {
  id: "singleton";
  fairPlayMode: boolean;
  trainingDifficulty: TrainingDifficulty;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id?: number;
  source: "chesscom" | "lichess" | "manual";
  chesscomGameUrl?: string;
  endTime: number;
  whitePlayer: string;
  blackPlayer: string;
  result: GameResult;
  pgn: string;
  importedAt: string;
}

export interface GameMoment {
  id?: number;
  gameId: number;
  ply: number;
  fen: string;
  san?: string;
  evalCp?: number;
  createdAt: string;
}

export interface Mistake {
  id?: number;
  gameId: number;
  gameMomentId?: number;
  severity: MistakeSeverity;
  description?: string;
  fen: string;
  playedMoveSan?: string;
  bestMoveSan?: string;
  createdAt: string;
}

export interface TrainingItem {
  id?: number;
  mistakeId: number;
  status: TrainingItemStatus;
  dueAt: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingHistory {
  id?: number;
  trainingItemId: number;
  reviewedAt: string;
  quality: number;
  previousDueAt?: string;
  nextDueAt: string;
  responseTimeMs?: number;
  createdAt: string;
}
