"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Position, POSITION_LABELS, ACTIONS, ActionType, MatchEvent } from "@/lib/types";
import { saveMatch } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";

const POSITIONS: Position[] = ["ATT", "MIL", "DEF", "GK"];

export default function RecapPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [playerName, setPlayerName] = useState("");
  const [position, setPosition] = useState<Position | null>(null);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [stats, setStats] = useState<Record<ActionType, number>>({} as Record<ActionType, number>);

  const availableActions = position
    ? ACTIONS.filter((a) => a.positions.includes(position))
    : [];

  function setStat(type: ActionType, value: number) {
    setStats((prev) => ({ ...prev, [type]: Math.max(0, value) }));
  }

  const canGoStep1 = playerName.trim() && position && teamA.trim() && teamB.trim();

  function handleGenerate() {
    if (!position) return;
    const events: MatchEvent[] = [];
    for (const action of availableActions) {
      const count = stats[action.type] || 0;
      for (let i = 0; i < count; i++) {
        events.push({ type: action.type, minute: 0 });
      }
    }

    saveMatch({
      playerName: playerName.trim(),
      position,
      teamA: teamA.trim(),
      teamB: teamB.trim(),
      scoreA,
      scoreB,
      events,
      playerPhoto: null,
      matchDate: new Date().toISOString().split("T")[0],
    });

    trackEvent("match_created", { position, mode: "recap" });
    router.push("/photo");
  }

  if (step === 0) {
    return (
      <div className="fixed inset-0 flex flex-col px-6 py-6 max-w-md mx-auto w-full">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-green-brand">Récap ton match</h1>
          <p className="text-sm text-gray-500 mt-1">Étape 1/2 — Infos du match</p>
        </div>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div>
            <label className="block text-sm font-semibold mb-1">Ton prénom</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Prénom ou surnom"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:border-green-brand focus:outline-none focus:ring-2 focus:ring-green-brand/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Ton poste</label>
            <div className="grid grid-cols-4 gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`rounded-xl py-2.5 text-center font-semibold text-sm transition-all ${
                    position === pos
                      ? "bg-green-brand text-white shadow-lg scale-[1.02]"
                      : "bg-gray-100 text-gray-700 active:scale-95"
                  }`}
                >
                  {POSITION_LABELS[pos]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Ton équipe</label>
            <input
              type="text"
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              placeholder="Ex : FC Villeurbanne"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:border-green-brand focus:outline-none focus:ring-2 focus:ring-green-brand/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Adversaire</label>
            <input
              type="text"
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              placeholder="Ex : AS Saint-Priest"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:border-green-brand focus:outline-none focus:ring-2 focus:ring-green-brand/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Score final</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center">
                <div className="text-xs text-gray-500 mb-1 truncate">{teamA || "Ton équipe"}</div>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setScoreA(Math.max(0, scoreA - 1))} className="w-9 h-9 rounded-full bg-gray-100 font-bold active:scale-90">−</button>
                  <span className="text-3xl font-black w-8 text-center">{scoreA}</span>
                  <button onClick={() => setScoreA(scoreA + 1)} className="w-9 h-9 rounded-full bg-gray-100 font-bold active:scale-90">+</button>
                </div>
              </div>
              <span className="text-xl font-bold text-gray-300 mt-4">—</span>
              <div className="flex-1 text-center">
                <div className="text-xs text-gray-500 mb-1 truncate">{teamB || "Adversaire"}</div>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setScoreB(Math.max(0, scoreB - 1))} className="w-9 h-9 rounded-full bg-gray-100 font-bold active:scale-90">−</button>
                  <span className="text-3xl font-black w-8 text-center">{scoreB}</span>
                  <button onClick={() => setScoreB(scoreB + 1)} className="w-9 h-9 rounded-full bg-gray-100 font-bold active:scale-90">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setStep(1)}
          disabled={!canGoStep1}
          className={`mt-4 w-full rounded-xl py-4 text-lg font-bold transition-all flex-shrink-0 ${
            canGoStep1
              ? "bg-green-brand text-white active:scale-95 shadow-lg"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Suivant — Tes stats →
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col px-6 py-6 max-w-md mx-auto w-full">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-green-brand">Tes stats</h1>
        <p className="text-sm text-gray-500 mt-1">Étape 2/2 — Combien de chaque ?</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
        {availableActions.map((action) => (
          <div
            key={action.type}
            className={`flex items-center justify-between rounded-xl px-4 py-3 ${
              action.positive
                ? "bg-green-brand/5 border border-green-brand/15"
                : "bg-red-50 border border-red-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{action.emoji}</span>
              <span className="font-semibold">{action.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStat(action.type, (stats[action.type] || 0) - 1)}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 font-bold text-gray-500 active:scale-90"
              >
                −
              </button>
              <span className="text-xl font-black w-8 text-center">
                {stats[action.type] || 0}
              </span>
              <button
                onClick={() => setStat(action.type, (stats[action.type] || 0) + 1)}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 font-bold text-gray-500 active:scale-90"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 flex-shrink-0">
        <button
          onClick={handleGenerate}
          className="w-full rounded-xl py-4 text-lg font-bold bg-green-brand text-white active:scale-95 transition-all shadow-lg"
        >
          Générer ma story ✨
        </button>
        <button
          onClick={() => setStep(0)}
          className="w-full py-2 text-sm text-gray-400"
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}
