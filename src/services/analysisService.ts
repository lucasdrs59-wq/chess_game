import { parsePgnCollection, ParsedPgnGame } from './pgnParser';
import {
  detectBadTrade,
  detectHungPiece,
  detectKingSafety,
  detectOpeningPrinciple,
  HeuristicFinding,
} from './heuristics';

export type GameMoment = {
  plyIndex: number;
  fenBefore: string;
  fenAfter: string;
  momentType: HeuristicFinding['momentType'];
  note: string;
};

export type AnalyzedGame = ParsedPgnGame & {
  mistakes: GameMoment[];
  gameMoments: GameMoment[];
};

const STORAGE_KEY = 'chess_game_analysis';

function evaluatePly(plyIndex: number, fenBefore: string, fenAfter: string): GameMoment[] {
  const findings = [
    detectHungPiece(fenBefore, fenAfter),
    detectBadTrade(fenBefore, fenAfter),
    detectOpeningPrinciple(fenBefore, fenAfter, plyIndex),
    detectKingSafety(fenBefore, fenAfter, plyIndex),
  ].filter(Boolean) as HeuristicFinding[];

  return findings.map((finding) => ({
    plyIndex,
    fenBefore,
    fenAfter,
    momentType: finding.momentType,
    note: finding.note,
  }));
}

export function analyzeImportedGames(rawPgn: string): AnalyzedGame[] {
  const games = parsePgnCollection(rawPgn);

  const analyzed = games.map<AnalyzedGame>((game) => {
    const gameMoments = game.fenByPly.flatMap((fenAfter, plyIndex) => {
      if (plyIndex === 0) {
        return [];
      }
      const fenBefore = game.fenByPly[plyIndex - 1];
      return evaluatePly(plyIndex, fenBefore, fenAfter);
    });

    const mistakes = gameMoments.filter((moment) =>
      ['hung_piece', 'bad_trade', 'opening_principle', 'king_safety'].includes(moment.momentType),
    );

    return {
      ...game,
      mistakes,
      gameMoments,
    };
  });

  persistAnalysis(analyzed);
  return analyzed;
}

export function persistAnalysis(games: AnalyzedGame[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function loadPersistedAnalysis(): AnalyzedGame[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as AnalyzedGame[];
  } catch {
    return [];
  }
}
