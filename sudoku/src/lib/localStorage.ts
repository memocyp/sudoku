// ---------------------------------------------------------------------------
// SSR-safe localStorage wrapper
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setItem(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage full or access denied — silently ignore
  }
}

export function removeItem(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Access denied — silently ignore
  }
}
