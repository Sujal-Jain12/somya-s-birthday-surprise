import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import somya from "@/assets/somya.jpeg.asset.json";
import { BirthdayFlakes } from "@/components/BirthdayFlakes";
import { InteractiveCake } from "@/components/InteractiveCake";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy Birthday, Somya 🎉" },
      {
        name: "description",
        content:
          "A special birthday celebration for Somya, from Sujal — music, interactive cake, and a genuine birthday wish.",
      },
      { property: "og:title", content: "Happy Birthday, Somya 🎉" },
      {
        property: "og:description",
        content: "A special birthday celebration for Somya, from Sujal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BirthdayPage,
});

/* ---------------- music ---------------- */

// "Happy Birthday to You" — [semitone offset from C4, beats]
const MELODY: [number, number][] = [
  [7, 0.75], [7, 0.25], [9, 1], [7, 1], [12, 1], [11, 2],
  [7, 0.75], [7, 0.25], [9, 1], [7, 1], [14, 1], [12, 2],
  [7, 0.75], [7, 0.25], [19, 1], [16, 1], [12, 1], [11, 1], [9, 2],
  [17, 0.75], [17, 0.25], [16, 1], [12, 1], [14, 1], [12, 3],
];

function useMusic() {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const schedule = useCallback(() => {
    const ctx = ctxRef.current;
    const master = gainRef.current;
    if (!ctx || !master) return;
    const bpm = 108;
    const beat = 60 / bpm;
    let t = ctx.currentTime + 0.15;
    for (const [semi, beats] of MELODY) {
      const freq = 261.63 * Math.pow(2, semi / 12);
      const dur = beats * beat;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.92);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + dur);

      const bell = ctx.createOscillator();
      const bg = ctx.createGain();
      bell.type = "sine";
      bell.frequency.value = freq * 2;
      bg.gain.setValueAtTime(0.0001, t);
      bg.gain.exponentialRampToValueAtTime(0.09, t + 0.03);
      bg.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.8);
      bell.connect(bg).connect(master);
      bell.start(t);
      bell.stop(t + dur);

      t += dur;
    }
    const loopMs = (t - ctx.currentTime + 1.2) * 1000;
    timerRef.current = window.setTimeout(schedule, loopMs);
  }, []);

  const start = useCallback(() => {
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      gainRef.current = master;
    }
    void ctxRef.current.resume();
    if (timerRef.current === null) schedule();
    setPlaying(true);
  }, [schedule]);

  const toggle = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return start();
    if (playing) {
      void ctx.suspend();
      setPlaying(false);
    } else {
      void ctx.resume();
      setPlaying(true);
    }
  }, [playing, start]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      void ctxRef.current?.close();
    },
    [],
  );

  return { playing, start, toggle };
}

/* ---------------- typing effect ---------------- */

function Typed({ text, speed = 24 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = window.setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          window.clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);

  return (
    <p className="whitespace-pre-line text-base leading-relaxed text-foreground/95 sm:text-lg">
      {text.slice(0, n)}
      {n < text.length && <span className="ml-0.5 animate-pulse text-primary font-bold">|</span>}
    </p>
  );
}

/* ---------------- gentlemanly friend letter ---------------- */

const LETTER = `Happy Birthday, Somya! 🎉

Wishing you a truly wonderful day and a year ahead filled with good health, happiness, and great success in everything you pursue.

You’ve always been a dependable and fantastic friend, and I really value the good laughs and conversations we share. May this new chapter bring you peace of mind, exciting opportunities, and many memorable moments.

Have a brilliant birthday and an amazing year ahead!

Warm wishes,
Sujal`;

/* ---------------- 4 uplifting friend wishes ---------------- */

const WISHES = [
  {
    icon: "✨",
    t: "Health & Well-being",
    d: "Good health, vibrant energy, and calm, peaceful days for all your goals.",
  },
  {
    icon: "😊",
    t: "Joy & Laughter",
    d: "Plenty of genuine reasons to smile and laugh wholeheartedly every day.",
  },
  {
    icon: "🎯",
    t: "Success & Ambition",
    d: "Smooth journeys, big achievements, and excelling in whatever you take on.",
  },
  {
    icon: "🌟",
    t: "Great Memories",
    d: "Wonderful adventures, inspiring experiences, and true friends by your side.",
  },
];

/* ---------------- main page component ---------------- */

