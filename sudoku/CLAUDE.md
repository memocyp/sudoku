# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build (also runs TypeScript check)
npm run lint         # ESLint
npm start            # Start production server
```

No test runner is configured yet.

## Architecture

Next.js 15 App Router with a layered architecture:

```
Pages (App Router)  →  Hooks  →  Zustand Stores  →  Engine (pure TS)
```

**Engine** (`src/engine/`) is pure TypeScript with zero React dependencies. The game store dynamically imports engine modules to avoid bundling them in every chunk.

**Key data flow**: User input → `useKeyboard` hook → `gameStore` action → engine function → store update → React re-render.

## Board Representation

- **Board**: flat `number[81]` in row-major order. `0` = empty, `1-9` = digit. Index math: `row = Math.floor(i / 9)`, `col = i % 9`.
- **CandidateGrid**: parallel `number[81]` of bitmasks. Digit `d` → bit `1 << d` (bit 0 unused). Example: digits {1,3,7} → `(1<<1)|(1<<3)|(1<<7)`.
- **Difficulty**: string union `'beginner' | 'easy' | 'medium' | 'hard' | 'expert'`. Numeric level (1-5) via `DIFFICULTY_MAP`.

## Engine (`src/engine/`)

- **types.ts**: All core types plus `TECHNIQUE_WEIGHTS`, `TECHNIQUE_DIFFICULTY`, `TECHNIQUE_ORDER` constants.
- **utils.ts**: Precomputed lookup tables (`ROW_CELLS`, `COL_CELLS`, `BOX_CELLS`, `PEERS`) and bitmask helpers (`digitToBit`, `countBits`, `bitsToDigits`, `hasCandidate`, `removeCandidate`).
- **techniques/**: 10 technique files, each exports `(board: Board, candidates: CandidateGrid) => TechniqueResult | null`. Ordered easiest→hardest: nakedSingle, hiddenSingle, nakedPairs, hiddenPairs, pointingPairs, boxLineReduction, nakedTriples, hiddenTriples, xWing, swordfish. Registry in `techniques/index.ts` exports `TECHNIQUES_ORDERED` and `TECHNIQUE_MAP`.
- **solver.ts**: `solve(board)` applies techniques in order, returns `SolveStep[]`. `solveWithBacktracking(board)` uses MRV heuristic brute-force.
- **generator.ts**: Two-phase: (1) fill 3 diagonal boxes + backtrack solve, (2) remove clues while maintaining unique solution and target difficulty. Up to 20 attempts.
- **grader.ts**: `gradePuzzleFromBoard(board)` → `{ difficulty, score, techniques }`. Score thresholds: 80→beginner, 250→easy, 500→medium, 900→hard.
- **hint.ts**: `getHint(board, level)` returns progressive hints (level 1: technique name, level 2: +region, level 3: +cells, level 4: +full explanation). `MAX_HINTS_PER_PUZZLE = 5`.

## State Management

**gameStore.ts** (Zustand): Central game state — `puzzle`, `solution`, `board`, `candidates`, `selectedCell`, `history[]`/`historyIndex` (undo/redo via full snapshots), timer, hints, mistakes. Actions use dynamic `import()` for engine modules.

**settingsStore.ts**: Display preferences (theme, highlightPeers, showCandidates, showErrors).

Both stores use immutable updates — boards/candidates are cloned via spread `[...]` before mutation.

## Route Structure

| Route Group | Pages |
|---|---|
| `(game)` | `/play` — main game with board, toolbar, number pad |
| `(learn)` | `/learn`, `/tutorials/[slug]`, `/guides/[slug]` |
| `(stats)` | `/stats`, `/leaderboard` |
| `(auth)` | `/login`, `/signup`, `/callback` (OAuth) |
| `api/` | `/api/stats` (GET/POST), `/api/leaderboard` (GET) |

## Supabase Integration

Supabase clients in `src/lib/supabase/`. The app runs without Supabase credentials — `isSupabaseConfigured` guard in `client.ts` prevents crashes. `useAuth` hook short-circuits all operations when unconfigured. API routes are placeholders (TODO: wire to Supabase).

## Adding a New Technique

1. Create `src/engine/techniques/newTechnique.ts` matching `(board: Board, candidates: CandidateGrid) => TechniqueResult | null`
2. Add `TechniqueId` variant to the union in `types.ts`
3. Set entries in `TECHNIQUE_WEIGHTS`, `TECHNIQUE_DIFFICULTY`, `TECHNIQUE_ORDER`
4. Register in `techniques/index.ts` (`TECHNIQUES_ORDERED` array and `TECHNIQUE_MAP`)
5. Adjust `grader.ts` score thresholds if needed

## Conventions

- `TechniqueResult.eliminations` and `.placements` use `{ cell: CellIndex; digit: Digit }[]` object format (not tuples).
- Engine functions are pure — no React, no side effects, no dynamic imports.
- `utils.ts` has legacy aliases (`rowOf` → `getRow`, etc.) for backward compatibility.
- Components in `src/components/game/` read from stores via hooks; UI components in `src/components/ui/` are shadcn/ui primitives.
