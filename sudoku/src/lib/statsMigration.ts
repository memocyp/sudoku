import { getItem, removeItem } from './localStorage';

const STATS_KEY = 'sudoku_stats';

/**
 * Migrate locally stored solve records to Supabase when a user signs up
 * or logs in. Each record is POSTed to /api/stats and, on success, the
 * local data is removed so records are not duplicated.
 */
export async function migrateLocalStatsToSupabase(userId: string): Promise<void> {
  const raw = getItem(STATS_KEY);
  if (!raw) return;

  try {
    const records: unknown[] = JSON.parse(raw);

    for (const record of records) {
      await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(record as Record<string, unknown>), userId }),
      });
    }

    removeItem(STATS_KEY);
  } catch {
    // Ignore JSON parse errors or network failures — data stays in localStorage
  }
}
