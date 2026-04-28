"use client";

import { useEffect, useState } from "react";

export function StickyHud({ game }: { game: any }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const statusCard = document.querySelector("[data-system-status]");
      const threshold = statusCard
        ? statusCard.getBoundingClientRect().bottom + window.scrollY
        : 360;

      setVisible(window.scrollY > threshold + 12);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!game) return null;

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
