"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6 bg-white">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-green-brand">
          KRAMPON
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Tes stats. Ta note. Ta story.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={() => router.push("/recap")}
          className="w-full rounded-2xl py-5 px-6 bg-green-brand text-white text-left active:scale-[0.98] transition-all shadow-lg"
        >
          <div className="text-lg font-bold">J'ai déjà joué ⚽</div>
          <div className="text-sm opacity-80 mt-1">
            Rentre tes stats et génère ta story
          </div>
        </button>

        <button
          onClick={() => router.push("/setup")}
          className="w-full rounded-2xl py-5 px-6 bg-gray-100 text-gray-800 text-left active:scale-[0.98] transition-all"
        >
          <div className="text-lg font-bold">Je note un match en direct 📋</div>
          <div className="text-sm text-gray-500 mt-1">
            Quelqu'un note les stats pendant le match
          </div>
        </button>
      </div>
    </div>
  );
}
