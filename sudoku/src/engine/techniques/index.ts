// ---------------------------------------------------------------------------
// Technique registry - ordered list of all solving techniques
// ---------------------------------------------------------------------------

import type { Board, CandidateGrid, TechniqueResult, TechniqueId } from '../types';
import { TECHNIQUE_ORDER } from '../types';
import { nakedSingle } from './nakedSingle';
import { hiddenSingle } from './hiddenSingle';
import { nakedPairs } from './nakedPairs';
import { hiddenPairs } from './hiddenPairs';
import { pointingPairs } from './pointingPairs';
import { boxLineReduction } from './boxLineReduction';
import { nakedTriples } from './nakedTriples';
import { hiddenTriples } from './hiddenTriples';
import { xWing } from './xWing';
import { swordfish } from './swordfish';

export type TechniqueFunction = (
  board: Board,
  candidates: CandidateGrid,
) => TechniqueResult | null;

export interface TechniqueEntry {
  id: TechniqueId;
  name: string;
  difficulty: string;
  scoreWeight: number;
  fn: TechniqueFunction;
}

/** Map from technique ID to its function */
export const TECHNIQUE_MAP: Record<TechniqueId, TechniqueFunction> = {
  nakedSingle,
  hiddenSingle,
  nakedPairs,
  hiddenPairs,
  pointingPairs,
  boxLineReduction,
  nakedTriples,
  hiddenTriples,
  xWing,
  swordfish,
};

/** Full technique entries with metadata, ordered by difficulty */
export const TECHNIQUES: TechniqueEntry[] = [
  { id: 'nakedSingle', name: 'Naked Single', difficulty: 'beginner', scoreWeight: 4, fn: nakedSingle },
  { id: 'hiddenSingle', name: 'Hidden Single', difficulty: 'easy', scoreWeight: 14, fn: hiddenSingle },
  { id: 'nakedPairs', name: 'Naked Pairs', difficulty: 'medium', scoreWeight: 40, fn: nakedPairs },
  { id: 'hiddenPairs', name: 'Hidden Pairs', difficulty: 'medium', scoreWeight: 70, fn: hiddenPairs },
  { id: 'pointingPairs', name: 'Pointing Pairs', difficulty: 'medium', scoreWeight: 50, fn: pointingPairs },
  { id: 'boxLineReduction', name: 'Box/Line Reduction', difficulty: 'medium', scoreWeight: 50, fn: boxLineReduction },
  { id: 'nakedTriples', name: 'Naked Triples', difficulty: 'medium', scoreWeight: 60, fn: nakedTriples },
  { id: 'hiddenTriples', name: 'Hidden Triples', difficulty: 'hard', scoreWeight: 100, fn: hiddenTriples },
  { id: 'xWing', name: 'X-Wing', difficulty: 'hard', scoreWeight: 140, fn: xWing },
  { id: 'swordfish', name: 'Swordfish', difficulty: 'expert', scoreWeight: 200, fn: swordfish },
];

/** Ordered list of technique entries (easiest first) - same as TECHNIQUES but kept for compatibility */
export const TECHNIQUES_ORDERED: { id: TechniqueId; fn: TechniqueFunction }[] =
  TECHNIQUE_ORDER.map((id) => ({ id, fn: TECHNIQUE_MAP[id] }));

export {
  nakedSingle,
  hiddenSingle,
  nakedPairs,
  hiddenPairs,
  pointingPairs,
  boxLineReduction,
  nakedTriples,
  hiddenTriples,
  xWing,
  swordfish,
};
