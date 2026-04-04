import type { GameState } from '../types';

interface Props {
  game: GameState;
  onNewGame: () => void;
  onRematch: () => void;
}

function getRankSuffix(rank: number) {
  if (rank === 1) return 'st';
  if (rank === 2) return 'nd';
  if (rank === 3) return 'rd';
  return 'th';
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function GameOver({ game, onNewGame, onRematch }: Props) {
  const ranked = [...game.players]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const winner = ranked[0];

  return (
    <div className="flex flex-col min-h-dvh bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-3xl font-bold mb-1">Game Over!</h1>
        <p className="text-violet-600 dark:text-violet-400 font-semibold text-lg">{winner.name} wins!</p>
      </div>

      <div className="flex flex-col gap-3 mb-8 max-w-md mx-auto w-full">
        {ranked.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center gap-4 px-4 py-4 rounded-2xl border ${
              i === 0
                ? 'bg-yellow-400/10 border-yellow-400/30'
                : i === 1
                ? 'bg-slate-400/10 border-slate-400/20'
                : i === 2
                ? 'bg-orange-400/10 border-orange-400/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className="text-2xl">{MEDALS[i] ?? `${i + 1}${getRankSuffix(i + 1)}`}</span>
            <div className="flex-1">
              <div className={`font-bold text-lg ${i === 0 ? 'text-yellow-600 dark:text-yellow-300' : 'text-slate-900 dark:text-white'}`}>
                {p.name}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs">
                {p.scoreHistory.length} score entr{p.scoreHistory.length === 1 ? 'y' : 'ies'}
              </div>
            </div>
            <div className={`text-2xl font-black font-mono ${i === 0 ? 'text-yellow-600 dark:text-yellow-300' : 'text-slate-700 dark:text-slate-200'}`}>
              {p.score}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 max-w-md mx-auto w-full mt-auto">
        <button
          onClick={onRematch}
          className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-lg transition-colors"
        >
          Rematch (same players)
        </button>
        <button
          onClick={onNewGame}
          className="w-full py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium rounded-xl transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
