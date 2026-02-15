'use client';

import { create } from 'zustand';

export interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  highlightPeers: boolean;
  highlightSameDigit: boolean;
  showCandidates: boolean;
  showErrors: boolean;

  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleHighlightPeers: () => void;
  toggleHighlightSameDigit: () => void;
  toggleShowCandidates: () => void;
  toggleShowErrors: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'system',
  highlightPeers: true,
  highlightSameDigit: true,
  showCandidates: true,
  showErrors: true,

  setTheme: (theme) => set({ theme }),
  toggleHighlightPeers: () => set((s) => ({ highlightPeers: !s.highlightPeers })),
  toggleHighlightSameDigit: () => set((s) => ({ highlightSameDigit: !s.highlightSameDigit })),
  toggleShowCandidates: () => set((s) => ({ showCandidates: !s.showCandidates })),
  toggleShowErrors: () => set((s) => ({ showErrors: !s.showErrors })),
}));
