# Sudoku

A full-featured Sudoku web application with 5 difficulty levels, a custom solving engine with 10 techniques, interactive learning module, progressive hint system, solve-time tracking, and global leaderboards.

Play immediately without an account. Optionally sign up to persist stats and compete on leaderboards.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3FCF8E?logo=supabase)

---

## Features

### Game
- **5 difficulty levels**: Beginner (45–50 clues) → Expert (22–26 clues)
- **Full keyboard support**: Arrow keys for navigation, 1–9 for digits, N for notes mode, Ctrl+Z/Y for undo/redo
- **Notes mode**: Toggle candidate pencil marks on empty cells
- **Undo / Redo**: Full history with board snapshots
- **Mistake detection**: Highlights incorrect digits against the known solution
- **Timer**: Auto-starts on new game, pause/resume support

### Hint System (Progressive Disclosure)
Each hint request costs 1 of 5 hints per puzzle. Once a hint is shown, clicking **More Detail** reveals additional levels for free:

| Level | Reveals |
|-------|---------|
| 1 | Technique name ("Try looking for a Naked Single") |
| 2 | + Region ("Look in row 3") |
| 3 | + Specific cells ("Focus on cell R3C3") |
| 4 | + Full explanation with eliminations |

Hints auto-dismiss when you make a move. Wrong digit placement adds a 15-second penalty.

### Custom Sudoku Engine
10 solving techniques ordered by difficulty:

| # | Technique | Tier | Weight |
|---|-----------|------|--------|
| 1 | Naked Single | Beginner | 4 |
| 2 | Hidden Single | Beginner | 14 |
| 3 | Naked Pairs | Intermediate | 40 |
| 4 | Pointing Pairs | Intermediate | 50 |
| 5 | Box/Line Reduction | Intermediate | 50 |
| 6 | Naked Triples | Intermediate | 60 |
| 7 | Hidden Pairs | Intermediate | 70 |
| 8 | Hidden Triples | Advanced | 100 |
| 9 | X-Wing | Advanced | 140 |
| 10 | Swordfish | Expert | 200 |

Puzzles are generated with a two-phase algorithm:
1. Fill 3 diagonal boxes randomly, solve the rest via backtracking
2. Remove clues one at a time, verifying unique solution and target difficulty at each step

### Learning Module
- **Learning hub** (`/learn`): All 10 techniques organized by difficulty tier
- **Interactive tutorials** (`/tutorials/[slug]`): Step-by-step walkthroughs for each technique
- **Static guides** (`/guides/[slug]`): Reference pages with explanations

### Stats & Leaderboards
- **Personal stats** (`/stats`): Games played, win count, best/average times, streaks, per-difficulty breakdown
- **Global leaderboard** (`/leaderboard`): Filterable by difficulty with percentile rankings
- **Anonymous-first**: Stats stored in localStorage until the user signs up, then migrated to Supabase

