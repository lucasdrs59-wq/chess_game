import { Chess, type PieceSymbol, type Square } from 'chess.js';

export interface ParsedPly {
  plyIndex: number;
  moveNumber: number;
  color: 'w' | 'b';
  san: string;
  lan: string;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  fenBefore: string;
  fenAfter: string;
}

export interface ParsedGame {
  tags: Record<string, string>;
  moves: string[];
  plies: ParsedPly[];
  initialFen: string;
  finalFen: string;
}

const TAG_REGEX = /^\[(\w+)\s+"(.*)"\]$/;

function extractTags(pgn: string): Record<string, string> {
  return pgn
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('[') && line.endsWith(']'))
    .reduce<Record<string, string>>((acc, line) => {
      const match = line.match(TAG_REGEX);
      if (match) {
        const [, key, value] = match;
        acc[key] = value;
      }
      return acc;
    }, {});
}

export function parsePgn(pgn: string): ParsedGame {
  const chess = new Chess();
  const loaded = chess.loadPgn(pgn, { strict: false });

  if (!loaded) {
    throw new Error('PGN invalide: impossible de parser la partie.');
  }

  const tags = extractTags(pgn);
  const replay = new Chess();
  const history = chess.history({ verbose: true });

  const plies: ParsedPly[] = history.map((move, index) => {
    const fenBefore = replay.fen();
    replay.move(move);
    const fenAfter = replay.fen();

    return {
      plyIndex: index,
      moveNumber: move.moveNumber,
      color: move.color,
      san: move.san,
      lan: move.lan,
      from: move.from,
      to: move.to,
      piece: move.piece,
      captured: move.captured,
      fenBefore,
      fenAfter,
    };
  });

  return {
    tags,
    moves: history.map((move) => move.san),
    plies,
    initialFen: plies[0]?.fenBefore ?? chess.fen(),
    finalFen: plies[plies.length - 1]?.fenAfter ?? chess.fen(),
  };
}
