"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ACTIONS, ActionConfig, MatchEvent } from "@/lib/types";
import { loadMatch, saveMatch } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";

export default function LivePage() {
  const router = useRouter();
  const [match, setMatch] = useState(() => loadMatch());
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [halfTime, setHalfTime] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!match) router.replace("/");
  }, [match, router]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
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

  function handleKickoff() {
    setStarted(true);
    setRunning(true);
    trackEvent("match_started");
  }

  function addEvent(action: ActionConfig) {
    if (!match) return;
    const event: MatchEvent = { type: action.type, minute: currentMinute };
    const newEvents = [...match.events, event];
    let newScoreA = match.scoreA;
    let newScoreB = match.scoreB;

    if (action.type === "but" || action.type === "passe_de") {
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

    if (lastEvent.type === "but" || lastEvent.type === "passe_de") newScoreA = Math.max(0, newScoreA - 1);
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
    trackEvent("match_ended", { events: match?.events.length ?? 0, duration: elapsed });
    router.push("/photo");
  }

  if (!match) return null;

  const availableActions = ACTIONS.filter((a) => a.positions.includes(match.position));
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  // Pre-match: show kickoff screen
  if (!started) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-6 bg-white">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-500 mb-2">
            {match.teamA} vs {match.teamB}
          </div>
          <div className="text-2xl font-bold mb-1">
            {match.playerName}
          </div>
          <div className="text-sm text-gray-400 mb-8">
            {match.position}
          </div>
        </div>
        <button
          onClick={handleKickoff}
          className="w-48 h-48 rounded-full bg-green-brand text-white text-2xl font-black active:scale-90 transition-all shadow-xl flex items-center justify-center"
        >
          LANCE
          <br />
          LE MATCH
        </button>
        <p className="mt-6 text-sm text-gray-400">
          Appuie au coup de sifflet
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col select-none bg-white">
      {/* Timer */}
      <div className="flex items-center justify-center gap-4 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => setRunning(!running)}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-base font-bold ${
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
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => adjustScore("A", -1)}
            className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 font-bold text-sm active:scale-90"
          >
            −
          </button>
          <div className="text-center min-w-[70px]">
            <div className="text-xs text-gray-500 font-medium truncate max-w-[70px]">
              {match.teamA}
            </div>
            <div className="text-2xl font-black">{match.scoreA}</div>
          </div>
          <button
            onClick={() => adjustScore("A", 1)}
            className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 font-bold text-sm active:scale-90"
          >
            +
          </button>
        </div>
        <div className="text-lg font-bold text-gray-300">—</div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => adjustScore("B", -1)}
            className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 font-bold text-sm active:scale-90"
          >
            −
          </button>
          <div className="text-center min-w-[70px]">
            <div className="text-xs text-gray-500 font-medium truncate max-w-[70px]">
              {match.teamB}
            </div>
            <div className="text-2xl font-black">{match.scoreB}</div>
          </div>
          <button
            onClick={() => adjustScore("B", 1)}
            className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 font-bold text-sm active:scale-90"
          >
            +
          </button>
        </div>
      </div>

      {/* Last action toast */}
      <div className="h-7 flex items-center justify-center flex-shrink-0">
        {lastAction && (
          <span className="text-sm font-semibold text-green-brand animate-pulse">
            {lastAction}
          </span>
        )}
      </div>

      {/* Action buttons - fills remaining space */}
      <div className="flex-1 px-3 pb-1 min-h-0 overflow-hidden">
        <div className="grid grid-cols-2 gap-2.5 h-full" style={{ gridAutoRows: "1fr" }}>
          {availableActions.map((action) => (
            <button
              key={action.type}
              onClick={() => addEvent(action)}
              className={`rounded-2xl px-2 text-center font-bold transition-all active:scale-90 shadow-sm flex flex-col items-center justify-center ${
                action.positive
                  ? "bg-green-brand/10 text-green-brand border-2 border-green-brand/20 active:bg-green-brand/20"
                  : "bg-red-50 text-red-600 border-2 border-red-100 active:bg-red-100"
              }`}
            >
              <span className="text-xl">{action.emoji}</span>
              <span className="text-sm font-bold leading-tight">{action.label}</span>
              {match.events.filter((e) => e.type === action.type).length > 0 && (
                <span className="text-xs font-normal opacity-60">
                  {match.events.filter((e) => e.type === action.type).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-4 pb-5 pt-2 flex-shrink-0 space-y-2">
        {match.events.length > 0 && (
          <button
            onClick={undoLast}
            className="w-full py-1.5 text-xs text-gray-400 font-medium"
          >
            ↩ Annuler la dernière action
          </button>
        )}
        {!halfTime ? (
          <button
            onClick={() => { setHalfTime(true); setRunning(false); }}
            className="w-full rounded-xl py-3 bg-amber-500 text-white font-bold text-base active:scale-95"
          >
            Mi-temps ⏸
          </button>
        ) : !running ? (
          <div className="space-y-2">
            <button
              onClick={() => setRunning(true)}
              className="w-full rounded-xl py-3 bg-green-brand text-white font-bold text-base active:scale-95"
            >
              Reprendre le match ▶
            </button>
            <button
              onClick={handleEndMatch}
              className="w-full rounded-xl py-3 bg-red-600 text-white font-bold text-base active:scale-95"
            >
              Fin du match 🏁
            </button>
          </div>
        ) : (
          <button
            onClick={handleEndMatch}
            className="w-full rounded-xl py-3 bg-red-600 text-white font-bold text-base active:scale-95"
          >
            Fin du match 🏁
          </button>
        )}
      </div>
    </div>
  );
}
