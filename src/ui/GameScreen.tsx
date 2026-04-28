"use client";

import { ActionBar } from "./ActionBar";
import { getAlignment } from "@/game/alignment";
import { getDefaultPersonas } from "@/game/defaultPersonas";

export function GameScreen({ game }: { game: any }) {
  if (!game) return null;

  const advisors = game.personas?.length ? game.personas : getDefaultPersonas(game);
  const alignment = getAlignment({ ...game, personas: advisors });

  return (
    <main className="uc-root">
      <div className="uc-shell">
        <header className="uc-header">
          <div>State: {game.state}</div>
          <div className="uc-header-center">Pressure: {game.pressure}</div>
          <div className="uc-header-right">Turn: {game.turn}</div>
        </header>

        <section className="uc-card">
          <h1 className="uc-title">System Status</h1>
          <div className="uc-subtle">Team Alignment: {alignment}</div>

          <div className="uc-metrics">
            <Metric label="Load" value={game.load} />
            <Metric label="Integrity" value={game.integrity} />
            <Metric label="Signal" value={game.signalClarity ?? game.signal} />
            <Metric label="Drift" value={game.drift} />
          </div>
        </section>

        <section>
          {advisors.map((p: any, index: number) => {
            const name = (p.name || `Advisor ${index + 1}`).toUpperCase();
            const role = p.role || "Advisor";
            const suggestion = p.suggests || p.action || p.suggestion || "UNKNOWN";

            return (
              <article key={`${name}-${index}`} className="uc-advisor">
                <div className="uc-advisor-row">
                  <div className="uc-advisor-name">
                    {name} — {role}
                  </div>
                  <div className="uc-advisor-meta">
                    Trust: {game.trust?.[name] ?? 0} • Ignored:{" "}
                    {game.ignoredCounts?.[name] ?? 0}
                  </div>
                </div>

                <div className="uc-advisor-text">
                  {p.text || p.message || "No recommendation available."}
                </div>

                <div className="uc-suggests">Suggests: {suggestion}</div>
              </article>
            );
          })}
        </section>

        <ActionBar game={{ ...game, personas: advisors }} />
      </div>
    </main>
  );
}

function Metric({ label, value }: any) {
  return (
    <div>
      <div className="uc-label">{label}</div>
      <div className="uc-value">{value}</div>
    </div>
  );
}

export default GameScreen;
