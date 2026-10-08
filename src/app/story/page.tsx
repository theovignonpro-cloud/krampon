"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadMatch, clearMatch } from "@/lib/storage";
import {
  calculateRating,
  countEvents,
  getGoalMinutes,
  getAssistMinutes,
} from "@/lib/rating";
import { ACTIONS, POSITION_SHORT, MatchData } from "@/lib/types";

export default function StoryPage() {
  const router = useRouter();
  const [match, setMatch] = useState<MatchData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [shared, setShared] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  const updateScale = useCallback(() => {
    if (containerRef.current) {
      setScale(containerRef.current.offsetWidth / 1080);
    }
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

  useEffect(() => {
    const data = loadMatch();
    if (!data) {
      router.replace("/");
      return;
    }
    setMatch(data);
  }, [router]);

  async function generateImage(): Promise<Blob | null> {
    if (!storyRef.current) return null;
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(storyRef.current, {
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
        await navigator.share({
          files: [file],
          title: `${match?.playerName} — Krampon`,
        });
        setShared(true);
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
  const relevantActions = ACTIONS.filter((a) =>
    a.positions.includes(match.position)
  );
  const statsToShow = relevantActions
    .map((a) => ({
      label: a.label,
      emoji: a.emoji,
      count: countEvents(match, a.type),
    }))
    .filter((s) => s.count > 0);

  const ratingColor =
    rating >= 8
      ? "#FFD700"
      : rating >= 7
        ? "#C8AA5A"
        : rating >= 6
          ? "#FFFFFF"
          : rating >= 5
            ? "#FF9944"
            : "#FF4444";

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-6 max-w-md mx-auto w-full">
      <h1 className="text-xl font-bold mb-4">Story prête ! 🔥</h1>

      {/* Story preview (scaled down for screen) */}
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-2xl shadow-2xl mb-6"
        style={{ aspectRatio: "9/16", position: "relative" }}
      >
        <div
          ref={storyRef}
          style={{
            width: 1080,
            height: 1920,
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
            background: "linear-gradient(180deg, #0F1923 0%, #1a2a3a 40%, #0F1923 100%)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          <StoryContent
            match={match}
            rating={rating}
            ratingColor={ratingColor}
            statsToShow={statsToShow}
            goalMinutes={goalMinutes}
            assistMinutes={assistMinutes}
            isGK={isGK}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full space-y-3">
        <button
          onClick={handleShare}
          disabled={generating}
          className="w-full rounded-xl py-4 bg-green-brand text-white font-bold text-lg active:scale-95 transition-all shadow-lg disabled:opacity-50"
        >
          {generating ? "Génération..." : shared ? "Partagé ✓" : "Partager la story 📲"}
        </button>
        <button
          onClick={handleDownload}
          disabled={generating}
          className="w-full rounded-xl py-3.5 bg-gray-100 text-gray-700 font-bold text-lg active:scale-95 transition-all disabled:opacity-50"
        >
          Télécharger l&apos;image 💾
        </button>
        <button
          onClick={handleNewMatch}
          className="w-full py-3 text-sm text-gray-400 font-medium"
        >
          Nouveau match
        </button>
      </div>
    </div>
  );
}

function StoryContent({
  match,
  rating,
  ratingColor,
  statsToShow,
  goalMinutes,
  assistMinutes,
  isGK,
}: {
  match: MatchData;
  rating: number;
  ratingColor: string;
  statsToShow: { label: string; emoji: string; count: number }[];
  goalMinutes: number[];
  assistMinutes: number[];
  isGK: boolean;
}) {
  const formattedDate = new Date(match.matchDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "60px 60px 40px",
      }}
    >
      {/* Header - Krampon branding */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: "0.15em",
            color: "#C8AA5A",
          }}
        >
          KRAMPON
        </div>
        <div style={{ fontSize: 28, color: "#8899AA" }}>
          {POSITION_SHORT[match.position]}
        </div>
      </div>

      {/* Player photo */}
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        {match.playerPhoto ? (
          <div
            style={{
              width: 400,
              height: 400,
              borderRadius: 32,
              overflow: "hidden",
              border: "4px solid #C8AA5A",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <img
              src={match.playerPhoto}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 400,
              height: 400,
              borderRadius: 32,
              background: "linear-gradient(135deg, #162231 0%, #1a3050 100%)",
              border: "4px solid #C8AA5A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 160,
            }}
          >
            {isGK ? "🧤" : "⚽"}
          </div>
        )}
      </div>

      {/* Player name */}
      <div
        style={{
          textAlign: "center",
          fontSize: 56,
          fontWeight: 900,
          letterSpacing: "0.02em",
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        {match.playerName}
      </div>

      {/* Rating */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: 100,
            fontWeight: 900,
            color: ratingColor,
            lineHeight: 1,
            textShadow: `0 0 40px ${ratingColor}40`,
          }}
        >
          {rating.toFixed(1)}
        </span>
        <span
          style={{
            fontSize: 36,
            color: "#8899AA",
            marginLeft: 8,
          }}
        >
          /10
        </span>
      </div>

      {/* Goal/Assist minutes */}
      {(goalMinutes.length > 0 || assistMinutes.length > 0) && (
        <div
          style={{
            textAlign: "center",
            marginBottom: 32,
            fontSize: 32,
            color: "#C8AA5A",
          }}
        >
          {goalMinutes.length > 0 && (
            <span>⚽ {goalMinutes.map((m) => `${m}'`).join(", ")}</span>
          )}
          {goalMinutes.length > 0 && assistMinutes.length > 0 && (
            <span style={{ margin: "0 16px", color: "#334455" }}>|</span>
          )}
          {assistMinutes.length > 0 && (
            <span>🅰️ {assistMinutes.map((m) => `${m}'`).join(", ")}</span>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: statsToShow.length <= 4 ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 40,
          flex: 1,
          alignContent: "start",
        }}
      >
        {statsToShow.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 20,
              padding: "20px 16px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 44, fontWeight: 900 }}>{stat.count}</div>
            <div style={{ fontSize: 22, color: "#8899AA", marginTop: 4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Match info */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 32,
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 36,
            fontWeight: 800,
            marginBottom: 12,
          }}
        >
          {match.teamA}{" "}
          <span style={{ color: "#C8AA5A" }}>
            {match.scoreA} - {match.scoreB}
          </span>{" "}
          {match.teamB}
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 24,
            color: "#8899AA",
            marginBottom: 24,
          }}
        >
          {formattedDate}
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 22,
            color: "#556677",
          }}
        >
          Fais ta story sur krampon.vercel.app
        </div>
      </div>
    </div>
  );
}
