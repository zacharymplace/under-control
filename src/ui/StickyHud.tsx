"use client";

import { useEffect, useState } from "react";

export function StickyHud({ game }: { game: any }) {
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
        <strong>{game.load}</strong>
      </div>
      <div className="uc-hud-item">
        <span>Integrity</span>
        <strong>{game.integrity}</strong>
      </div>
      <div className="uc-hud-item">
        <span>Signal</span>
        <strong>{game.signalClarity ?? game.signal}</strong>
      </div>
      <div className="uc-hud-item">
        <span>Drift</span>
        <strong>{game.drift}</strong>
      </div>
      <div className="uc-hud-state">
        {game.state} · {game.pressure} · Turn {game.turn}
      </div>
    </section>
  );
}
