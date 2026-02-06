export interface ChessComPlayer {
  username?: string;
  rating?: number;
  result?: string;
}

export interface ChessComGame {
  url: string;
  pgn?: string;
  time_class?: string;
  end_time?: number;
  start_time?: number;
  rated?: boolean;
  white?: ChessComPlayer;
  black?: ChessComPlayer;
  [key: string]: unknown;
}

export interface ChessComArchivesResponse {
  archives: string[];
}

export interface ChessComGamesResponse {
  games: ChessComGame[];
}

export class ChessComHttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ChessComHttpError';
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new ChessComHttpError(response.status, `Chess.com API error (${response.status}) on ${url}`);
  }

  return (await response.json()) as T;
}

export async function fetchArchives(username: string): Promise<string[]> {
  const normalizedUsername = username.trim();
  if (!normalizedUsername) {
    throw new Error('Username is required to fetch archives.');
  }

  const url = `https://api.chess.com/pub/player/${encodeURIComponent(normalizedUsername)}/games/archives`;
  const data = await fetchJson<ChessComArchivesResponse>(url);

  return Array.isArray(data.archives) ? data.archives : [];
}

export async function fetchMonthlyGames(archiveUrl: string): Promise<ChessComGame[]> {
  if (!archiveUrl) {
    throw new Error('archiveUrl is required to fetch monthly games.');
  }

  const data = await fetchJson<ChessComGamesResponse>(archiveUrl);
  return Array.isArray(data.games) ? data.games : [];
}
