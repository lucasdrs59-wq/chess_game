import Dexie, { type Table } from "dexie";

import {
  type Game,
  type GameMoment,
  type Mistake,
  type Settings,
  type TrainingHistory,
  type TrainingItem,
  TrainingDifficulty,
} from "../types/domain";

export class ChessTrainerDB extends Dexie {
  settings!: Table<Settings, Settings["id"]>;
  games!: Table<Game, number>;
  gameMoments!: Table<GameMoment, number>;
  mistakes!: Table<Mistake, number>;
  trainingItems!: Table<TrainingItem, number>;
  trainingHistory!: Table<TrainingHistory, number>;

  constructor() {
    super("chessTrainerDB");

    this.version(1).stores({
      settings: "id",
      games:
        "++id, [chesscomGameUrl+endTime], endTime, source, importedAt, chesscomGameUrl",
      gameMoments: "++id, gameId, [gameId+ply], createdAt",
      mistakes: "++id, gameId, gameMomentId, severity, createdAt",
      trainingItems: "++id, mistakeId, status, dueAt, updatedAt",
      trainingHistory: "++id, trainingItemId, reviewedAt, nextDueAt, createdAt",
    });

    this.on("populate", async () => {
      const nowIso = new Date().toISOString();

      await this.settings.add({
        id: "singleton",
        fairPlayMode: true,
        trainingDifficulty: TrainingDifficulty.Medium,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    });
  }
}

export const db = new ChessTrainerDB();

export async function ensureSettingsSeed(): Promise<Settings> {
  const existing = await db.settings.get("singleton");

  if (existing) {
    return existing;
  }

  const nowIso = new Date().toISOString();
  const settings: Settings = {
    id: "singleton",
    fairPlayMode: true,
    trainingDifficulty: TrainingDifficulty.Medium,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await db.settings.put(settings);

  return settings;
}