### Authentication
- Google and GitHub OAuth
- Email/password signup
- Anonymous play with optional account creation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| State | [Zustand 5](https://zustand.docs.pmnd.rs/) |
| Animations | [Framer Motion 12](https://www.framer.com/motion/) |
| Auth & DB | [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS) |
| Content | MDX via [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- npm (comes with Node.js)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/memocyp/sudoku.git
cd sudoku

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app works fully without Supabase — auth and stats features will show placeholder states until configured.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build (includes TypeScript checking) |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── (game)/play/            # Main game page
│   ├── (learn)/                # Learn hub, tutorials, guides
│   ├── (stats)/                # Stats dashboard, leaderboard
│   ├── (auth)/                 # Login, signup, OAuth callback
│   └── api/                    # API routes (stats, leaderboard)
├── engine/                     # Pure TypeScript Sudoku engine
│   ├── types.ts                # Core types & constants
│   ├── utils.ts                # Board geometry & bitmask helpers
│   ├── candidates.ts           # Candidate computation
│   ├── validator.ts            # Board validation & solution counting
│   ├── techniques/             # 10 solving technique implementations
│   ├── solver.ts               # Technique-based & backtracking solver
│   ├── generator.ts            # Puzzle generation
│   ├── grader.ts               # Difficulty classification
│   └── hint.ts                 # Progressive hint system
├── stores/                     # Zustand state management
│   ├── gameStore.ts            # Game state, history, actions
│   └── settingsStore.ts        # User display preferences
├── components/
│   ├── game/                   # SudokuBoard, SudokuCell, NumberPad, etc.
│   ├── layout/                 # Navbar, Footer, AuthButton
│   ├── learn/                  # TutorialPlayer, MiniBoard, etc.
│   ├── stats/                  # LeaderboardTable, StatsOverview
│   └── ui/                     # shadcn/ui primitives
├── hooks/                      # useKeyboard, useTimer, useAuth, etc.
└── lib/                        # Utilities, Supabase clients, scoring
```

---

## Environment Variables

Create a `.env.local` file in the project root (optional — the app runs without these):

```env
# Supabase (required for auth, stats persistence, leaderboards)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from your [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api) → Settings → API.

---

## Supabase Setup

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com/) and create a new project.

### 2. Database Schema

Run the following SQL in the Supabase SQL Editor:

```sql
-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Solve times table
CREATE TABLE solve_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  difficulty SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  solve_time_ms BIGINT NOT NULL,
  hints_used SMALLINT DEFAULT 0,
  mistakes_made SMALLINT DEFAULT 0,
  puzzle_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_solve_times_leaderboard ON solve_times (difficulty, solve_time_ms);
CREATE INDEX idx_solve_times_user ON solve_times (user_id, created_at DESC);

-- Percentile cache (refreshed periodically)
CREATE TABLE percentile_cache (
  difficulty SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  percentile SMALLINT NOT NULL CHECK (percentile BETWEEN 1 AND 99),
  threshold_ms BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (difficulty, percentile)
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solve_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE percentile_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can read own solve times" ON solve_times FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own solve times" ON solve_times FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Percentile cache is public" ON percentile_cache FOR SELECT USING (true);
```

### 3. Configure OAuth Providers

In the Supabase Dashboard → Authentication → Providers:
- **Google**: Add your Google OAuth client ID and secret
- **GitHub**: Add your GitHub OAuth app client ID and secret

Set the redirect URL to: `https://your-domain.com/callback`

### 4. Add Environment Variables

Copy the project URL and anon key from Dashboard → Settings → API into your `.env.local`.

---

## Deploying to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/memocyp/sudoku)

### Manual Deploy

#### 1. Install Vercel CLI

```bash
npm i -g vercel
```

#### 2. Link and Deploy

```bash
# From the project root
vercel

# Follow prompts to link to your Vercel account
# For production deployment:
vercel --prod
```

#### 3. Set Environment Variables

In the [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` |

Or via CLI:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### 4. Configure Domain (Optional)

In Vercel Dashboard → Your Project → Settings → Domains, add your custom domain. Update the Supabase OAuth redirect URL to match.

---

## Roadmap / Next Steps

### High Priority
- [ ] **Wire API routes to Supabase** — Replace placeholder `POST /api/stats` and `GET /api/leaderboard` with real Supabase queries
- [ ] **LocalStorage → Supabase migration** — Trigger `statsMigration.ts` on first login to migrate anonymous stats
- [ ] **Percentile calculation** — Implement `pg_cron` or Supabase Edge Function to refresh `percentile_cache` every 15 minutes
- [ ] **Unit tests** — Add Vitest for engine modules (techniques, solver, generator, grader)

### Medium Priority
- [x] **Interactive tutorial content** — JSON step definitions authored for all 10 techniques in `public/tutorials/`
- [ ] **MDX guides** — Write detailed technique guides with `<BoardDiagram>` and `<BeforeAfterDiagram>` custom MDX components
- [ ] **Dark mode** — Wire `settingsStore.theme` to `ThemeProvider` with system preference detection
- [ ] **Error boundaries** — Add React error boundaries around game board and page layouts
- [ ] **PWA support** — Add `manifest.json` and service worker for offline play

### Polish
- [ ] **SEO** — Add per-page metadata, Open Graph images, and `sitemap.xml`
- [ ] **Accessibility** — Full ARIA labels, focus ring management, screen reader announcements for game events
- [ ] **Performance** — Lazy-load learn/stats pages, add `loading.tsx` skeletons, optimize board re-renders
- [ ] **Mobile UX** — Haptic feedback on cell selection, swipe gestures, bottom sheet for settings
- [ ] **Animations** — Candidate elimination animations, digit placement effects, celebration on completion

### Future Features
- [ ] **Daily challenge** — Same puzzle for all players each day with separate leaderboard
- [ ] **Multiplayer race** — Real-time head-to-head solving via Supabase Realtime
- [ ] **Puzzle sharing** — Generate shareable links with encoded puzzle state
- [ ] **Custom puzzles** — Allow users to input and solve their own puzzles
- [ ] **Advanced techniques** — Add XY-Wing, Coloring, and Forcing Chains

---

## Architecture Overview

```
┌──────────────────────────────────────────────────┐
│                    Browser                        │
│                                                   │
│  ┌─────────┐    ┌──────────┐    ┌─────────────┐  │
│  │  Pages   │───▶│  Hooks   │───▶│  Components │  │
│  │ (Router) │    │(keyboard,│    │ (Board,Pad, │  │
│  │          │    │ timer,..)│    │  Toolbar,..) │  │
│  └────┬─────┘    └────┬─────┘    └─────────────┘  │
│       │               │                           │
│       ▼               ▼                           │
│  ┌────────────────────────────┐                   │
│  │     Zustand Stores         │                   │
│  │  (gameStore, settingsStore)│                   │
│  └────────────┬───────────────┘                   │
│               │ dynamic import()                  │
│               ▼                                   │
│  ┌────────────────────────────┐                   │
│  │     Engine (Pure TS)       │                   │
│  │  generator → solver →      │                   │
│  │  grader → hint → validator │                   │
│  │  techniques/[10 files]     │                   │
│  └────────────────────────────┘                   │
│                                                   │
└───────────────────────┬──────────────────────────┘
                        │ (optional)
                        ▼
              ┌──────────────────┐
              │    Supabase      │
              │  Auth + Postgres │
              │  + RLS policies  │
              └──────────────────┘
```

---

## License

This project is private. All rights reserved.
