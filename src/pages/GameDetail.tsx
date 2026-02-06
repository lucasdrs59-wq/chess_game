import { useMemo, useState } from 'react';
import { AnalyzedGame } from '../services/analysisService';

type GameDetailProps = {
  game: AnalyzedGame;
};

const PIECE_UNICODE: Record<string, string> = {
  p: '♟',
  r: '♜',
  n: '♞',
  b: '♝',
  q: '♛',
  k: '♚',
  P: '♙',
  R: '♖',
  N: '♘',
  B: '♗',
  Q: '♕',
  K: '♔',
};

function fenToBoardRows(fen: string): string[][] {
  const board = fen.split(' ')[0];
  return board.split('/').map((row) => {
    const squares: string[] = [];
    for (const char of row) {
      if (/\d/.test(char)) {
        squares.push(...Array.from({ length: Number(char) }, () => ''));
      } else {
        squares.push(char);
      }
    }
    return squares;
  });
}

export function GameDetail({ game }: GameDetailProps) {
  const [currentPly, setCurrentPly] = useState(0);
  const maxPly = game.fenByPly.length - 1;

  const currentFen = game.fenByPly[currentPly] ?? game.fenByPly[0];
  const boardRows = useMemo(() => fenToBoardRows(currentFen), [currentFen]);

  const momentsAtPly = game.gameMoments.filter((moment) => moment.plyIndex === currentPly);

  return (
    <section>
      <h2>Détail de la partie</h2>
      <p>
        {game.tags.White ?? 'White'} vs {game.tags.Black ?? 'Black'} — {game.tags.Result ?? '*'}
      </p>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 2.25rem)',
              border: '1px solid #333',
              width: 'fit-content',
            }}
          >
            {boardRows.flatMap((row, rank) =>
              row.map((piece, file) => {
                const isDark = (rank + file) % 2 === 1;
                return (
                  <div
                    key={`${rank}-${file}`}
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isDark ? '#769656' : '#eeeed2',
                      fontSize: '1.25rem',
                    }}
                  >
                    {PIECE_UNICODE[piece] ?? ''}
                  </div>
                );
              }),
            )}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={() => setCurrentPly((ply) => Math.max(0, ply - 1))}>
              ← Coup précédent
            </button>
            <button type="button" onClick={() => setCurrentPly((ply) => Math.min(maxPly, ply + 1))}>
              Coup suivant →
            </button>
            <span>
              Ply {currentPly}/{maxPly}
            </span>
          </div>
        </div>

        <div>
          <h3>Moments clés et erreurs</h3>
          <ul>
            {game.gameMoments.map((moment, index) => (
              <li key={`${moment.plyIndex}-${moment.momentType}-${index}`}>
                <strong>Ply {moment.plyIndex}</strong> [{moment.momentType}] — {moment.note}
              </li>
            ))}
          </ul>

          {momentsAtPly.length > 0 && (
            <>
              <h4>Moment(s) au coup actuel</h4>
              <ul>
                {momentsAtPly.map((moment, index) => (
                  <li key={`${moment.momentType}-${index}`}>{moment.note}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default GameDetail;
