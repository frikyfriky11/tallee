import type { PastGame } from '../types';

interface Props {
  pastGames: PastGame[];
  onBack: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function PastGames({ pastGames, onBack }: Props) {
  return (
    <div className="flex flex-col min-h-dvh bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-6">
      <div className="flex items-center gap-3 mb-6 max-w-md mx-auto w-full">
        <button
          onClick={onBack}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Past Games</h1>
      </div>

      {pastGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-400 dark:text-slate-500">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm">No past games yet.</p>
          <p className="text-sm">Finish a game to see it here!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
          {pastGames.map((game) => (
            <div
              key={game.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4"
            >
              <div className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                {formatDate(game.finishedAt)}
              </div>
              <div className="flex flex-col gap-2">
                {game.players.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-lg w-6 text-center">{MEDALS[i] ?? `${i + 1}.`}</span>
                    <span className={`flex-1 font-medium ${i === 0 ? 'text-yellow-600 dark:text-yellow-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {p.name}
                    </span>
                    <span className={`font-mono font-bold ${i === 0 ? 'text-yellow-600 dark:text-yellow-300' : 'text-slate-600 dark:text-slate-300'}`}>
                      {p.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
