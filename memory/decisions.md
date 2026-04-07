# Architectural Decisions

## ADR-001: Prop Drilling Over Context
See CLAUDE.md: "Prop drilling is intentional"
- No Context API or global store
- Component tree is shallow enough that drilling is cleaner than abstraction
- Revisit if tree depth exceeds 5 levels

## ADR-002: All Game Logic in useGameState
See CLAUDE.md: "All game logic in useGameState"
- Single source of truth in hook, not spread across components
- Components are pure UI; behaviour goes in the hook

## ADR-003: Branch Strategy
- Long-lived `agentic` branch as integration target (never commits to `main` directly)
- Feature branches always cut from `agentic`, PRs always target `agentic`
- `agentic` → `main` promotions are human decisions (weekly/monthly review)

---
(Docs agent maintains this file after each merge)
