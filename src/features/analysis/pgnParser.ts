import { Chess } from 'chess.js';

export type ParsedPgnGame = {
  tags: Record<string, string>;
  moves: string[];
  fenByPly: string[];
};

const TAG_REGEX = /^\[(\w+)\s+"(.*)"\]$/;

export function splitPgnGames(rawPgn: string): string[] {
  return rawPgn
    .split(/\n\s*\n(?=\[Event\s+")/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

export function extractTags(pgn: string): Record<string, string> {
  const tags: Record<string, string> = {};
  for (const line of pgn.split('\n')) {
    const tagMatch = line.trim().match(TAG_REGEX);
    if (!tagMatch) {
      continue;
    }
    const [, key, value] = tagMatch;
    tags[key] = value;
  }
  return tags;
}

export function parsePgnGame(pgn: string): ParsedPgnGame {
  const chess = new Chess();
  chess.loadPgn(pgn, { strict: false });

  const replay = new Chess();
  const moves = chess.history();
  const fenByPly: string[] = [replay.fen()];

  for (const move of moves) {
    replay.move(move);
    fenByPly.push(replay.fen());
  }

  return {
    tags: extractTags(pgn),
    moves,
    fenByPly,
  };
}

export function parsePgnCollection(rawPgn: string): ParsedPgnGame[] {
  return splitPgnGames(rawPgn).map(parsePgnGame);
}
