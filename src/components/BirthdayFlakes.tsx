import { useEffect, useState, useCallback } from "react";

interface FlakeParticle {
  id: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  rot: number;
  size: number;
  color: string;
  shape: "circle" | "star" | "rect" | "sparkle";
  delay: number;
}

const COLORS = [
  "#F5D061", // celebration gold
  "#FF6B8B", // party rose
  "#FF9E7D", // warm coral
  "#70A1FF", // sky blue
  "#A8E6CF", // soft mint
  "#DED1FC", // pastel lavender
  "#FFF2C6", // champagne
  "#FFD166", // festive yellow
];

export function BirthdayFlakes({
  autoPopInterval = 3800,
  enableClickPop = true,
}: {
  autoPopInterval?: number;
  enableClickPop?: boolean;
}) {
  const [bursts, setBursts] = useState<FlakeParticle[]>([]);

  // Trigger a burst of festive flakes at a specific coordinate
  const triggerBurst = useCallback((originX: number, originY: number, count = 18) => {
    const burstId = Math.random().toString(36).substring(2, 9);
    const newParticles: FlakeParticle[] = [];

    const shapes: ("circle" | "star" | "rect" | "sparkle")[] = [
      "star",
      "circle",
      "rect",
      "sparkle",
    ];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const distance = 45 + Math.random() * 95;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - (15 + Math.random() * 30); // slight upward bias

      newParticles.push({
        id: `${burstId}-${i}`,
        x: originX,
        y: originY,
        tx,
        ty,
        rot: Math.floor(Math.random() * 600) - 300,
        size: 7 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        delay: Math.random() * 0.12,
      });
    }

    setBursts((prev) => [...prev.slice(-60), ...newParticles]);

    // Automatically remove finished particles after animation completes
    setTimeout(() => {
      setBursts((prev) => prev.filter((p) => !p.id.startsWith(burstId)));
    }, 2200);
  }, []);

  // Auto-pop flakes in screen at periodic intervals
  useEffect(() => {
    // Initial friendly pop shortly after mount
    const initialTimer = setTimeout(() => {
      if (typeof window !== "undefined") {
        const x = window.innerWidth * (0.3 + Math.random() * 0.4);
        const y = window.innerHeight * (0.25 + Math.random() * 0.35);
        triggerBurst(x, y, 22);
      }
    }, 1200);

    const interval = setInterval(() => {
      if (typeof window === "undefined") return;
      // Random coordinates around viewport for dynamic bursts
      const x = window.innerWidth * (0.15 + Math.random() * 0.7);
      const y = window.innerHeight * (0.2 + Math.random() * 0.6);
      triggerBurst(x, y, 20);
    }, autoPopInterval);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [autoPopInterval, triggerBurst]);

  // Click / touch to pop flakes
  useEffect(() => {
    if (!enableClickPop) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      triggerBurst(clientX, clientY, 16);
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [enableClickPop, triggerBurst]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      {/* 1. Ambient floating flakes */}
      <div className="absolute inset-0">
        {AMBIENT_FLAKES.map((flake, idx) => (
          <span
            key={`amb-${idx}`}
            className="absolute rounded-full opacity-80"
            style={{
              left: `${flake.left}%`,
              bottom: "-10vh",
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              backgroundColor: flake.color,
              boxShadow: `0 0 10px ${flake.color}`,
              animation: `float-up ${flake.duration}s linear ${flake.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* 2. Popping bursts (auto + interactive) */}
      {bursts.map((particle) => (
        <span
          key={particle.id}
          className="absolute inline-block"
          style={
            {
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              "--tx": `${particle.tx}px`,
              "--ty": `${particle.ty}px`,
              "--rot": `${particle.rot}deg`,
              animation: `flake-pop-burst 1.9s cubic-bezier(0.2, 0.8, 0.3, 1) ${particle.delay}s forwards`,
            } as React.CSSProperties
          }
        >
          {particle.shape === "circle" && (
            <span
              className="block h-full w-full rounded-full"
              style={{
                backgroundColor: particle.color,
                boxShadow: `0 0 8px ${particle.color}`,
              }}
            />
          )}
          {particle.shape === "star" && (
            <svg
              viewBox="0 0 24 24"
              className="h-full w-full"
              fill={particle.color}
              style={{ filter: `drop-shadow(0 0 6px ${particle.color})` }}
            >
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          )}
          {particle.shape === "sparkle" && (
            <svg
              viewBox="0 0 24 24"
              className="h-full w-full"
              fill={particle.color}
              style={{ filter: `drop-shadow(0 0 8px ${particle.color})` }}
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
            </svg>
          )}
          {particle.shape === "rect" && (
            <span
              className="block h-full w-full rounded-[2px]"
              style={{
                backgroundColor: particle.color,
                transform: "rotate(45deg)",
              }}
            />
          )}
        </span>
      ))}
    </div>
  );
}

// 24 pre-calculated ambient flakes for silky smooth performance
const AMBIENT_FLAKES = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 91) % 100,
  delay: (i % 11) * 0.8,
  duration: 8 + ((i * 7) % 7),
  size: 4 + ((i * 5) % 8),
  color: COLORS[i % COLORS.length],
}));
