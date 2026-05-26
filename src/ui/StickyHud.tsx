"use client";

import { useEffect, useState } from "react";

function safeValue(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

type StickyHudGameState = {
  state?: string;
  pressure?: string;
  load?: number;
  integrity?: number;
  signal?: number;
  signalClarity?: number;
  drift?: number;
  turn?: number;
};

export function StickyHud({
  game,
}: {
  game: StickyHudGameState | null | undefined;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.querySelector("[data-system-status]");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // visible = false when system status is still in view
        setVisible(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  if (!game || game.state === 'FAILED') return null;

  return (
    <section className={`uc-sticky-hud ${visible ? "visible" : ""}`}>
      <div className="uc-hud-item">
        <span>Load</span>
        <strong>{safeValue(game.load)}</strong>
      </div>
      <div className="uc-hud-item">
        <span>Integrity</span>
        <strong>{safeValue(game.integrity)}</strong>
      </div>
      <div className="uc-hud-item">
        <span>Signal</span>
        <strong>{game.signalClarity ?? game.signal}</strong>
      </div>
      <div className="uc-hud-item">
        <span>Drift</span>
        <strong>{safeValue(game.drift)}</strong>
      </div>
      <div className="uc-hud-state">
        {game.state} · {game.pressure} · Turn {game.turn}
      </div>
    </section>
  );
}
