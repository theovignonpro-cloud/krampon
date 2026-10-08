import { MatchData } from "./types";

const STORAGE_KEY = "krampon_match";

export function saveMatch(data: MatchData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function loadMatch(): MatchData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearMatch() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
