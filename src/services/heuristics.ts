import { Chess, type Color, type Piece, type PieceSymbol, type Square } from 'chess.js';
import type { ParsedPly } from './pgnParser';

export type MomentType = 'hungPiece' | 'badTrade' | 'openingPrinciple' | 'kingSafety';

export interface HeuristicResult {
  momentType: MomentType;
  note: string;
  severity: 'low' | 'medium' | 'high';
}

export interface PlyAnalysisInput {
  ply: ParsedPly;
  totalPlies: number;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

function allSquares(): Square[] {
  return FILES.flatMap((file) => RANKS.map((rank) => `${file}${rank}` as Square));
}

function findKingSquare(chess: Chess, color: Color): Square | null {
  for (const square of allSquares()) {
    const piece = chess.get(square);
    if (piece?.type === 'k' && piece.color === color) {
      return square;
    }
  }
  return null;
}

function getMovedPieceAt(chess: Chess, square: Square): Piece | null {
  return chess.get(square);
}

function pieceIsDefended(chess: Chess, square: Square, color: Color): boolean {
  return chess.moves({ verbose: true }).some((m) => m.color === color && m.to === square);
}

export function detectHungPiece(input: PlyAnalysisInput): HeuristicResult | null {
  const { ply } = input;
  const boardAfter = new Chess(ply.fenAfter);
  const movedPiece = getMovedPieceAt(boardAfter, ply.to);

  if (!movedPiece || movedPiece.color !== ply.color) {
    return null;
  }

  const enemyColor: Color = ply.color === 'w' ? 'b' : 'w';
  const attackedByEnemy = boardAfter.moves({ verbose: true }).some((m) => m.color === enemyColor && m.to === ply.to);
  const defended = pieceIsDefended(boardAfter, ply.to, ply.color);

  if (attackedByEnemy && !defended && PIECE_VALUES[movedPiece.type] >= 3) {
    return {
      momentType: 'hungPiece',
      severity: PIECE_VALUES[movedPiece.type] >= 5 ? 'high' : 'medium',
      note: `La pièce ${movedPiece.type.toUpperCase()} jouée en ${ply.to} semble en prise sans défense.`,
    };
  }

  return null;
}

export function detectBadTrade(input: PlyAnalysisInput): HeuristicResult | null {
  const { ply } = input;

  if (!ply.captured) return null;

  const movedValue = PIECE_VALUES[ply.piece];
  const capturedValue = PIECE_VALUES[ply.captured];

  if (movedValue - capturedValue >= 2) {
    return {
      momentType: 'badTrade',
      severity: movedValue - capturedValue >= 4 ? 'high' : 'medium',
      note: `Échange potentiellement défavorable: ${ply.piece.toUpperCase()} contre ${ply.captured.toUpperCase()}.`,
    };
  }

  return null;
}

export function detectOpeningPrinciple(input: PlyAnalysisInput): HeuristicResult | null {
  const { ply } = input;
  if (ply.plyIndex > 15) return null;

  if ((ply.piece === 'q' || ply.piece === 'r') && ply.plyIndex < 10) {
    return {
      momentType: 'openingPrinciple',
      severity: 'low',
      note: 'Développement précoce de dame/tour en ouverture: vérifier le développement des pièces mineures.',
    };
  }

  const boardAfter = new Chess(ply.fenAfter);
  const ownKingSquare = findKingSquare(boardAfter, ply.color);

  if (ownKingSquare && ['e1', 'e8', 'd1', 'd8'].includes(ownKingSquare) && ply.plyIndex > 9) {
    return {
      momentType: 'openingPrinciple',
      severity: 'medium',
      note: 'Roi encore au centre après l’ouverture; le roque pourrait améliorer la sécurité.',
    };
  }

  return null;
}

export function detectKingSafety(input: PlyAnalysisInput): HeuristicResult | null {
  const { ply } = input;
  const boardAfter = new Chess(ply.fenAfter);
  const kingSquare = findKingSquare(boardAfter, ply.color);

  if (!kingSquare) return null;

  const enemyColor: Color = ply.color === 'w' ? 'b' : 'w';
  const enemyAttacksKing = boardAfter.moves({ verbose: true }).some((m) => m.color === enemyColor && m.to === kingSquare);

  if (enemyAttacksKing && boardAfter.turn() === enemyColor) {
    return {
      momentType: 'kingSafety',
      severity: 'high',
      note: 'Le coup joué semble exposer le roi à une attaque immédiate.',
    };
  }

  return null;
}

export const defaultHeuristics = [detectHungPiece, detectBadTrade, detectOpeningPrinciple, detectKingSafety] as const;
