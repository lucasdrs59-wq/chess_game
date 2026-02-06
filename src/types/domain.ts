export enum TrainingDifficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export enum TrainingResult {
  Again = 'again',
  Good = 'good',
  Easy = 'easy',
}

export enum GameResult {
  Win = 'win',
  Draw = 'draw',
  Loss = 'loss',
}

export interface Settings {
  id: 'singleton';
  fairPlayMode: boolean;
  trainingDifficulty: TrainingDifficulty;
  maxDailyReviews: number;
  createdAt: number;
  updatedAt: number;
}

export interface Game {
  id?: number;
  chesscomGameUrl: string;
  endTime: number;
  pgn: string;
  whiteUsername: string;
  blackUsername: string;
  result: GameResult;
  timeControl?: string;
  importedAt: number;
}

export interface GameMoment {
  id?: number;
  gameId: number;
  ply: number;
  fen: string;
  san?: string;
  evaluationCp?: number;
  createdAt: number;
}

export interface Mistake {
  id?: number;
  gameId: number;
  gameMomentId?: number;
  ply: number;
  fen: string;
  bestMove?: string;
  playedMove?: string;
  severity: number;
  createdAt: number;
}

export interface TrainingItem {
  id?: number;
  mistakeId: number;
  fen: string;
  bestMove: string;
  prompt?: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextDueAt: number;
  lastReviewedAt?: number;
  suspended?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TrainingHistory {
  id?: number;
  trainingItemId: number;
  reviewedAt: number;
  result: TrainingResult;
  nextDueAt: number;
  responseTimeMs?: number;
}
