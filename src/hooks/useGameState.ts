import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Player, AppStorage } from '../types';

const STORAGE_KEY = 'tallee_v1';

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

const defaultStorage: AppStorage = {
  recentPlayers: [],
  lastGamePlayers: [],
  theme: 'dark',
  currentGame: null,
};

export function useGameState() {
  const [storage, setStorage] = useLocalStorage<AppStorage>(STORAGE_KEY, defaultStorage);

  const { recentPlayers, lastGamePlayers, theme, currentGame } = storage;

  const setTheme = useCallback(
    (t: 'light' | 'dark') => setStorage((s) => ({ ...s, theme: t })),
    [setStorage],
  );

  const startSetup = useCallback(() => {
    setStorage((s) => ({
      ...s,
      currentGame: {
        phase: 'setup',
        players: s.lastGamePlayers.map((name) => ({
          id: makeId(),
          name,
          score: 0,
          scoreHistory: [],
        })),
        currentPlayerIndex: 0,
        createdAt: new Date().toISOString(),
      },
    }));
  }, [setStorage]);

  const setPlayers = useCallback(
    (names: string[]) => {
      const players: Player[] = names.map((name) => ({
        id: makeId(),
        name,
        score: 0,
        scoreHistory: [],
      }));
      // Update recent players list
      const merged = [
        ...names,
        ...recentPlayers.filter((r) => !names.includes(r)),
      ].slice(0, 20);
      setStorage((s) => ({
        ...s,
        recentPlayers: merged,
        currentGame: s.currentGame
          ? { ...s.currentGame, players, phase: 'order' }
          : s.currentGame,
      }));
    },
    [setStorage, recentPlayers],
  );

  const reorderPlayers = useCallback(
    (players: Player[]) => {
      setStorage((s) => ({
        ...s,
        currentGame: s.currentGame
          ? { ...s.currentGame, players, phase: 'playing', currentPlayerIndex: 0 }
          : s.currentGame,
      }));
    },
    [setStorage],
  );

  const addScore = useCallback(
    (points: number) => {
      setStorage((s) => {
        if (!s.currentGame) return s;
        const { players, currentPlayerIndex } = s.currentGame;
        const updated = players.map((p, i) =>
          i === currentPlayerIndex
            ? { ...p, score: p.score + points, scoreHistory: [...p.scoreHistory, points] }
            : p,
        );
        return { ...s, currentGame: { ...s.currentGame, players: updated } };
      });
    },
    [setStorage],
  );

  const undoLastScore = useCallback(() => {
    setStorage((s) => {
      if (!s.currentGame) return s;
      const { players, currentPlayerIndex } = s.currentGame;
      const player = players[currentPlayerIndex];
      if (!player || player.scoreHistory.length === 0) return s;
      const lastPoints = player.scoreHistory[player.scoreHistory.length - 1];
      const updated = players.map((p, i) =>
        i === currentPlayerIndex
          ? {
              ...p,
              score: p.score - lastPoints,
              scoreHistory: p.scoreHistory.slice(0, -1),
            }
          : p,
      );
      return { ...s, currentGame: { ...s.currentGame, players: updated } };
    });
  }, [setStorage]);

  const nextPlayer = useCallback(() => {
    setStorage((s) => {
      if (!s.currentGame) return s;
      const { players, currentPlayerIndex } = s.currentGame;
      const next = (currentPlayerIndex + 1) % players.length;
      return { ...s, currentGame: { ...s.currentGame, currentPlayerIndex: next } };
    });
  }, [setStorage]);

  const prevPlayer = useCallback(() => {
    setStorage((s) => {
      if (!s.currentGame) return s;
      const { players, currentPlayerIndex } = s.currentGame;
      const prev = (currentPlayerIndex - 1 + players.length) % players.length;
      return { ...s, currentGame: { ...s.currentGame, currentPlayerIndex: prev } };
    });
  }, [setStorage]);

  const endGame = useCallback(() => {
    setStorage((s) => ({
      ...s,
      lastGamePlayers: s.currentGame ? s.currentGame.players.map((p) => p.name) : s.lastGamePlayers,
      currentGame: s.currentGame ? { ...s.currentGame, phase: 'gameover' } : s.currentGame,
    }));
  }, [setStorage]);

  const resetGame = useCallback(() => {
    setStorage((s) => ({ ...s, currentGame: null }));
  }, [setStorage]);

  const backToSetup = useCallback(() => {
    setStorage((s) => ({
      ...s,
      currentGame: s.currentGame ? { ...s.currentGame, phase: 'setup' } : s.currentGame,
    }));
  }, [setStorage]);

  return {
    theme,
    setTheme,
    recentPlayers,
    lastGamePlayers,
    currentGame,
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
  };
}
