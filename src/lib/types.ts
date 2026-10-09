export type Position = "ATT" | "MIL" | "DEF" | "GK";

export type ActionType =
  | "but"
  | "passe_de"
  | "tir_cadre"
  | "tir_non_cadre"
  | "duel_gagne"
  | "duel_perdu"
  | "recuperation"
  | "ballon_perdu"
  | "arret"
  | "but_encaisse"
  | "sortie_decisive"
  | "relance_reussie";

export interface MatchEvent {
  type: ActionType;
  minute: number;
}

export interface MatchData {
  playerName: string;
  position: Position;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  events: MatchEvent[];
  playerPhoto: string | null;
  matchDate: string;
}

export interface ActionConfig {
  type: ActionType;
  label: string;
  emoji: string;
  positions: Position[];
  positive: boolean;
}

export const ACTIONS: ActionConfig[] = [
  { type: "but", label: "But", emoji: "⚽", positions: ["ATT", "MIL", "DEF"], positive: true },
  { type: "passe_de", label: "Passe dé", emoji: "🅰️", positions: ["ATT", "MIL", "DEF"], positive: true },
  { type: "tir_cadre", label: "Tir cadré", emoji: "🎯", positions: ["ATT", "MIL", "DEF"], positive: true },
  { type: "tir_non_cadre", label: "Tir non cadré", emoji: "↗️", positions: ["ATT", "MIL", "DEF"], positive: false },
  { type: "duel_gagne", label: "Duel gagné", emoji: "💪", positions: ["ATT", "MIL", "DEF"], positive: true },
  { type: "duel_perdu", label: "Duel perdu", emoji: "😵", positions: ["ATT", "MIL", "DEF"], positive: false },
  { type: "recuperation", label: "Ballon récup", emoji: "🦶", positions: ["ATT", "MIL", "DEF"], positive: true },
  { type: "ballon_perdu", label: "Ballon perdu", emoji: "❌", positions: ["ATT", "MIL", "DEF", "GK"], positive: false },
  { type: "arret", label: "Arrêt", emoji: "🧤", positions: ["GK"], positive: true },
  { type: "but_encaisse", label: "But encaissé", emoji: "😤", positions: ["GK"], positive: false },
  { type: "sortie_decisive", label: "Sortie", emoji: "🥊", positions: ["GK"], positive: true },
  { type: "relance_reussie", label: "Relance", emoji: "📤", positions: ["GK"], positive: true },
];

export const POSITION_LABELS: Record<Position, string> = {
  ATT: "Attaquant",
  MIL: "Milieu",
  DEF: "Défenseur",
  GK: "Gardien",
};

export const POSITION_SHORT: Record<Position, string> = {
  ATT: "ATT",
  MIL: "MIL",
  DEF: "DEF",
  GK: "GK",
};
