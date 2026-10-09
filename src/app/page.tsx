"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Position, POSITION_LABELS } from "@/lib/types";
import { saveMatch } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";

const POSITIONS: Position[] = ["ATT", "MIL", "DEF", "GK"];

export default function SetupPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [position, setPosition] = useState<Position | null>(null);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");

  const canStart = playerName.trim() && position && teamA.trim() && teamB.trim();

  function handleStart() {
    if (!canStart || !position) return;
    saveMatch({
      playerName: playerName.trim(),
      position,
      teamA: teamA.trim(),
      teamB: teamB.trim(),
      scoreA: 0,
      scoreB: 0,
      events: [],
      playerPhoto: null,
      matchDate: new Date().toISOString().split("T")[0],
    });
    trackEvent("match_created", { position });
    router.push("/live");
  }

  return (
    <div className="fixed inset-0 flex flex-col px-6 py-6 max-w-md mx-auto w-full">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-green-brand">
          KRAMPON
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Note les stats, génère la story.
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Nom du joueur
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Prénom ou surnom"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:border-green-brand focus:outline-none focus:ring-2 focus:ring-green-brand/20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Poste</label>
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
          <label className="block text-sm font-semibold mb-1">
            Équipe du joueur
          </label>
          <input
            type="text"
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            placeholder="Ex : FC Villeurbanne"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:border-green-brand focus:outline-none focus:ring-2 focus:ring-green-brand/20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Adversaire
          </label>
          <input
            type="text"
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            placeholder="Ex : AS Saint-Priest"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:border-green-brand focus:outline-none focus:ring-2 focus:ring-green-brand/20"
          />
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!canStart}
        className={`mt-4 w-full rounded-xl py-4 text-lg font-bold transition-all flex-shrink-0 ${
          canStart
            ? "bg-green-brand text-white active:scale-95 shadow-lg"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        Commencer le match ⚽
      </button>
    </div>
  );
}
