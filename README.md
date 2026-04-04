# Tallee

Fast, simple score tracking for game night. Mobile-first, no account needed — all data stays in your browser.

## What it does

- Add 2–10 players and set their turn order
- Track scores with quick-tap buttons (+1, +5, +10) or custom values (including negatives)
- Live leaderboard updates as you play
- Undo the last score entry at any time
- End the game to see the final standings, then rematch or start fresh
- Player names from the previous game auto-fill when you start a new game
- Light and dark mode

## Running with Docker

The easiest way to run Tallee is via the pre-built image from GHCR:

```bash
docker run -p 8080:80 ghcr.io/frikyfriky11/tallee:main
```

Or use the provided Compose file:

```bash
# then:
docker compose up -d
```

Open [http://localhost:8080](http://localhost:8080).

## Running locally (dev)

```bash
npm install
npm run dev -- --host   # exposes on local network for mobile testing
```

Open the URL shown in the terminal. For mobile testing, use the network address (e.g. `http://192.168.x.x:5173`).

## Building the Docker image locally

```bash
docker build -t tallee .
docker run -p 8080:80 tallee
```

## Testing on mobile

The app is designed for iPhone SE screen size. In Chrome DevTools (F12), open the device toolbar and select **iPhone SE** to simulate the mobile layout accurately.

## Other commands

```bash
npm run build    # type-check + production bundle → dist/
npm run preview  # serve production build locally
npm run lint     # lint TypeScript/TSX files
```

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · @dnd-kit (drag-and-drop) · nginx (Docker)

All state persists in `localStorage` under the key `tallee_v1`. No backend, no auth.

## CI/CD

Pushes to `main` and version tags (`v*`) trigger a GitHub Actions workflow that builds and pushes the Docker image to GHCR. The image is public and requires no authentication to pull.
