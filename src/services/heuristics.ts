import { Chess, type Move, type PieceSymbol, type Square } from "chess.js";

export type HeuristicFinding = {
  momentType: 'hung_piece' | 'bad_trade' | 'opening_principle' | 'king_safety';
  note: string;
};

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 100,
};

const OPENING_LIMIT = 12;

const positionKey = (fen: string): string => fen.split(" ").slice(0, 4).join(" ");

const findTransitionMove = (fenBefore: string, fenAfter: string): Move | null => {
  const before = new Chess(fenBefore);

  for (const candidate of before.moves({ verbose: true })) {
    const replay = new Chess(fenBefore);
    const move = replay.move(candidate);
    if (positionKey(replay.fen()) === positionKey(fenAfter)) {
      return move;
    }
  }

  return null;
};

export function detectHungPiece(
  fenBefore: string,
  fenAfter: string,
): HeuristicFinding | null {
  const after = new Chess(fenAfter);
  const lastMove = findTransitionMove(fenBefore, fenAfter);

  if (!lastMove) {
    return null;
  }

  const movedPiece = after.get(lastMove.to);
  if (!movedPiece) {
    return null;
  }

  const opponentColor = movedPiece.color === 'w' ? 'b' : 'w';
  const destination = lastMove.to as Square;
  const attacked = after.isAttacked(destination, opponentColor);
  const defended = after.isAttacked(destination, movedPiece.color);

  if (attacked && !defended && movedPiece.type !== 'k') {
    return {
      momentType: 'hung_piece',
      note: `Le coup ${lastMove.san} laisse une pièce en prise sans défense immédiate.`,
    };
  }

  return null;
}

export function detectBadTrade(
  fenBefore: string,
  fenAfter: string,
): HeuristicFinding | null {
  const after = new Chess(fenAfter);
  const lastMove = findTransitionMove(fenBefore, fenAfter);

  if (!lastMove?.captured) {
    return null;
  }

  const gain = PIECE_VALUES[lastMove.captured] - PIECE_VALUES[lastMove.piece];
  const attacked = after.isAttacked(lastMove.to as Square, lastMove.color === "w" ? "b" : "w");

  if (gain <= -2 && attacked) {
    return {
      momentType: 'bad_trade',
      note: `Échange défavorable sur ${lastMove.to}: ${lastMove.piece.toUpperCase()} contre ${lastMove.captured.toUpperCase()}.`,
    };
  }

  return null;
}

export function detectOpeningPrinciple(
  fenBefore: string,
  fenAfter: string,
  plyIndex: number,
): HeuristicFinding | null {
  if (plyIndex > OPENING_LIMIT) {
    return null;
  }

  const lastMove = findTransitionMove(fenBefore, fenAfter);
  if (!lastMove) {
    return null;
  }

  if (lastMove.piece === 'q' && plyIndex <= 8) {
    return {
      momentType: 'opening_principle',
      note: `Sortie précoce de la dame (${lastMove.san}) pendant l'ouverture.`,
    };
  }

  return null;
}

export function detectKingSafety(
  _fenBefore: string,
  fenAfter: string,
  plyIndex: number,
): HeuristicFinding | null {
  const after = new Chess(fenAfter);
  const board = after.board();
  const turn = after.turn();
  const colorJustPlayed = turn === 'w' ? 'b' : 'w';

  const kingSquare = (() => {
    for (let rank = 0; rank < board.length; rank += 1) {
      for (let file = 0; file < board[rank].length; file += 1) {
        const piece = board[rank][file];
        if (piece?.type === 'k' && piece.color === colorJustPlayed) {
          return `${'abcdefgh'[file]}${8 - rank}` as Square;
        }
      }
    }
    return null;
  })();

  if (!kingSquare) {
    return null;
  }

  const kingInCenter = ['e1', 'e8', 'd1', 'd8'].includes(kingSquare);
  if (plyIndex >= 20 && kingInCenter) {
    return {
      momentType: 'king_safety',
      note: `Roi encore exposé sur ${kingSquare} en milieu de partie.`,
    };
  }

  return null;
}
