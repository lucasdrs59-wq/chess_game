import { ChessComGame, fetchArchives, fetchMonthlyGames } from './chesscomApi';

export interface ImportFilters {
  timeClass?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface ImportOptions {
  monthsToImport?: number;
  filters?: ImportFilters;
  maxRetries429?: number;
  initialBackoffMs?: number;
}

export interface StoredGame {
  source: 'chesscom';
  username: string;
  sourceUrl: string;
  whiteUsername: string;
  blackUsername: string;
  endTime: number;
  timeClass?: string;
  pgn?: string;
  raw: ChessComGame;
}

export interface ImportRepository {
  hasCompositeKey(compositeKey: string): Promise<boolean>;
  insertGame(game: StoredGame, compositeKey: string): Promise<void>;
}

export interface ImportProgress {
  currentMonth: number;
  totalMonths: number;
  imported: number;
  skipped: number;
  errors: number;
  archiveUrl?: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
}

const DEFAULT_MONTHS = 3;
const DEFAULT_MAX_RETRIES_429 = 4;
const DEFAULT_INITIAL_BACKOFF_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runWithRetry429 = async <T>(
  operation: () => Promise<T>,
  maxRetries: number,
  initialBackoffMs: number,
): Promise<T> => {
  let attempt = 0;
  let backoffMs = initialBackoffMs;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      const isRateLimitError =
        error instanceof Error && /\b429\b/.test(error.message);

      if (!isRateLimitError || attempt >= maxRetries) {
        throw error;
      }

      await sleep(backoffMs);
      backoffMs *= 2;
      attempt += 1;
    }
  }
};

const buildCompositeKey = (username: string, game: ChessComGame): string => {
  const white = game.white?.username?.toLowerCase() ?? '';
  const black = game.black?.username?.toLowerCase() ?? '';
  const endTime = game.end_time ?? 0;
  const timeClass = game.time_class ?? 'unknown';
  const sourceUrl = game.url ?? '';

  return [
    'chesscom',
    username.toLowerCase(),
    sourceUrl,
    String(endTime),
    white,
    black,
    timeClass,
  ].join('|');
};

const isGameFromUser = (username: string, game: ChessComGame): boolean => {
  const normalizedUsername = username.toLowerCase();
  const whiteUsername = game.white?.username?.toLowerCase();
  const blackUsername = game.black?.username?.toLowerCase();

  return whiteUsername === normalizedUsername || blackUsername === normalizedUsername;
};

const isGameInDateRange = (game: ChessComGame, fromDate?: Date, toDate?: Date): boolean => {
  if (!game.end_time) {
    return false;
  }

  const gameDate = new Date(game.end_time * 1000);

  if (fromDate && gameDate < fromDate) {
    return false;
  }

  if (toDate && gameDate > toDate) {
    return false;
  }

  return true;
};

const shouldImportGame = (
  username: string,
  game: ChessComGame,
  filters?: ImportFilters,
): boolean => {
  if (!isGameFromUser(username, game)) {
    return false;
  }

  if (filters?.timeClass && game.time_class !== filters.timeClass) {
    return false;
  }

  return isGameInDateRange(game, filters?.fromDate, filters?.toDate);
};

const pickMostRecentArchives = (archives: string[], count: number): string[] => {
  return [...archives].sort().slice(-count).reverse();
};

export const importRecentGames = async (
  username: string,
  repository: ImportRepository,
  options: ImportOptions = {},
  onProgress?: (progress: ImportProgress) => void,
): Promise<ImportResult> => {
  const monthsToImport = options.monthsToImport ?? DEFAULT_MONTHS;
  const maxRetries429 = options.maxRetries429 ?? DEFAULT_MAX_RETRIES_429;
  const initialBackoffMs = options.initialBackoffMs ?? DEFAULT_INITIAL_BACKOFF_MS;

  const archives = await runWithRetry429(
    () => fetchArchives(username),
    maxRetries429,
    initialBackoffMs,
  );

  const selectedArchives = pickMostRecentArchives(archives, monthsToImport);

  const result: ImportResult = {
    imported: 0,
    skipped: 0,
    errors: 0,
  };

  for (let index = 0; index < selectedArchives.length; index += 1) {
    const archiveUrl = selectedArchives[index];

    try {
      const games = await runWithRetry429(
        () => fetchMonthlyGames(archiveUrl),
        maxRetries429,
        initialBackoffMs,
      );

      for (const game of games) {
        if (!shouldImportGame(username, game, options.filters)) {
          result.skipped += 1;
          continue;
        }

        const compositeKey = buildCompositeKey(username, game);
        const alreadyExists = await repository.hasCompositeKey(compositeKey);

        if (alreadyExists) {
          result.skipped += 1;
          continue;
        }

        const storedGame: StoredGame = {
          source: 'chesscom',
          username: username.toLowerCase(),
          sourceUrl: game.url ?? '',
          whiteUsername: game.white?.username ?? '',
          blackUsername: game.black?.username ?? '',
          endTime: game.end_time ?? 0,
          timeClass: game.time_class,
          pgn: game.pgn,
          raw: game,
        };

        await repository.insertGame(storedGame, compositeKey);
        result.imported += 1;
      }
    } catch (error) {
      result.errors += 1;
      if (error instanceof Error) {
        // noop: keep error information available while allowing the import loop to continue.
      }
    }

    onProgress?.({
      currentMonth: index + 1,
      totalMonths: selectedArchives.length,
      archiveUrl,
      ...result,
    });
  }

  return result;
};
