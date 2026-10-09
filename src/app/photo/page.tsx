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
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX = 800;
      let w = img.width;
      let h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = (h * MAX) / w; w = MAX; }
        else { w = (w * MAX) / h; h = MAX; }
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      setPreview(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = URL.createObjectURL(file);
  }

  function handleContinue() {
    if (!match) return;
    if (preview) {
      saveMatch({ ...match, playerPhoto: preview });
    }
    router.push("/story");
  }

  if (!match) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center px-6 py-8 bg-white">
      <h1 className="text-2xl font-bold mb-1 flex-shrink-0">📸 Photo du joueur</h1>
      <p className="text-gray-500 text-sm text-center mb-6 flex-shrink-0">
        Prends {match.playerName} en photo pour la story
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
        <div className="flex flex-col items-center gap-3 flex-1 min-h-0 justify-center">
          <div className="w-56 h-56 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
            <img src={preview} alt="" className="w-full h-full object-cover" />
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
          className="flex-1 flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 active:bg-gray-100 transition-colors min-h-0"
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

      <div className="w-full mt-6 space-y-3 flex-shrink-0">
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
      </div>
    </div>
  );
}
