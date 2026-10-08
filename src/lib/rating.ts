import { MatchData, ActionType, Position } from "./types";

const WEIGHTS: Record<ActionType, Partial<Record<Position, number>> & { default?: number }> = {
  but:              { ATT: 0.8, MIL: 1.0, DEF: 1.2, default: 0 },
  passe_de:         { default: 0.5 },
  tir_cadre:        { default: 0.2 },
  tir_non_cadre:    { default: -0.05 },
  duel_gagne:       { DEF: 0.2, default: 0.15 },
  recuperation:     { DEF: 0.25, MIL: 0.2, default: 0.15 },
  ballon_perdu:     { default: -0.15 },
  arret:            { GK: 0.4, default: 0 },
  but_encaisse:     { GK: -0.5, default: 0 },
  sortie_decisive:  { GK: 0.5, default: 0 },
  relance_reussie:  { GK: 0.1, default: 0 },
};

export function calculateRating(data: MatchData): number {
  let rating = 6.0;

  for (const event of data.events) {
    const w = WEIGHTS[event.type];
    const delta = w[data.position] ?? w.default ?? 0;
    rating += delta;
  }

  return Math.round(Math.min(10, Math.max(2, rating)) * 10) / 10;
}

export function countEvents(data: MatchData, type: ActionType): number {
  return data.events.filter((e) => e.type === type).length;
}

export function getGoalMinutes(data: MatchData): number[] {
  return data.events.filter((e) => e.type === "but").map((e) => e.minute);
}

export function getAssistMinutes(data: MatchData): number[] {
  return data.events.filter((e) => e.type === "passe_de").map((e) => e.minute);
}
