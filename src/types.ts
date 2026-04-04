export interface Player {
  id: string;
  name: string;
  score: number;
  scoreHistory: number[];
}

export type GamePhase = 'setup' | 'order' | 'playing' | 'gameover';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  createdAt: string;
}

export interface AppStorage {
  recentPlayers: string[];
  lastGamePlayers: string[];
  theme: 'light' | 'dark';
  currentGame: GameState | null;
}
