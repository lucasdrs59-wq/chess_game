import { defaultHeuristics, type HeuristicResult } from './heuristics';
import { parsePgn, type ParsedGame } from './pgnParser';

export interface GameMoment extends HeuristicResult {
  plyIndex: number;
  fenBefore: string;
  fenAfter: string;
}

export interface ImportedGameAnalysis {
  id: string;
  importedAt: string;
  tags: Record<string, string>;
  moves: string[];
  mistakes: GameMoment[];
  gameMoments: GameMoment[];
}

const STORAGE_KEY = 'chess-game-analysis';

function toGameMoment(base: HeuristicResult, parsedGame: ParsedGame, plyIndex: number): GameMoment {
  const ply = parsedGame.plies[plyIndex];
  return {
    ...base,
    plyIndex,
    fenBefore: ply.fenBefore,
    fenAfter: ply.fenAfter,
  };
}

function getSeverityWeight(severity: HeuristicResult['severity']): number {
  if (severity === 'high') return 3;
  if (severity === 'medium') return 2;
  return 1;
}

export function analyzeImportedGame(pgn: string): ImportedGameAnalysis {
  const parsed = parsePgn(pgn);

  const gameMoments: GameMoment[] = [];

  parsed.plies.forEach((ply, plyIndex) => {
    for (const heuristic of defaultHeuristics) {
      const result = heuristic({ ply, totalPlies: parsed.plies.length });
      if (result) {
        gameMoments.push(toGameMoment(result, parsed, plyIndex));
      }
    }
  });

  const mistakes = gameMoments
    .filter((moment) => getSeverityWeight(moment.severity) >= 2)
    .sort((a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity));

  const analysis: ImportedGameAnalysis = {
    id: crypto.randomUUID(),
    importedAt: new Date().toISOString(),
    tags: parsed.tags,
    moves: parsed.moves,
    mistakes,
    gameMoments,
  };

  persistAnalysis(analysis);
  return analysis;
}

export function readPersistedAnalyses(): ImportedGameAnalysis[] {
  if (typeof localStorage === 'undefined') return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ImportedGameAnalysis[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistAnalysis(analysis: ImportedGameAnalysis): void {
  if (typeof localStorage === 'undefined') return;
  const all = readPersistedAnalyses();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([analysis, ...all]));
}
