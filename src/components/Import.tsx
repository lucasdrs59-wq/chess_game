import { FormEvent, useMemo, useState } from 'react';
import { LocalImportRepository } from '../services/localImportRepository';
import { ImportProgress, importRecentGames } from '../services/importService';

const defaultProgress: ImportProgress = {
  currentMonth: 0,
  totalMonths: 0,
  imported: 0,
  skipped: 0,
  errors: 0,
};

export const Import = () => {
  const [username, setUsername] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>(defaultProgress);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const repository = useMemo(() => new LocalImportRepository(), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim()) {
      setStatusMessage('Veuillez entrer un username Chess.com.');
      return;
    }

    setIsImporting(true);
    setStatusMessage(null);
    setProgress(defaultProgress);

    try {
      const result = await importRecentGames(
        username,
        repository,
        {
          monthsToImport: 3,
        },
        setProgress,
      );

      setStatusMessage(
        `Import terminé — ${result.imported} importées, ${result.skipped} ignorées, ${result.errors} erreurs.`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Erreur inconnue pendant l’import.',
      );
    } finally {
      setIsImporting(false);
    }
  };

  const progressPercentage =
    progress.totalMonths > 0
      ? Math.round((progress.currentMonth / progress.totalMonths) * 100)
      : 0;

  return (
    <section className="content-page" aria-labelledby="import-heading">
      <p className="eyebrow">Source publique · Parties terminées</p>
      <h1 id="import-heading">Importer depuis Chess.com</h1>
      <p className="lead">Les trois mois les plus récents sont analysés. Les doublons sont ignorés.</p>

      <form className="import-form" onSubmit={handleSubmit}>
        <label htmlFor="username">Identifiant Chess.com</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="ex: Hikaru"
          disabled={isImporting}
        />

        <button type="submit" disabled={isImporting}>
          {isImporting ? 'Import en cours…' : 'Importer'}
        </button>
      </form>

      <div className="progress-card" aria-live="polite">
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${progressPercentage}%` }} />
        </div>
        <p><strong>{progressPercentage} %</strong> · {progress.currentMonth}/{progress.totalMonths} mois traités</p>
        <div className="progress-metrics">
          <span><strong>{progress.imported}</strong> importées</span>
          <span><strong>{progress.skipped}</strong> ignorées</span>
          <span><strong>{progress.errors}</strong> erreurs</span>
        </div>
      </div>

      {statusMessage ? <p className="status-message">{statusMessage}</p> : null}
    </section>
  );
};

export default Import;
