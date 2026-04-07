import { useEffect, useState } from 'react';
import { useUmami } from '@danielgtmn/umami-react';
import { useGameState } from './hooks/useGameState';
import { PlayerSetup } from './components/PlayerSetup';
import { PlayerOrder } from './components/PlayerOrder';
import { GameScreen } from './components/GameScreen';
import { GameOver } from './components/GameOver';
import { PastGames } from './components/PastGames';

export default function App() {
  const { track } = useUmami();
  const {
    theme,
    setTheme,
    recentPlayers,
    currentGame,
    pastGames,
    startSetup,
    setPlayers,
    reorderPlayers,
    addScore,
    undoLastScore,
    nextPlayer,
    prevPlayer,
    endGame,
    resetGame,
    backToSetup,
  } = useGameState();

  const [showHistory, setShowHistory] = useState(false);

  // Apply theme to <html>
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleRematch = () => {
    if (!currentGame) return;
    const resetPlayers = currentGame.players.map((p) => ({
      ...p,
      score: 0,
      scoreHistory: [],
    }));
    reorderPlayers(resetPlayers);
  };

  // History view
  if (showHistory) {
    return <PastGames pastGames={pastGames} onBack={() => setShowHistory(false)} />;
  }

  // No game in progress — show welcome
  if (!currentGame) {
    return (
      <div className="flex flex-col min-h-dvh bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="text-5xl mb-4">🎲</div>
          <h1 className="text-4xl font-black mb-2">Tallee</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Fast, simple score tracking for game night</p>
          <button
            onClick={() => {
              track('game-started');
              startSetup();
            }}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-lg transition-colors"
          >
            Start New Game →
          </button>
          <button
            onClick={() => {
              track('past-games-viewed');
              setShowHistory(true);
            }}
            className="w-full mt-3 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium rounded-xl transition-colors"
          >
            Past Games {pastGames.length > 0 ? `(${pastGames.length})` : ''}
          </button>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {
                const newTheme = theme === 'dark' ? 'light' : 'dark';
                track('theme-toggled', { theme: newTheme });
                setTheme(newTheme);
              }}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-sm transition-colors"
            >
              {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentGame.phase === 'setup') {
    return (
      <div className="min-h-dvh bg-slate-100 dark:bg-slate-900">
        <div className="flex justify-end px-4 pt-4">
          <button
            onClick={() => {
              const newTheme = theme === 'dark' ? 'light' : 'dark';
              track('theme-toggled', { theme: newTheme });
              setTheme(newTheme);
            }}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-sm transition-colors"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        <PlayerSetup
          recentPlayers={recentPlayers}
          initialNames={currentGame.players.map((p) => p.name)}
          onConfirm={setPlayers}
          onReset={resetGame}
        />
      </div>
    );
  }

  if (currentGame.phase === 'order') {
    return (
      <div className="min-h-dvh bg-slate-100 dark:bg-slate-900">
        <PlayerOrder
          players={currentGame.players}
          onConfirm={reorderPlayers}
          onBack={backToSetup}
          onReset={resetGame}
        />
      </div>
    );
  }

  if (currentGame.phase === 'playing') {
    return (
      <GameScreen
        game={currentGame}
        onAddScore={addScore}
        onUndo={undoLastScore}
        onNextPlayer={nextPlayer}
        onPrevPlayer={prevPlayer}
        onEndGame={endGame}
        onReset={resetGame}
      />
    );
  }

  if (currentGame.phase === 'gameover') {
    return (
      <GameOver
        game={currentGame}
        onNewGame={resetGame}
        onRematch={handleRematch}
      />
    );
  }

  return null;
}
