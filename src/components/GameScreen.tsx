import { useState } from 'react';
import { useUmami } from '@danielgtmn/umami-react';
import type { GameState } from '../types';

interface Props {
  game: GameState;
  onAddScore: (points: number) => void;
  onUndo: () => void;
  onNextPlayer: () => void;
  onPrevPlayer: () => void;
  onEndGame: () => void;
  onReset: () => void;
}

const QUICK_SCORES = [1, 5, 10];

function getRankSuffix(rank: number) {
  if (rank === 1) return 'st';
  if (rank === 2) return 'nd';
  if (rank === 3) return 'rd';
  return 'th';
}

export function GameScreen({ game, onAddScore, onUndo, onNextPlayer, onPrevPlayer, onEndGame, onReset }: Props) {
  const { track } = useUmami();
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [lastAdded, setLastAdded] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'endgame' | 'reset' | null>(null);

  const { players, currentPlayerIndex } = game;
  const currentPlayer = players[currentPlayerIndex];

  const ranked = [...players]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const currentRank = ranked.find((r) => r.id === currentPlayer.id)?.rank ?? 1;

  const handleQuickScore = (pts: number) => {
    onAddScore(pts);
    track('quick-score-added', { points: pts });
    setLastAdded(pts);
    setTimeout(() => setLastAdded(null), 800);
  };

  const handleCustomScore = () => {
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val !== 0) {
      onAddScore(val);
      track('custom-score-added', { points: val });
      setLastAdded(val);
      setTimeout(() => setLastAdded(null), 800);
      setCustomInput('');
      setShowCustom(false);
    }
  };

  const handleUndo = () => {
    onUndo();
    track('score-undone');
    setLastAdded(null);
  };

  const canUndo = currentPlayer.scoreHistory.length > 0;

  return (
    <div className="flex flex-col h-dvh bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white select-none overflow-hidden">
      {/* Confirmation overlay */}
      {confirmAction && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {confirmAction === 'endgame' ? 'End the game?' : 'Abandon game?'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              {confirmAction === 'endgame'
                ? 'This will take you to the final standings.'
                : 'This will discard the current game and all scores.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmAction(null);
                  if (confirmAction === 'endgame') {
                    track('end-game-confirmed', { player_count: players.length });
                    onEndGame();
                  } else {
                    track('game-abandoned', { player_count: players.length });
                    onReset();
                  }
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors"
              >
                {confirmAction === 'endgame' ? 'End Game' : 'Abandon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <span className="text-lg font-bold text-violet-600 dark:text-violet-400">Tallee</span>
        <div className="flex items-center gap-2">
          {canUndo && (
            <button
              onClick={handleUndo}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              ↩ Undo
            </button>
          )}
          <button
            onClick={() => setConfirmAction('endgame')}
            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            End Game
          </button>
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="w-9 h-9 flex items-center justify-center text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-800 rounded-lg transition-colors relative"
          >
            ⋯
            {showMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden shadow-xl z-20 w-44">
                <button
                  onClick={() => { setShowMenu(false); setConfirmAction('reset'); }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  Abandon Game
                </button>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col gap-1">
          {ranked.map((p, i) => {
            const isCurrent = p.id === currentPlayer.id;
            const isFirst = i === 0;
            const isLast = i === ranked.length - 1 && ranked.length > 1;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${
                  isCurrent ? 'bg-violet-500/10' : ''
                }`}
              >
                <span className={`text-xs w-5 text-center font-bold ${
                  isFirst ? 'text-yellow-500' : isLast ? 'text-red-400' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {i + 1}
                </span>
                <span className={`flex-1 text-sm truncate ${isCurrent ? 'text-violet-600 dark:text-violet-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                  {p.name}
                  {isFirst && <span className="ml-1 text-yellow-500 text-xs">👑</span>}
                </span>
                <span className={`text-sm font-mono font-bold ${isCurrent ? 'text-violet-600 dark:text-violet-300' : 'text-slate-700 dark:text-slate-200'}`}>
                  {p.score}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Player */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-2">
        <div className="text-slate-400 dark:text-slate-400 text-xs uppercase tracking-widest">Current Turn</div>
        <div className="text-4xl font-bold text-slate-900 dark:text-white">{currentPlayer.name}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-6xl font-black text-violet-600 dark:text-violet-400">{currentPlayer.score}</span>
          <span className="text-slate-400 text-sm">pts</span>
        </div>
        <div className="text-slate-400 dark:text-slate-500 text-xs">
          {currentRank}{getRankSuffix(currentRank)} place
          {currentPlayer.scoreHistory.length > 0 && (
            <span className="ml-2">
              · last: {currentPlayer.scoreHistory[currentPlayer.scoreHistory.length - 1] > 0 ? '+' : ''}
              {currentPlayer.scoreHistory[currentPlayer.scoreHistory.length - 1]}
            </span>
          )}
        </div>
        {lastAdded !== null && (
          <div className={`text-2xl font-bold animate-bounce ${lastAdded > 0 ? 'text-green-500' : 'text-red-400'}`}>
            {lastAdded > 0 ? '+' : ''}{lastAdded}
          </div>
        )}
      </div>

      {/* Score Buttons */}
      <div className="px-4 pb-3">
        {showCustom ? (
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCustomScore(); if (e.key === 'Escape') { setShowCustom(false); setCustomInput(''); } }}
              placeholder="Enter points (negative ok)"
              autoFocus
              className="flex-1 bg-white dark:bg-slate-800 border border-violet-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-center text-lg focus:outline-none"
            />
            <button
              onClick={handleCustomScore}
              className="px-5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors"
            >
              ✓
            </button>
            <button
              onClick={() => { setShowCustom(false); setCustomInput(''); }}
              className="px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {QUICK_SCORES.map((pts) => (
              <button
                key={pts}
                onClick={() => handleQuickScore(pts)}
                className="py-4 bg-white dark:bg-slate-800 hover:bg-violet-600 active:bg-violet-700 border border-slate-200 dark:border-slate-700 hover:border-violet-500 text-slate-900 dark:text-white hover:text-white font-bold text-lg rounded-xl transition-colors"
              >
                +{pts}
              </button>
            ))}
            <button
              onClick={() => setShowCustom(true)}
              className="py-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white font-medium text-sm rounded-xl transition-colors"
            >
              ±?
            </button>
          </div>
        )}

        {/* Turn Navigation */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onPrevPlayer}
            className="py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium rounded-xl transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={onNextPlayer}
            className="py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
