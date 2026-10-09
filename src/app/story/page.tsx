"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadMatch, clearMatch } from "@/lib/storage";
import {
  calculateRating,
  countEvents,
  getGoalMinutes,
  getAssistMinutes,
} from "@/lib/rating";
import { ACTIONS, POSITION_SHORT, MatchData } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";

export default function StoryPage() {
  const router = useRouter();
  const [match, setMatch] = useState<MatchData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [shared, setShared] = useState(false);
  const hiddenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = loadMatch();
    if (!data) {
      router.replace("/");
      return;
    }
    setMatch(data);
    trackEvent("story_viewed");
  }, [router]);

  async function generateImage(): Promise<Blob | null> {
    if (!hiddenRef.current) return null;
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(hiddenRef.current, {
      width: 1080,
      height: 1920,
      pixelRatio: 1,
      cacheBust: true,
    });
    const res = await fetch(dataUrl);
    return res.blob();
  }

  async function handleDownload() {
    setGenerating(true);
    try {
      const blob = await generateImage();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `krampon-${match?.playerName.toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
      trackEvent("card_downloaded");
    } finally {
      setGenerating(false);
    }
  }

  async function handleShare() {
    setGenerating(true);
    try {
      const blob = await generateImage();
      if (!blob) return;
      const file = new File([blob], "krampon-story.png", { type: "image/png" });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${match?.playerName} — Krampon` });
        setShared(true);
        trackEvent("card_shared");
      } else {
        await handleDownload();
      }
    } finally {
      setGenerating(false);
    }
  }

  function handleNewMatch() {
    clearMatch();
    router.push("/");
  }

  if (!match) return null;

  const rating = calculateRating(match);
  const goalMinutes = getGoalMinutes(match);
  const assistMinutes = getAssistMinutes(match);
  const isGK = match.position === "GK";
  const statsToShow = ACTIONS.filter((a) => a.positions.includes(match.position))
    .map((a) => ({ label: a.label, count: countEvents(match, a.type) }))
    .filter((s) => s.count > 0);

  const ratingColor = rating >= 8 ? "#FFD700" : rating >= 7 ? "#C8AA5A" : rating >= 6 ? "#FFFFFF" : rating >= 5 ? "#FF9944" : "#FF4444";

  const formattedDate = new Date(match.matchDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const storyProps = { match, rating, ratingColor, statsToShow, goalMinutes, assistMinutes, isGK, formattedDate };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#081220]">
      {/* Visible preview - responsive, fits screen with room for buttons */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-4">
        <div
          className="w-full h-full max-w-[calc((100vh-140px)*9/16)]"
          style={{ aspectRatio: "9/16", maxHeight: "calc(100vh - 140px)" }}
        >
          <StoryPreview {...storyProps} />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex-shrink-0 px-4 pb-5 pt-2">
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={handleShare}
            disabled={generating}
            className="flex-1 rounded-xl py-3.5 bg-green-brand text-white font-bold text-base active:scale-95 transition-all disabled:opacity-50"
          >
            {generating ? "..." : shared ? "Partagé ✓" : "Partager 📲"}
          </button>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="flex-1 rounded-xl py-3.5 bg-white/10 text-white font-bold text-base active:scale-95 transition-all disabled:opacity-50"
          >
            {generating ? "..." : "Télécharger 💾"}
          </button>
        </div>
        <button onClick={handleNewMatch} className="block mx-auto mt-2 text-sm text-white/40 font-medium">
          Nouveau match
        </button>
      </div>

      {/* Hidden 1080x1920 canvas for image generation */}
      <div style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none" }}>
        <div
          ref={hiddenRef}
          style={{
            width: 1080,
            height: 1920,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <StoryCanvas {...storyProps} />
        </div>
      </div>
    </div>
  );
}

interface StoryData {
  match: MatchData;
  rating: number;
  ratingColor: string;
  statsToShow: { label: string; count: number }[];
  goalMinutes: number[];
  assistMinutes: number[];
  isGK: boolean;
  formattedDate: string;
}

function StoryPreview({ match, rating, ratingColor, statsToShow, goalMinutes, assistMinutes, isGK, formattedDate }: StoryData) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative flex flex-col" style={{ background: "linear-gradient(170deg, #0a1628 0%, #0f2035 30%, #0d1a2d 60%, #081220 100%)" }}>
      {/* Glow */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[60%] aspect-square rounded-full" style={{ background: "radial-gradient(circle, rgba(200,170,90,0.12) 0%, transparent 70%)" }} />

      <div className="relative flex flex-col h-full p-[5%]">
        {/* Header */}
        <div className="flex justify-between items-center mb-[3%]">
          <div className="text-[4vw] sm:text-lg font-black tracking-[0.2em] text-gold">KRAMPON</div>
          <div className="text-[3vw] sm:text-sm font-extrabold text-gold bg-gold/10 px-3 py-1 rounded-lg border border-gold/20">
            {POSITION_SHORT[match.position]}
          </div>
        </div>

        {/* Photo */}
        <div className="flex justify-center mb-[2%]">
          {match.playerPhoto ? (
            <div className="w-[45%] aspect-square rounded-2xl overflow-hidden border-2 border-gold/50 shadow-2xl">
              <img src={match.playerPhoto} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-[45%] aspect-square rounded-2xl border-2 border-gold/30 flex items-center justify-center text-6xl" style={{ background: "linear-gradient(135deg, #162231, #1a3050)" }}>
              {isGK ? "🧤" : "⚽"}
            </div>
          )}
        </div>

        {/* Name */}
        <div className="text-center text-white font-black uppercase tracking-wider text-[6vw] sm:text-2xl leading-none mb-1">
          {match.playerName}
        </div>

        {/* Rating */}
        <div className="text-center leading-none mb-1">
          <span className="text-[14vw] sm:text-6xl font-black" style={{ color: ratingColor, textShadow: `0 0 40px ${ratingColor}40` }}>
            {rating.toFixed(1)}
          </span>
          <span className="text-[4vw] sm:text-xl font-bold text-[#556677] ml-1">/10</span>
        </div>

        {/* Goal/Assist minutes */}
        {(goalMinutes.length > 0 || assistMinutes.length > 0) && (
          <div className="text-center text-gold font-bold text-[3.5vw] sm:text-sm mb-[2%]">
            {goalMinutes.length > 0 && <span>⚽ {goalMinutes.map((m) => `${m}'`).join(", ")}</span>}
            {goalMinutes.length > 0 && assistMinutes.length > 0 && <span className="mx-2 text-[#2a3a4a]">|</span>}
            {assistMinutes.length > 0 && <span>🅰️ {assistMinutes.map((m) => `${m}'`).join(", ")}</span>}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 flex-1 content-center">
          {statsToShow.length > 0 ? statsToShow.map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-xl py-[8%] text-center border border-white/5">
              <div className="text-[5vw] sm:text-2xl font-black text-white">{stat.count}</div>
              <div className="text-[2.5vw] sm:text-xs font-semibold text-steel mt-0.5">{stat.label}</div>
            </div>
          )) : (
            <div className="col-span-3 text-center text-[3vw] sm:text-sm text-[#556677] py-4">
              Aucune stat enregistrée
            </div>
          )}
        </div>

        {/* Match info */}
        <div className="mt-[2%]">
          <div className="text-center font-black text-[4vw] sm:text-base text-white mb-1">
            {match.teamA} <span className="text-gold mx-2">{match.scoreA} - {match.scoreB}</span> {match.teamB}
          </div>
          <div className="text-center text-[2.5vw] sm:text-xs text-[#667788] mb-2">{formattedDate}</div>
          <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-2" />
          <div className="text-center text-[2.5vw] sm:text-xs font-bold text-gold tracking-wide">
            Fais ta story sur krampon.vercel.app
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryCanvas({ match, rating, ratingColor, statsToShow, goalMinutes, assistMinutes, isGK, formattedDate }: StoryData) {
  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, #0a1628 0%, #0f2035 30%, #0d1a2d 60%, #081220 100%)" }} />
      <div style={{ position: "absolute", top: 180, left: "50%", transform: "translateX(-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,170,90,0.12) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", padding: "56px 64px 48px", color: "#FFFFFF" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "0.2em", color: "#C8AA5A" }}>KRAMPON</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#C8AA5A", background: "rgba(200,170,90,0.12)", padding: "10px 28px", borderRadius: 16, border: "2px solid rgba(200,170,90,0.25)" }}>
            {POSITION_SHORT[match.position]}
          </div>
        </div>

        {/* Photo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          {match.playerPhoto ? (
            <div style={{ width: 440, height: 440, borderRadius: 36, overflow: "hidden", border: "5px solid rgba(200,170,90,0.5)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
              <img src={match.playerPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ) : (
            <div style={{ width: 440, height: 440, borderRadius: 36, background: "linear-gradient(135deg, #162231, #1a3050)", border: "5px solid rgba(200,170,90,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 180 }}>
              {isGK ? "🧤" : "⚽"}
            </div>
          )}
        </div>

        {/* Name */}
        <div style={{ textAlign: "center", fontSize: 80, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1, marginBottom: 12 }}>
          {match.playerName}
        </div>

        {/* Rating */}
        <div style={{ textAlign: "center", marginBottom: 16, lineHeight: 1 }}>
          <span style={{ fontSize: 180, fontWeight: 900, color: ratingColor, textShadow: `0 0 80px ${ratingColor}40`, letterSpacing: "-0.03em" }}>
            {rating.toFixed(1)}
          </span>
          <span style={{ fontSize: 60, fontWeight: 700, color: "#556677", marginLeft: 8 }}>/10</span>
        </div>

        {/* Goal/Assist minutes */}
        {(goalMinutes.length > 0 || assistMinutes.length > 0) && (
          <div style={{ textAlign: "center", marginBottom: 32, fontSize: 42, fontWeight: 700, color: "#C8AA5A" }}>
            {goalMinutes.length > 0 && <span>⚽ {goalMinutes.map((m) => `${m}'`).join(", ")}</span>}
            {goalMinutes.length > 0 && assistMinutes.length > 0 && <span style={{ margin: "0 24px", color: "#2a3a4a" }}>|</span>}
            {assistMinutes.length > 0 && <span>🅰️ {assistMinutes.map((m) => `${m}'`).join(", ")}</span>}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, flex: 1, alignContent: "center" }}>
          {statsToShow.length > 0 ? statsToShow.map((stat) => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 24, padding: "32px 16px", textAlign: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1 }}>{stat.count}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: "#8899AA", marginTop: 10 }}>{stat.label}</div>
            </div>
          )) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", fontSize: 32, color: "#556677", padding: "40px 0" }}>
              Aucune stat enregistrée
            </div>
          )}
        </div>

        {/* Match info */}
        <div style={{ marginTop: 24 }}>
          <div style={{ textAlign: "center", fontSize: 52, fontWeight: 900, marginBottom: 16 }}>
            {match.teamA} <span style={{ color: "#C8AA5A", margin: "0 28px", fontSize: 60 }}>{match.scoreA} - {match.scoreB}</span> {match.teamB}
          </div>
          <div style={{ textAlign: "center", fontSize: 32, color: "#667788", fontWeight: 500, marginBottom: 28 }}>{formattedDate}</div>
          <div style={{ height: 2, background: "linear-gradient(90deg, transparent, rgba(200,170,90,0.3), transparent)", marginBottom: 24 }} />
          <div style={{ textAlign: "center", fontSize: 30, fontWeight: 700, color: "#C8AA5A", letterSpacing: "0.04em" }}>
            Fais ta story sur krampon.vercel.app
          </div>
        </div>
      </div>
    </div>
  );
}
