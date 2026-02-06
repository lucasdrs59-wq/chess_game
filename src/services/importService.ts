import { ChessComGame, ChessComHttpError, fetchArchives, fetchMonthlyGames } from './chesscomApi';

export interface ImportProgress {
  currentMonth: number;
  totalMonths: number;
  archiveUrl?: string;
  imported: number;
  skipped: number;
  errors: number;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
}

export interface ImportOptions {
  username: string;
  months?: number;
  timeClass?: string;
  fromDate?: Date;
  toDate?: Date;
  maxRetries?: number;
  initialBackoffMs?: number;
  getExistingKeys: () => Promise<Set<string>>;
  saveGames: (games: ChessComGame[]) => Promise<number>;
  onProgress?: (progress: ImportProgress) => void;
}

const ARCHIVE_PATTERN = /\/(\d{4})\/(\d{2})$/;

function monthIdentifier(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  return `${year}/${month}`;
}

function computeRecentMonths(monthCount: number): string[] {
  const now = new Date();
  const target: string[] = [];

  for (let offset = 0; offset < monthCount; offset += 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    target.push(monthIdentifier(date));
  }

  return target;
}

function getGameTimestamp(game: ChessComGame): number | null {
  if (typeof game.end_time === 'number') {
    return game.end_time;
  }

  if (typeof game.start_time === 'number') {
    return game.start_time;
  }

  return null;
}

export function buildLogicalGameKey(game: ChessComGame): string {
  const white = game.white?.username?.toLowerCase() ?? '';
  const black = game.black?.username?.toLowerCase() ?? '';
  const endTime = game.end_time ?? game.start_time ?? 0;
  const timeClass = game.time_class ?? '';
  const rated = game.rated ? '1' : '0';
  const pgnFallback = game.pgn ?? '';

  return [white, black, endTime, timeClass, rated, game.url ?? '', pgnFallback].join('|');
}

function shouldKeepGame(game: ChessComGame, username: string, timeClass?: string, fromDate?: Date, toDate?: Date): boolean {
  const normalized = username.toLowerCase();
  const white = game.white?.username?.toLowerCase();
  const black = game.black?.username?.toLowerCase();
  const isUserGame = white === normalized || black === normalized;

  if (!isUserGame) {
    return false;
  }

  if (timeClass && game.time_class !== timeClass) {
    return false;
  }

  const timestamp = getGameTimestamp(game);
  if (timestamp == null) {
    return false;
  }

  if (fromDate && timestamp * 1000 < fromDate.getTime()) {
    return false;
  }

  if (toDate && timestamp * 1000 > toDate.getTime()) {
    return false;
  }

  return true;
}

function extractArchiveId(archiveUrl: string): string | null {
  const match = archiveUrl.match(ARCHIVE_PATTERN);
  if (!match) {
    return null;
  }

  return `${match[1]}/${match[2]}`;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchMonthlyGamesWithRetry(archiveUrl: string, maxRetries: number, initialBackoffMs: number): Promise<ChessComGame[]> {
  let attempt = 0;

  while (true) {
    try {
      return await fetchMonthlyGames(archiveUrl);
    } catch (error) {
      const is429 = error instanceof ChessComHttpError && error.status === 429;

      if (!is429 || attempt >= maxRetries) {
        throw error;
      }

      const waitMs = initialBackoffMs * 2 ** attempt;
      await sleep(waitMs);
      attempt += 1;
    }
  }
}

export async function importChessComGames(options: ImportOptions): Promise<ImportResult> {
  const {
    username,
    months = 3,
    timeClass,
    fromDate,
    toDate,
    maxRetries = 4,
    initialBackoffMs = 500,
    getExistingKeys,
    saveGames,
    onProgress,
  } = options;

  if (!username.trim()) {
    throw new Error('username is required.');
  }

  const totalMonths = Math.max(1, months);
  const targetMonths = new Set(computeRecentMonths(totalMonths));
  const archives = await fetchArchives(username);
  const selectedArchives = archives
    .map((archiveUrl) => ({ archiveUrl, archiveId: extractArchiveId(archiveUrl) }))
    .filter((value): value is { archiveUrl: string; archiveId: string } => value.archiveId !== null)
    .filter(({ archiveId }) => targetMonths.has(archiveId))
    .sort((a, b) => (a.archiveId < b.archiveId ? 1 : -1));

  const existingKeys = await getExistingKeys();
  const counters: ImportResult = {
    imported: 0,
    skipped: 0,
    errors: 0,
  };

  for (let index = 0; index < selectedArchives.length; index += 1) {
    const { archiveUrl } = selectedArchives[index];

    try {
      const games = await fetchMonthlyGamesWithRetry(archiveUrl, maxRetries, initialBackoffMs);
      const filtered = games.filter((game) => shouldKeepGame(game, username, timeClass, fromDate, toDate));
      const toInsert: ChessComGame[] = [];

      for (const game of filtered) {
        const key = buildLogicalGameKey(game);

        if (existingKeys.has(key)) {
          counters.skipped += 1;
          continue;
        }

        existingKeys.add(key);
        toInsert.push(game);
      }

      if (toInsert.length > 0) {
        const insertedCount = await saveGames(toInsert);
        counters.imported += insertedCount;
        counters.skipped += toInsert.length - insertedCount;
      }

    } catch {
      counters.errors += 1;
    }

    onProgress?.({
      currentMonth: index + 1,
      totalMonths: selectedArchives.length,
      archiveUrl,
      imported: counters.imported,
      skipped: counters.skipped,
      errors: counters.errors,
    });
  }

  return counters;
}
