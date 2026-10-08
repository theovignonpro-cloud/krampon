"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadMatch, saveMatch } from "@/lib/storage";

export default function PhotoPage() {
  const router = useRouter();
  const [match, setMatch] = useState(() => loadMatch());
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!match) router.replace("/");
  }, [match, router]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  }

  function handleContinue() {
    if (!match) return;
    if (preview) {
      const updated = { ...match, playerPhoto: preview };
      saveMatch(updated);
      setMatch(updated);
    }
    router.push("/story");
  }

  function handleSkip() {
    router.push("/story");
  }

  if (!match) return null;

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-8 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-bold mb-2">📸 Photo du joueur</h1>
      <p className="text-gray-500 text-sm text-center mb-8">
        Prends {match.playerName} en photo pour personnaliser la story
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      {preview ? (
        <div className="flex flex-col items-center gap-4 flex-1">
          <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={preview}
              alt="Photo du joueur"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="text-sm text-gray-500 underline"
          >
            Reprendre la photo
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex-1 flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <span className="text-5xl mb-3">📷</span>
          <span className="text-lg font-semibold text-gray-600">
            Prendre une photo
          </span>
          <span className="text-sm text-gray-400 mt-1">
            ou choisir depuis la galerie
          </span>
        </button>
      )}

      <div className="w-full mt-8 space-y-3">
        <button
          onClick={handleContinue}
          className={`w-full rounded-xl py-4 font-bold text-lg transition-all active:scale-95 ${
            preview
              ? "bg-green-brand text-white shadow-lg"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {preview ? "Générer la story ✨" : "Continuer sans photo"}
        </button>
        {!preview && (
          <button
            onClick={handleSkip}
            className="w-full py-2 text-sm text-gray-400"
          >
            Passer cette étape
          </button>
        )}
      </div>
    </div>
  );
}
