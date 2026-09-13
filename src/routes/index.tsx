import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import somya from "@/assets/somya.jpeg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy Birthday, Somya" },
      {
        name: "description",
        content:
          "A little birthday page for Somya, from Sujal — music, memories and a genuine message.",
      },
      { property: "og:title", content: "Happy Birthday, Somya" },
      {
        property: "og:description",
        content: "A little birthday page for Somya, from Sujal.",
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
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
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

/* ---------------- ambience ---------------- */

function Confetti({ count = 26 }: { count?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 97) % 100,
        delay: (i % 13) * 0.9,
        dur: 9 + ((i * 7) % 8),
        size: 6 + ((i * 5) % 10),
        hue: ["bg-primary", "bg-accent", "bg-secondary"][i % 3],
        round: i % 2 === 0,
      })),
    [count],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          className={`absolute bottom-[-10vh] ${b.hue} ${b.round ? "rounded-full" : "rounded-[2px]"} opacity-70`}
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animation: `float-up ${b.dur}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- typing ---------------- */

function Typed({ text, speed = 28 }: { text: string; speed?: number }) {
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
    <p className="whitespace-pre-line text-base leading-relaxed text-foreground/90 sm:text-lg">
      {text.slice(0, n)}
      {n < text.length && <span className="ml-0.5 animate-pulse text-primary">|</span>}
    </p>
  );
}

/* ---------------- scenes ---------------- */

const LETTER = `Somya,

Some people you meet and forget. You are not one of them.

You are the kind of friend who shows up — who listens properly, who says the honest thing even when the easy thing is right there, and who somehow makes an ordinary day feel lighter. That is rare, and I don't take it for granted.

Thank you for being genuine with me. I hope this year is loud with the things you love, kind to you on the slow days, and full of moments you'll want to tell someone about.

Happy birthday. Go be insufferably happy.

— Sujal`;

const WISHES = [
  { t: "Health", d: "Boring, essential, and I mean it." },
  { t: "Laughter", d: "The kind where you can't breathe." },
  { t: "Courage", d: "For whatever you're quietly planning." },
  { t: "People", d: "Who see you the way you actually are." },
];

function BirthdayPage() {
  const { playing, start, toggle } = useMusic();
  const [entered, setEntered] = useState(false);
  const [step, setStep] = useState(0);
  const [blown, setBlown] = useState(false);

  // auto-advance through the scenes once she taps in
  useEffect(() => {
    if (!entered) return;
    const marks = [2600, 5200, 4200, 9000, 4200];
    if (step >= marks.length) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), marks[step]);
    return () => window.clearTimeout(id);
  }, [entered, step]);

  // candles go out on their own
  useEffect(() => {
    if (step < 2) return;
    const id = window.setTimeout(() => setBlown(true), 2200);
    return () => window.clearTimeout(id);
  }, [step]);

  // gentle auto-scroll as new scenes appear
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!entered || step === 0) return;
    const id = window.setTimeout(
      () => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }),
      450,
    );
    return () => window.clearTimeout(id);
  }, [entered, step]);

  const begin = () => {
    start();
    setEntered(true);
  };

  if (!entered) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Confetti count={14} />
        <p className="text-xs tracking-[0.4em] text-muted-foreground uppercase">
          13 September
        </p>
        <h1 className="mt-5 text-4xl leading-tight font-semibold text-balance text-gold sm:text-6xl">
          Something small,
          <br />
          made just for Somya
        </h1>
        <p className="mt-5 max-w-sm text-sm text-muted-foreground">
          Best with sound on. Everything after this happens on its own — you just watch.
        </p>
        <button
          onClick={begin}
          className="mt-10 rounded-full bg-primary px-9 py-4 text-base font-medium text-primary-foreground shadow-lg transition-transform animate-pulse-soft hover:scale-105 active:scale-95"
        >
          Begin
        </button>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen px-5 pt-16 pb-24 sm:px-8">
      <Confetti />

      <button
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        className="fixed top-4 right-4 z-20 rounded-full border border-border bg-card/70 px-4 py-2 text-xs text-card-foreground backdrop-blur-md"
      >
        {playing ? "♪ Pause music" : "♪ Play music"}
      </button>

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-16 text-center">
        {/* 1 — the wish */}
        <section className="animate-rise">
          <p className="text-xs tracking-[0.4em] text-muted-foreground uppercase">
            Happy birthday
          </p>
          <h1 className="mt-4 text-5xl font-semibold text-gold sm:text-7xl">Somya</h1>
        </section>

        {/* 2 — her photo */}
        {step >= 1 && (
          <section className="animate-rise">
            <div className="mx-auto h-56 w-56 overflow-hidden rounded-full border-2 border-primary/40 glow-ring animate-drift sm:h-72 sm:w-72">
              <img
                src={somya.url}
                alt="Somya, smiling at a celebration"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              the birthday girl, doing what she does best — showing up and lighting the place up
            </p>
          </section>
        )}

        {/* 3 — cake, blows itself out */}
        {step >= 2 && (
          <section className="animate-rise">
            <div className="mx-auto w-52 sm:w-64">
              <div className="mb-1 flex justify-center gap-4">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="flex flex-col items-center">
                    <span
                      className={`h-3 w-2 rounded-full bg-primary transition-all duration-700 ${
                        blown ? "scale-0 opacity-0" : "animate-flicker opacity-100"
                      }`}
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                    <span className="h-5 w-1 rounded-sm bg-foreground/70" />
                  </span>
                ))}
              </div>
              <div className="h-8 rounded-t-xl bg-accent/80" />
              <div className="h-10 bg-secondary" />
              <div className="h-3 rounded-b-xl bg-primary/70" />
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              {blown ? "Wish counted. Don't tell anyone what it was." : "Make a wish…"}
            </p>
          </section>
        )}

        {/* 4 — the letter */}
        {step >= 3 && (
          <section className="w-full animate-rise rounded-2xl border border-border bg-card/60 p-6 text-left backdrop-blur-md sm:p-9">
            <Typed text={LETTER} />
          </section>
        )}

        {/* 5 — wishes */}
        {step >= 4 && (
          <section className="w-full animate-rise">
            <h2 className="mb-6 text-sm tracking-[0.3em] text-muted-foreground uppercase">
              Four things for your year
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {WISHES.map((w) => (
                <div
                  key={w.t}
                  className="rounded-xl border border-border bg-card/50 p-5 text-left backdrop-blur-sm"
                >
                  <p className="text-lg font-medium text-gold">{w.t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{w.d}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6 — sign off */}
        {step >= 5 && (
          <section className="animate-rise pb-6">
            <p className="text-2xl font-semibold text-gold sm:text-3xl">
              Happy birthday, Somya.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              From your friend, Sujal Jain — 13 September
            </p>
          </section>
        )}

        <div ref={endRef} />
      </div>
    </main>
  );
}
