"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ACTIONS, ActionConfig, MatchEvent } from "@/lib/types";
import { loadMatch, saveMatch } from "@/lib/storage";

export default function LivePage() {
  const router = useRouter();
  const [match, setMatch] = useState(() => loadMatch());
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [halfTime, setHalfTime] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!match) {
      router.replace("/");
    }
  }, [match, router]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const currentMinute = Math.floor(elapsed / 60) + 1;

  const persist = useCallback(
    (events: MatchEvent[], scoreA: number, scoreB: number) => {
      if (!match) return;
      const updated = { ...match, events, scoreA, scoreB };
      setMatch(updated);
      saveMatch(updated);
    },
    [match]
  );

  function addEvent(action: ActionConfig) {
    if (!match) return;
    const event: MatchEvent = { type: action.type, minute: currentMinute };
    const newEvents = [...match.events, event];
    let newScoreA = match.scoreA;
    let newScoreB = match.scoreB;

    if (action.type === "but") {
      newScoreA += 1;
    }
    if (action.type === "but_encaisse") {
      newScoreB += 1;
    }

    persist(newEvents, newScoreA, newScoreB);
    setLastAction(`${action.emoji} ${action.label} — ${currentMinute}'`);
    setTimeout(() => setLastAction(null), 2000);
  }

  function undoLast() {
    if (!match || match.events.length === 0) return;
    const lastEvent = match.events[match.events.length - 1];
    const newEvents = match.events.slice(0, -1);
    let newScoreA = match.scoreA;
    let newScoreB = match.scoreB;

    if (lastEvent.type === "but") newScoreA = Math.max(0, newScoreA - 1);
    if (lastEvent.type === "but_encaisse") newScoreB = Math.max(0, newScoreB - 1);

    persist(newEvents, newScoreA, newScoreB);
  }

  function adjustScore(team: "A" | "B", delta: number) {
    if (!match) return;
    const newA = team === "A" ? Math.max(0, match.scoreA + delta) : match.scoreA;
    const newB = team === "B" ? Math.max(0, match.scoreB + delta) : match.scoreB;
    persist(match.events, newA, newB);
  }

  function handleEndMatch() {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    router.push("/photo");
  }

  if (!match) return null;

  const availableActions = ACTIONS.filter((a) =>
    a.positions.includes(match.position)
  );

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex flex-1 flex-col max-w-md mx-auto w-full select-none">
      {/* Timer */}
      <div className="flex items-center justify-center gap-4 py-3 bg-gray-50 border-b border-gray-100">
        <button
          onClick={() => setRunning(!running)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold ${
            running ? "bg-amber-500" : "bg-green-brand"
          }`}
        >
          {running ? "⏸" : "▶"}
        </button>
        <span className="text-2xl font-mono font-bold tabular-nums tracking-wider">
          {mm}:{ss}
        </span>
        <span className="text-sm text-gray-400 font-semibold">{currentMinute}&apos;</span>
      </div>

      {/* Score */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustScore("A", -1)}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold active:scale-90"
          >
            −
          </button>
          <div className="text-center min-w-[80px]">
            <div className="text-xs text-gray-500 font-medium truncate max-w-[80px]">
              {match.teamA}
            </div>
            <div className="text-3xl font-black">{match.scoreA}</div>
          </div>
          <button
            onClick={() => adjustScore("A", 1)}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold active:scale-90"
          >
            +
          </button>
        </div>

        <div className="text-xl font-bold text-gray-300">—</div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustScore("B", -1)}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold active:scale-90"
          >
            −
          </button>
          <div className="text-center min-w-[80px]">
            <div className="text-xs text-gray-500 font-medium truncate max-w-[80px]">
              {match.teamB}
            </div>
            <div className="text-3xl font-black">{match.scoreB}</div>
          </div>
          <button
            onClick={() => adjustScore("B", 1)}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold active:scale-90"
          >
            +
          </button>
        </div>
      </div>

      {/* Last action toast */}
      <div className="h-8 flex items-center justify-center">
        {lastAction && (
          <span className="text-sm font-semibold text-green-brand animate-pulse">
            {lastAction}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex-1 px-4 pb-2">
        <div className="grid grid-cols-2 gap-3">
          {availableActions.map((action) => (
            <button
              key={action.type}
              onClick={() => addEvent(action)}
              className={`rounded-2xl py-5 px-3 text-center font-bold text-lg transition-all active:scale-90 shadow-sm ${
                action.positive
                  ? "bg-green-brand/10 text-green-brand border-2 border-green-brand/20 active:bg-green-brand/20"
                  : "bg-red-50 text-red-600 border-2 border-red-100 active:bg-red-100"
              }`}
            >
              <span className="text-2xl block mb-1">{action.emoji}</span>
              {action.label}
              <span className="block text-xs font-normal mt-0.5 opacity-60">
                {match.events.filter((e) => e.type === action.type).length || ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-4 pb-6 pt-2 space-y-3">
        {/* Undo */}
        {match.events.length > 0 && (
          <button
            onClick={undoLast}
            className="w-full py-2 text-sm text-gray-400 font-medium"
          >
            ↩ Annuler la dernière action
          </button>
        )}

        {/* Half time / End match */}
        {!halfTime ? (
          <button
            onClick={() => setHalfTime(true)}
            className="w-full rounded-xl py-3.5 bg-amber-500 text-white font-bold text-lg active:scale-95"
          >
            Mi-temps
          </button>
        ) : (
          <button
            onClick={handleEndMatch}
            className="w-full rounded-xl py-3.5 bg-red-600 text-white font-bold text-lg active:scale-95"
          >
            Fin du match 🏁
          </button>
        )}
      </div>
    </div>
  );
}
