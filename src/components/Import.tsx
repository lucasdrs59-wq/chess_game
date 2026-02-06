import { FormEvent, useMemo, useState } from 'react';
import { ChessComGame } from '../services/chesscomApi';
import { ImportResult, importChessComGames } from '../services/importService';

interface StoredGame extends ChessComGame {
  logicalKey: string;
}

const LOCAL_STORAGE_KEY = 'chess-imported-games';

function readStoredGames(): StoredGame[] {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as StoredGame[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredGames(games: StoredGame[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(games));
}

function buildLogicalKey(game: ChessComGame): string {
  const white = game.white?.username?.toLowerCase() ?? '';
  const black = game.black?.username?.toLowerCase() ?? '';
  const endTime = game.end_time ?? game.start_time ?? 0;
  return `${white}|${black}|${endTime}|${game.time_class ?? ''}|${game.url ?? ''}`;
}

export function Import(): JSX.Element {
  const [username, setUsername] = useState('');
  const [inProgress, setInProgress] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<ImportResult>({ imported: 0, skipped: 0, errors: 0 });

  const canImport = useMemo(() => username.trim().length > 0 && !inProgress, [username, inProgress]);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!canImport) {
      return;
    }

    setInProgress(true);
    setProgressText('Démarrage...');

    try {
      const importResult = await importChessComGames({
        username,
        months: 3,
        getExistingKeys: async () => {
          const keys = new Set<string>();
          const stored = readStoredGames();

          stored.forEach((game) => {
            keys.add(game.logicalKey);
          });

          return keys;
        },
        saveGames: async (games) => {
          const stored = readStoredGames();
          const mapped = games.map((game) => ({
            ...game,
            logicalKey: buildLogicalKey(game),
          }));

          writeStoredGames([...stored, ...mapped]);
          return games.length;
        },
        onProgress: (progress) => {
          setProgressText(
            `Mois ${progress.currentMonth}/${progress.totalMonths} · importées: ${progress.imported} · ignorées: ${progress.skipped} · erreurs: ${progress.errors}`,
          );
          setResult({
            imported: progress.imported,
            skipped: progress.skipped,
            errors: progress.errors,
          });
        },
      });

      setResult(importResult);
      setProgressText('Import terminé.');
    } catch {
      setProgressText('Import échoué.');
    } finally {
      setInProgress(false);
    }
  }

  return (
    <section>
      <h2>Import Chess.com</h2>
      <form onSubmit={onSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="ex: hikaru"
        />
        <button type="submit" disabled={!canImport}>
          {inProgress ? 'Import en cours...' : 'Importer'}
        </button>
      </form>

      <p>{progressText}</p>
      <ul>
        <li>Importées: {result.imported}</li>
        <li>Ignorées: {result.skipped}</li>
        <li>Erreurs: {result.errors}</li>
      </ul>
    </section>
  );
}

export default Import;
