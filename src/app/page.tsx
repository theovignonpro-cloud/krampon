"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Position, POSITION_LABELS } from "@/lib/types";
import { saveMatch } from "@/lib/storage";

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
    router.push("/live");
  }

  return (
    <div className="flex flex-1 flex-col px-6 py-8 max-w-md mx-auto w-full">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-green-brand">
          KRAMPON
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Note les stats, génère la story.
        </p>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        <div>
          <label className="block text-sm font-semibold mb-2">
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
          <label className="block text-sm font-semibold mb-2">Poste</label>
          <div className="grid grid-cols-2 gap-3">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`rounded-xl py-3 px-4 text-center font-semibold transition-all ${
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
          <label className="block text-sm font-semibold mb-2">
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
          <label className="block text-sm font-semibold mb-2">
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
        className={`mt-8 w-full rounded-xl py-4 text-lg font-bold transition-all ${
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
