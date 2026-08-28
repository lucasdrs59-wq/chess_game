import { useMemo, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import type { ImportedGameAnalysis } from '../services/analysisService';

interface GameDetailProps {
  analysis: ImportedGameAnalysis;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;
const PIECE_TO_SYMBOL: Record<string, string> = {
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
};

function getBoardState(fen: string): Record<string, string> {
  const [boardPart] = fen.split(' ');
  const rows = boardPart.split('/');
  const state: Record<string, string> = {};

  rows.forEach((row, rowIndex) => {
    let fileIndex = 0;
    for (const char of row) {
      if (/\d/.test(char)) fileIndex += Number(char);
      else {
        const square = `${FILES[fileIndex]}${RANKS[rowIndex]}`;
        state[square] = char;
        fileIndex += 1;
      }
    }
  });

  return state;
}

function buildFenTimeline(moves: string[]): string[] {
  const chess = new Chess();
  const fens = [chess.fen()];

  for (const san of moves) {
    const move = chess.move(san);
    if (!move) break;
    fens.push(chess.fen());
  }

  return fens;
}

export function GameDetail({ analysis }: GameDetailProps) {
  const [plyIndex, setPlyIndex] = useState(0);

  const fenTimeline = useMemo(() => buildFenTimeline(analysis.moves), [analysis.moves]);
  const clampedPly = Math.min(Math.max(plyIndex, 0), Math.max(fenTimeline.length - 1, 0));
  const fenToDisplay = fenTimeline[clampedPly] ?? new Chess().fen();
  const boardState = useMemo(() => getBoardState(fenToDisplay), [fenToDisplay]);
  const mistakeKeys = useMemo(() => new Set(analysis.mistakes.map((m) => `${m.plyIndex}-${m.momentType}-${m.note}`)), [analysis.mistakes]);

  const momentsByPly = useMemo(() => {
    return analysis.gameMoments.reduce<Record<number, ImportedGameAnalysis['gameMoments']>>((acc, moment) => {
      acc[moment.plyIndex + 1] = acc[moment.plyIndex + 1] ?? [];
      acc[moment.plyIndex + 1].push(moment);
      return acc;
    }, {});
  }, [analysis.gameMoments]);

  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <header>
        <h2>Détail de la partie</h2>
        <p>{analysis.tags.White ?? 'Blancs'} vs {analysis.tags.Black ?? 'Noirs'} — {analysis.tags.Result ?? '*'}</p>
      </header>

      <label>
        Replay (ply): {clampedPly}
        <input type="range" min={0} max={Math.max(0, fenTimeline.length - 1)} value={clampedPly} onChange={(e) => setPlyIndex(Number(e.target.value))} style={{ width: '100%' }} />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 32px)', border: '1px solid #ddd', width: 256 }}>
        {RANKS.flatMap((rank) => FILES.map((file, fileIndex) => {
          const square = `${file}${rank}` as Square;
          const piece = boardState[square];
          const light = (Number(rank) + fileIndex) % 2 === 0;
          return <div key={square} style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', fontSize: 20, background: light ? '#f0d9b5' : '#b58863' }} title={square}>{piece ? PIECE_TO_SYMBOL[piece] : ''}</div>;
        }))}
      </div>

      <div>
        <h3>Moments clés et erreurs</h3>
        <ul>
          {Object.entries(momentsByPly).map(([ply, moments]) => (
            <li key={ply}>
              <strong>Ply {ply}</strong>
              <ul>
                {moments.map((moment, index) => (
                  <li key={`${moment.momentType}-${index}`}>
                    <em>{moment.momentType}</em> — {moment.note} {mistakeKeys.has(`${moment.plyIndex}-${moment.momentType}-${moment.note}`) ? '⚠️ Erreur' : '✅ Moment clé'}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default GameDetail;
