import { useState, useCallback } from "react";

interface InteractiveCakeProps {
  onCutComplete?: () => void;
}

export function InteractiveCake({ onCutComplete }: InteractiveCakeProps) {
  // Step 1: 'lit' (candles on) -> 'blown' (candles out)
  // Step 2: 'cutting' (knife animates) -> 'cut' (slice served)
  const [stage, setStage] = useState<"lit" | "blown" | "cutting" | "cut">("lit");
  const [wishMade, setWishMade] = useState(false);

  // Handle blowing the candles
  const handleBlowCandles = useCallback(() => {
    if (stage !== "lit") return;
    setStage("blown");
    setWishMade(true);
  }, [stage]);

  // Handle cutting the cake
  const handleCutCake = useCallback(() => {
    if (stage !== "blown") return;
    setStage("cutting");

    setTimeout(() => {
      setStage("cut");
      onCutComplete?.();
    }, 1800);
  }, [stage, onCutComplete]);

  // Reset to relive the animation
  const handleReset = useCallback(() => {
    setStage("lit");
    setWishMade(false);
  }, []);

  const isBlown = stage !== "lit";
  const isCutting = stage === "cutting";
  const isCut = stage === "cut";

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center select-none">
      {/* Step Indicator Header */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-wider text-primary uppercase backdrop-blur-md">
        {!isBlown && <span>Step 1 of 2: Blow Candles</span>}
        {isBlown && !isCut && !isCutting && <span>Step 2 of 2: Cut the Cake</span>}
        {(isCutting || isCut) && <span>Celebration Time 🎉</span>}
      </div>

      {/* Cake Stage Illustration */}
      <div className="relative my-6 flex h-64 w-72 items-end justify-center sm:w-80">
        {/* Platter Base */}
        <div className="absolute bottom-2 z-0 h-4 w-68 rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-200/80 to-amber-500/50 shadow-lg blur-[1px] sm:w-76" />
        <div className="absolute bottom-3 z-0 h-2.5 w-64 rounded-full bg-gradient-to-r from-amber-300 via-amber-100 to-yellow-400 sm:w-72" />

        {/* The Animated Slicing Knife */}
        {isCutting && (
          <div className="pointer-events-none absolute -top-8 right-6 z-40 animate-knife">
            <svg
              width="90"
              height="90"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-2xl"
            >
              {/* Knife handle */}
              <rect
                x="68"
                y="10"
                width="14"
                height="32"
                rx="4"
                fill="#4A3B32"
                stroke="#D4AF37"
                strokeWidth="2"
                transform="rotate(40 68 10)"
              />
              <circle cx="68" cy="24" r="2" fill="#D4AF37" />
              {/* Blade bolster */}
              <rect
                x="50"
                y="28"
                width="8"
                height="12"
                rx="1.5"
                fill="#C0C0C0"
                transform="rotate(40 50 28)"
              />
              {/* Steel Blade */}
              <path
                d="M48 35L15 80C12 84 8 82 10 77L26 30C28 26 34 25 38 27L48 35Z"
                fill="url(#knife-steel)"
                stroke="#E2E8F0"
                strokeWidth="1.5"
              />
              {/* Blade shine edge */}
              <path
                d="M15 80L45 35"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="knife-steel" x1="10" y1="30" x2="50" y2="80" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F8FAFC" />
                  <stop offset="0.5" stopColor="#CBD5E1" />
                  <stop offset="1" stopColor="#94A3B8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {/* Entire Cake Structure */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Candles Container */}
          <div className="relative z-20 mb-[-2px] flex items-end justify-center gap-7">
            {[
              { id: "c1", height: 36, color: "from-rose-400 to-amber-300" },
              { id: "c2", height: 42, color: "from-yellow-300 to-amber-400" },
              { id: "c3", height: 36, color: "from-sky-400 to-rose-400" },
            ].map((candle, idx) => (
              <div key={candle.id} className="relative flex flex-col items-center">
                {/* Flame or Rising Smoke */}
                {!isBlown ? (
                  <div className="relative mb-1 flex items-center justify-center">
                    {/* Outer warm halo */}
                    <span className="absolute h-8 w-8 rounded-full bg-amber-400/30 blur-sm" />
                    {/* Dancing Flame */}
                    <div
                      className="h-5 w-3.5 origin-bottom rounded-[50%_50%_20%_20%] bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_12px_#F5D061] animate-flame"
                      style={{ animationDelay: `${idx * 0.14}s` }}
                    >
                      {/* Inner white core */}
                      <span className="mx-auto mt-2 block h-2 w-1.5 rounded-full bg-white/90" />
                    </div>
                  </div>
                ) : (
                  /* Smoke puff when blown */
                  <div className="relative mb-1 flex h-6 w-6 items-center justify-center">
                    <span
                      className="absolute block h-3 w-3 rounded-full bg-white/40 blur-[2px] animate-smoke"
                      style={{ animationDelay: `${idx * 0.08}s` }}
                    />
                    <span
                      className="absolute block h-2 w-2 rounded-full bg-gray-200/50 blur-[1px] animate-smoke"
                      style={{ animationDelay: `${idx * 0.15 + 0.1}s` }}
                    />
                  </div>
                )}

                {/* Candle Wick */}
                <div className="h-2 w-0.5 bg-neutral-800" />

                {/* Striped Candle Body */}
                <div
                  className={`w-3 rounded-t-sm bg-gradient-to-b ${candle.color} shadow-sm`}
                  style={{ height: `${candle.height}px` }}
                >
                  <div className="h-full w-full opacity-40 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,#ffffff_3px,#ffffff_6px)]" />
                </div>
              </div>
            ))}
          </div>

          {/* Top Cake Tier */}
          <div className="relative z-15 w-44 overflow-hidden rounded-t-2xl border-b-2 border-amber-200/20 bg-gradient-to-r from-rose-400/90 via-pink-300 to-rose-400/90 shadow-md">
            {/* Dripping Vanilla/Strawberry Frosting */}
            <div className="flex h-5 w-full items-start justify-around">
              {[12, 16, 14, 18, 13, 17, 12].map((h, i) => (
                <span
                  key={i}
                  className="rounded-b-full bg-white/95 shadow-sm"
                  style={{ width: "13%", height: `${h}px` }}
                />
              ))}
            </div>

            {/* Sprinkles on top tier */}
            <div className="relative h-9 w-full px-3 py-1">
              <span className="absolute top-2 left-6 h-1 w-2.5 rotate-12 rounded-full bg-amber-200 shadow-sm" />
              <span className="absolute top-4 left-16 h-1 w-2 -rotate-45 rounded-full bg-blue-300 shadow-sm" />
              <span className="absolute top-2 right-12 h-1 w-2.5 rotate-45 rounded-full bg-pink-100 shadow-sm" />
              <span className="absolute top-4 right-6 h-1 w-2 -rotate-12 rounded-full bg-emerald-300 shadow-sm" />
              <span className="absolute bottom-1 left-24 h-1 w-2 rotate-90 rounded-full bg-purple-200 shadow-sm" />
            </div>
          </div>

          {/* Middle Decorative Cream Swirl Band */}
          <div className="z-16 -my-1 flex w-48 justify-around px-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="h-3 w-3.5 rounded-full border border-amber-100/50 bg-gradient-to-b from-white via-amber-50 to-pink-100 shadow-sm"
              />
            ))}
          </div>

          {/* Bottom Cake Tier */}
          <div className="relative z-10 flex w-56 flex-col justify-end overflow-hidden rounded-b-xl border-t border-white/20 bg-gradient-to-r from-amber-600/90 via-amber-500 to-amber-700/90 shadow-xl sm:w-64">
            {/* Cut Wedge Highlight / Separated Slice */}
            {isCut && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
                <div className="rounded-lg bg-black/50 px-3 py-1 text-xs font-medium text-amber-200 backdrop-blur-md">
                  ✨ Sliced with love ✨
                </div>
              </div>
            )}

            {/* Bottom tier frosting scallops */}
            <div className="flex h-3.5 w-full items-start justify-between px-1">
              {Array.from({ length: 11 }).map((_, i) => (
                <span
                  key={i}
                  className="h-3 w-4 rounded-b-full bg-amber-100/90 shadow-sm"
                />
              ))}
            </div>

            {/* Cake sponge texture and colorful pearls */}
            <div className="relative h-14 w-full px-4 py-2">
              <span className="absolute top-3 left-10 h-1.5 w-1.5 rounded-full bg-rose-300 shadow-sm" />
              <span className="absolute top-5 left-24 h-1.5 w-1.5 rounded-full bg-yellow-200 shadow-sm" />
              <span className="absolute top-2 right-16 h-1.5 w-1.5 rounded-full bg-sky-200 shadow-sm" />
              <span className="absolute top-6 right-8 h-1.5 w-1.5 rounded-full bg-emerald-200 shadow-sm" />
              <span className="absolute bottom-2 left-18 h-1.5 w-1.5 rounded-full bg-purple-300 shadow-sm" />
            </div>

            {/* Bottom rim gold bead border */}
            <div className="flex h-2.5 w-full justify-between bg-amber-900/40 px-2 py-0.5">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-amber-300/80 shadow-xs"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Served Cake Slice on Plate (Appears when cut!) */}
        {isCut && (
          <div className="absolute -right-4 -bottom-3 z-30 flex flex-col items-center animate-slice-out sm:-right-8">
            {/* Small Strawberry on top of slice */}
            <div className="mb-[-4px] z-10 flex flex-col items-center">
              <span className="h-1.5 w-2 rounded-full bg-emerald-400" />
              <span className="h-3.5 w-3 rounded-full bg-rose-500 shadow-sm" />
            </div>
            {/* The Cut Slice Wedge */}
            <div className="relative h-12 w-16 overflow-hidden rounded-t-md border border-amber-200/50 bg-gradient-to-r from-pink-300 via-amber-400 to-amber-600 shadow-xl">
              <div className="h-2 w-full bg-white/95" />
              <div className="flex justify-around pt-1">
                <span className="h-1 w-1 rounded-full bg-rose-500" />
                <span className="h-1 w-1 rounded-full bg-blue-400" />
                <span className="h-1 w-1 rounded-full bg-yellow-200" />
              </div>
            </div>
            {/* Golden Dessert Plate */}
            <div className="mt-[-2px] h-3 w-22 rounded-full border border-amber-300 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 shadow-lg" />
          </div>
        )}
      </div>

      {/* Dynamic Instruction & Status Text */}
      <div className="mt-2 text-center min-h-[3.2rem]">
        {!wishMade && (
          <p className="text-sm font-medium text-foreground/90 transition-all">
            🕯️ Make a silent wish in your heart, then blow the candles!
          </p>
        )}
        {wishMade && !isCutting && !isCut && (
          <p className="text-sm font-medium text-primary transition-all animate-pulse">
            ✨ Wish counted! Now pick up the knife and cut the cake!
          </p>
        )}
        {isCutting && (
          <p className="text-sm font-medium text-amber-300 transition-all">
            🔪 Slicing the birthday cake...
          </p>
        )}
        {isCut && (
          <div className="transition-all animate-rise">
            <p className="text-base font-semibold text-gold">
              🍰 Here is your first slice, Somya!
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              May this year be sweet, exciting, and full of blessings!
            </p>
          </div>
        )}
      </div>

      {/* Interactive Action Buttons */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {/* Step 1: Blow Candles Button */}
        {!isBlown && (
          <button
            onClick={handleBlowCandles}
            className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-neutral-900 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-amber-500/30 active:scale-95"
          >
            <span className="text-base transition-transform group-hover:scale-125">🌬️</span>
            <span>Blow Out the Candles</span>
          </button>
        )}

        {/* Step 2: Cut the Cake Button */}
        {isBlown && !isCut && (
          <button
            onClick={handleCutCake}
            disabled={isCutting}
            className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 px-7 py-3 text-sm font-semibold text-white shadow-xl glow-gold transition-all duration-300 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
          >
            <span className="text-base transition-transform group-hover:rotate-12">🔪</span>
            <span>{isCutting ? "Cutting Cake..." : "Cut the Cake!"}</span>
          </button>
        )}

        {/* Post-Celebration Replay Button */}
        {isCut && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-md transition-all hover:bg-card hover:text-foreground hover:scale-105"
          >
            <span>🔄</span>
            <span>Relight & Cut Again</span>
          </button>
        )}
      </div>
    </div>
  );
}
