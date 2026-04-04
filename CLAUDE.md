# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Type-check (tsc) then bundle (Vite) → dist/
npm run lint     # ESLint on all TypeScript/TSX files
npm run preview  # Serve production build locally
```

There are no tests configured in this project.

## Architecture

**Tallee** is a mobile-first, client-only React + TypeScript SPA for real-time board game score tracking. No backend, no auth — all state persists in `localStorage` under the key `tallee_v1`.

### Game Phases (State Machine)

`App.tsx` routes the UI through four discrete phases based on `gameState.phase`:

| Phase | Component | Purpose |
|-------|-----------|---------|
| `null` (no game) | Welcome screen inline | Entry point |
| `setup` | `PlayerSetup` | Name entry with autocomplete from recent players |
| `order` | `PlayerOrder` | Drag-and-drop turn order via @dnd-kit |
| `playing` | `GameScreen` | Score tracking with leaderboard |
| `gameover` | `GameOver` | Final standings, rematch option |

### State Management

All game logic lives in `src/hooks/useGameState.ts`. It wraps `useLocalStorage` (a thin hook around `window.localStorage` with JSON serialization) and exposes the full API consumed by `App.tsx`:

- `startSetup` / `setPlayers` / `reorderPlayers` — phase transitions
- `addScore` / `undoLastScore` — score mutations
- `nextPlayer` / `prevPlayer` — turn navigation
- `endGame` / `resetGame` / `backToSetup` — game lifecycle

`App.tsx` receives all state and callbacks from `useGameState`, then passes them down as props to phase components. There is no Context or global store — prop drilling is intentional given the shallow component tree.

### Data Shape (localStorage `tallee_v1`)

```json
{
  "recentPlayers": ["Alice", "Bob"],
  "theme": "dark",
  "currentGame": {
    "phase": "playing",
    "players": [{ "name": "Alice", "score": 52, "scoreHistory": [10, 5, 20, 17] }],
    "currentPlayerIndex": 0,
    "createdAt": "ISO string"
  }
}
```

### Stack

- **React 19** + TypeScript 5.9
- **Vite 8** + **@tailwindcss/vite** (Tailwind CSS 4)
- **@dnd-kit** for drag-and-drop in `PlayerOrder`
- ESLint flat config with `react-hooks` and `react-refresh` plugins

## Working

After every code change:
1. Run `npm run lint` and `npm run build` to verify no type or lint errors.
2. Start the dev server: `npm run dev -- --host` (the `--host` flag exposes it on the local network for mobile testing).
3. **You must test the app yourself in the developer's Chrome browser** using the `mcp__claude-in-chrome__*` tools — do not ask the developer to test. Resize the window to 375×667 (iPhone SE) before taking screenshots. Click through the affected flows and confirm they look and behave correctly before reporting back.
