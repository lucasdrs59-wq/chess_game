import Dexie, { type Table } from 'dexie';

import {
  type Game,
  type GameMoment,
  type Mistake,
  type Settings,
  TrainingDifficulty,
  type TrainingHistory,
  type TrainingItem,
} from '../types/domain';

const SETTINGS_SINGLETON_ID = 'singleton' as const;

class ChessGameDatabase extends Dexie {
  settings!: Table<Settings, Settings['id']>;
  games!: Table<Game, number>;
  gameMoments!: Table<GameMoment, number>;
  mistakes!: Table<Mistake, number>;
  trainingItems!: Table<TrainingItem, number>;
  trainingHistory!: Table<TrainingHistory, number>;

  constructor() {
    super('chessGameDb');

    this.version(1).stores({
      settings: 'id',
      games: '++id, &[chesscomGameUrl+endTime], endTime, importedAt',
      gameMoments: '++id, gameId, [gameId+ply], createdAt',
      mistakes: '++id, gameId, gameMomentId, [gameId+ply], severity, createdAt',
      trainingItems: '++id, mistakeId, nextDueAt, suspended, updatedAt',
      trainingHistory: '++id, trainingItemId, reviewedAt, nextDueAt',
    });

    this.on('populate', () => {
      const now = Date.now();

      return this.settings.add({
        id: SETTINGS_SINGLETON_ID,
        fairPlayMode: true,
        trainingDifficulty: TrainingDifficulty.Medium,
        maxDailyReviews: 30,
        createdAt: now,
        updatedAt: now,
      });
    });
  }
}

export const db = new ChessGameDatabase();

export async function ensureSettingsSeed(): Promise<Settings> {
  const existing = await db.settings.get(SETTINGS_SINGLETON_ID);

  if (existing) {
    return existing;
  }

  const now = Date.now();
  const seededSettings: Settings = {
    id: SETTINGS_SINGLETON_ID,
    fairPlayMode: true,
    trainingDifficulty: TrainingDifficulty.Medium,
    maxDailyReviews: 30,
    createdAt: now,
    updatedAt: now,
  };

  await db.settings.put(seededSettings);
  return seededSettings;
}
