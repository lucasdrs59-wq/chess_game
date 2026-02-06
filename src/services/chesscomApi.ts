export interface ChessComPlayer {
  username?: string;
  rating?: number;
  result?: string;
}

export interface ChessComGame {
  url?: string;
  pgn?: string;
  time_class?: string;
  end_time?: number;
  rated?: boolean;
  rules?: string;
  white: ChessComPlayer;
  black: ChessComPlayer;
}

interface ArchivesResponse {
  archives: string[];
}

interface MonthlyGamesResponse {
  games: ChessComGame[];
}

const CHESS_COM_API_BASE = 'https://api.chess.com/pub/player';

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Chess.com API error ${response.status} for ${url}`);
  }

  return (await response.json()) as T;
};

export const fetchArchives = async (username: string): Promise<string[]> => {
  const normalizedUsername = username.trim().toLowerCase();

  if (!normalizedUsername) {
    throw new Error('Username is required');
  }

  const url = `${CHESS_COM_API_BASE}/${encodeURIComponent(normalizedUsername)}/games/archives`;
  const payload = await fetchJson<ArchivesResponse>(url);
  return payload.archives ?? [];
};

export const fetchMonthlyGames = async (archiveUrl: string): Promise<ChessComGame[]> => {
  if (!archiveUrl.trim()) {
    throw new Error('archiveUrl is required');
  }

  const payload = await fetchJson<MonthlyGamesResponse>(archiveUrl);
  return payload.games ?? [];
};
