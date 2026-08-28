import type { ImportRepository, StoredGame } from "./importService";

const STORAGE_KEY = 'chess_import_games';

interface StoredRow {
  compositeKey: string;
  game: StoredGame;
}

const readRows = (): StoredRow[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as StoredRow[];
  } catch {
    return [];
  }
};

const writeRows = (rows: StoredRow[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
};

export class LocalImportRepository implements ImportRepository {
  async hasCompositeKey(compositeKey: string): Promise<boolean> {
    return readRows().some((row) => row.compositeKey === compositeKey);
  }

  async insertGame(game: StoredGame, compositeKey: string): Promise<void> {
    const rows = readRows();

    if (rows.some((row) => row.compositeKey === compositeKey)) {
      return;
    }

    rows.push({ compositeKey, game });
    writeRows(rows);
  }
}