function BirthdayPage() {
  const { playing, start, toggle } = useMusic();
  const [entered, setEntered] = useState(false);
  const [step, setStep] = useState(0);

  // Progressive scene unlocks
  useEffect(() => {
    if (!entered) return;

    // Unlock photo after 1.5s
    const t1 = window.setTimeout(() => setStep((s) => Math.max(s, 1)), 1400);
    // Unlock cake ritual after 2.8s
    const t2 = window.setTimeout(() => setStep((s) => Math.max(s, 2)), 2800);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [entered]);

  // When cake cut completes, smoothly unlock letter and wishes!
  const handleCakeCut = useCallback(() => {
    // Unlock letter and wishes
    setTimeout(() => {
      setStep((s) => Math.max(s, 4));
    }, 1200);

    // Final sign-off unlock
    setTimeout(() => {
      setStep((s) => Math.max(s, 5));
    }, 4500);
  }, []);

  // Smooth auto-scroll as new milestones appear
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!entered || step === 0) return;
    const id = window.setTimeout(
      () => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }),
      500,
    );
    return () => window.clearTimeout(id);
  }, [entered, step]);

  const begin = () => {
    setEntered(true);
    try {
      start();
    } catch {
      /* audio fallback */
    }
  };

  // Welcome / Intro Screen
  if (!entered) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <BirthdayFlakes autoPopInterval={3200} />
        
        <div className="relative z-10 max-w-lg animate-rise">
          <p className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
            13 September • A Celebration
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-balance text-gold sm:text-6xl">
            Happy Birthday,
            <br />
            Somya! 🎂
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Turn your sound on for the melody. Click below to start the surprise!
          </p>
          
          <button
            onClick={begin}
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-amber-500 px-9 py-4 text-base font-semibold text-neutral-900 shadow-xl glow-gold transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse-soft cursor-pointer"
          >
            <span>✨</span>
            <span>Open Celebration</span>
            <span>✨</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen px-4 pt-16 pb-28 sm:px-8">
      {/* Auto-popping birthday flakes + ambient sparkles + click pops */}
      <BirthdayFlakes autoPopInterval={3500} />

      {/* Floating Music Toggle Button */}
      <button
        onClick={toggle}
        aria-label={playing ? "Pause birthday melody" : "Play birthday melody"}
        className="fixed top-4 right-4 z-40 flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-xs font-medium text-foreground backdrop-blur-md shadow-md transition-all hover:bg-card hover:scale-105 cursor-pointer"
      >
        <span className={playing ? "animate-pulse text-amber-300" : "text-muted-foreground"}>
          🎵
        </span>
        <span>{playing ? "Pause Music" : "Play Music"}</span>
      </button>

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-14 text-center">
        {/* 1 — Birthday Title Banner */}
        <section className="animate-rise">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-primary uppercase backdrop-blur-sm">
            ✨ Wishing A Very Happy Birthday ✨
          </div>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-gold sm:text-7xl">
            Somya
          </h1>
          <p className="mt-2 text-xs tracking-[0.3em] text-muted-foreground uppercase">
            13 September
          </p>
        </section>

        {/* 2 — Photo Section */}
        {step >= 1 && (
          <section className="animate-rise flex flex-col items-center">
            <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-full border-3 border-primary/50 glow-ring animate-drift sm:h-72 sm:w-72">
              <img
                src={somya.url}
                alt="Somya, smiling at a celebration"
                className="h-full w-full object-cover"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />
            </div>
            <p className="mt-6 text-sm font-medium text-muted-foreground">
              Celebrating a wonderful friend — Happy Birthday, Somya! 🌟
            </p>
          </section>
        )}

        {/* 3 — Interactive Cake Ceremony (Blow Candles -> Cut Cake) */}
        {step >= 2 && (
          <section className="w-full animate-rise rounded-3xl border border-border bg-card/60 p-6 backdrop-blur-md shadow-2xl sm:p-8">
            <InteractiveCake onCutComplete={handleCakeCut} />
          </section>
        )}

        {/* 4 — Gentlemanly Friendship Note */}
        {step >= 4 && (
          <section className="w-full animate-rise rounded-3xl border border-border bg-card/70 p-6 text-left backdrop-blur-md shadow-xl sm:p-9">
            <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                A Note For You
              </span>
              <span className="text-xs text-muted-foreground">From Sujal</span>
            </div>
            <Typed text={LETTER} speed={22} />
          </section>
        )}

        {/* 5 — Four Uplifting Wishes Cards */}
        {step >= 4 && (
          <section className="w-full animate-rise">
            <h2 className="mb-6 text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase">
              Wishes For Your Year Ahead
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {WISHES.map((w) => (
                <div
                  key={w.t}
                  className="group rounded-2xl border border-border bg-card/50 p-5 text-left backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/75 hover:-translate-y-0.5 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{w.icon}</span>
                    <p className="text-base font-semibold text-gold">{w.t}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {w.d}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6 — Final Gentlemanly Sign-off */}
        {step >= 5 && (
          <section className="animate-rise pb-8">
            <p className="text-2xl font-bold text-gold sm:text-3xl">
              Happy Birthday, Somya.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              From your friend, Sujal — 13 September
            </p>
          </section>
        )}

        <div ref={endRef} />
      </div>
    </main>
  );
}
