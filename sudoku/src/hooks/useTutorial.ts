'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TutorialStep {
  title: string;
  content: string;
  board?: number[];
  highlightCells?: number[];
  highlightDigits?: number[];
  action?: string;
}

export interface TutorialData {
  slug: string;
  title: string;
  description: string;
  steps: TutorialStep[];
}

export interface UseTutorialReturn {
  steps: TutorialStep[];
  currentStep: TutorialStep | null;
  currentIndex: number;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  isComplete: boolean;
  progress: number; // 0-1
  loading: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Loads a tutorial by slug from `/tutorials/{slug}.json` and manages step
 * navigation, completion tracking, and progress calculation.
 */
export function useTutorial(slug: string | null): UseTutorialReturn {
  const [data, setData] = useState<TutorialData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!!slug);
  const [error, setError] = useState<string | null>(null);

  // Fetch tutorial JSON when slug changes
  useEffect(() => {
    if (!slug) {
      setData(null);
      setCurrentIndex(0);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const response = await fetch(`/tutorials/${slug}.json`);
        if (!response.ok) {
          throw new Error(`Tutorial not found: ${slug}`);
        }
        const json: TutorialData = await response.json();
        if (!cancelled) {
          setData(json);
          setCurrentIndex(0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load tutorial');
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const steps = data?.steps ?? [];
  const totalSteps = steps.length;

  const next = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, totalSteps - 1)));
    },
    [totalSteps],
  );

  const currentStep = totalSteps > 0 ? steps[currentIndex] : null;
  const isComplete = totalSteps > 0 && currentIndex >= totalSteps - 1;
  const progress = totalSteps > 0 ? (currentIndex + 1) / totalSteps : 0;

  return {
    steps,
    currentStep,
    currentIndex,
    next,
    prev,
    goTo,
    isComplete,
    progress,
    loading,
    error,
  };
}
