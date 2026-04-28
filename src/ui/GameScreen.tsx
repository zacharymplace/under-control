"use client";

import { ActionBar } from "./ActionBar";
import { ReferencePanel } from "./ReferencePanel";
import { StickyHud } from "./StickyHud";
import { RunReplay } from "./RunReplay";
import { Counterfactual } from "./Counterfactual";
import { PlayerTendency } from "./PlayerTendency";
import { getAlignment } from "@/game/alignment";
import { getDefaultPersonas } from "@/game/defaultPersonas";
import { applyPersonaBehavior } from "@/game/personaBehaviorApply";
import { buildPersonaConflict } from "@/game/personaConflict";
import { getAdvisorMemoryNote } from "@/game/advisorMemory";
import { getAdvisorWeight, getAdvisorWeightLabel } from "@/game/advisorWeighting";

export function GameScreen({
  game,
  onAction,
  onReset,
  bestTurn,
  scenarioId,
  onScenarioChange,
}: {
  game: any;
  onAction?: (action: string) => void;
  onReset?: () => void;
  bestTurn?: number;
  scenarioId?: string;
  onScenarioChange?: (scenarioId: any) => void;
}) {
  if (!game) return null;

  let advisors = game.personas?.length ? game.personas : getDefaultPersonas(game);
advisors = applyPersonaBehavior(advisors, game);
  const alignment = getAlignment({ ...game, personas: advisors });
  const gameOver = game.state === "FAILED" || game.state === "STABILIZED";
  const conflict = buildPersonaConflict(advisors, game);

  return (
    <main className="uc-root">
      <div className="uc-shell">
        <header className="uc-header">
          <div>State: {game.state}</div>
          <div className="uc-header-center">Pressure: {game.pressure}</div>
          <div className="uc-header-right">Turn: {game.turn}</div>
        </header>

        <StickyHud game={game} />

        <ReferencePanel />

        {gameOver && (
          <section
            className={`uc-status-banner ${
              game.state === "STABILIZED" ? "success" : ""
            }`}
          >
            <div className="uc-status-kicker">
              {game.state === "STABILIZED" ? "Run stabilized" : "Run failed"}
            </div>
            <div className="uc-status-title">
              {game.state === "STABILIZED"
                ? "Control restored"
                : "Control was lost"}
            </div>
            <div className="uc-status-copy">
              {game.state === "STABILIZED"
                ? "The system reached a recoverable state. Review which advisors helped preserve control."
                : "The system crossed a failure threshold. Review advisor conflict, ignored signals, and final action timing."}
            </div>
          </section>
        )}

        <section className="uc-card" data-system-status>
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
            const memoryNote =
              p.memoryNote || getAdvisorMemoryNote(name, game.advisorMemory);
            const advisorWeight = getAdvisorWeight(name, game.advisorMemory);
            const advisorWeightLabel = getAdvisorWeightLabel(advisorWeight);

            return (
              <article key={`${name}-${index}`} className="uc-advisor">
                <div className="uc-advisor-row">
                  <div>
                    <div className="uc-advisor-name">
                      {name} — {role}
                    </div>
                    {p.mood && (
                      <div className="uc-suggests">
                        Mood: {p.mood}
                      </div>
                    )}
                  </div>

                  <div className="uc-advisor-meta">
                    Trust: {game.trust?.[name] ?? 0} • Ignored:{" "}
                    {game.ignoredCounts?.[name] ?? 0}
                    <br />
                    Influence: {advisorWeightLabel} ({advisorWeight.toFixed(2)})
                  </div>
                </div>

                <div className="uc-advisor-text">
                  {p.text || p.message || "No recommendation available."}
                </div>

                {p.behaviorNote && (
      <div className="uc-footer-note" style={{ textAlign: "left", marginTop: 6 }}>
        {p.behaviorNote}
      </div>
    )}
    {memoryNote && (
                  <div className="uc-footer-note" style={{ textAlign: "left", marginTop: 8 }}>
                    {memoryNote}
                  </div>
                )}

                {p.reactionNote && (
                  <div className="uc-footer-note" style={{ textAlign: "left", marginTop: 8 }}>
                    {p.reactionNote}
                  </div>
                )}

                <div className="uc-suggests">Suggests: {suggestion}</div>
              </article>
            );
          })}
        </section>

        {conflict && (
          <section className="uc-conflict">
            <div className="uc-conflict-level">{conflict.level}</div>
            <div className="uc-conflict-title">{conflict.title}</div>
            {conflict.lines.map((line, index) => (
              <div key={index} className="uc-conflict-line">
                {line}
              </div>
            ))}
          </section>
        )}

        <RunReplay game={{ ...game, personas: advisors }} />
        <PlayerTendency tendency={game.playerTendency} />
        <Counterfactual game={{ ...game, personas: advisors }} />

        {game.feedback && (
  <div className="uc-action-feedback">
    {game.feedback}
  </div>
)}

{game.reactions && (
  <div className="uc-reactions">
    {Object.entries(game.reactions).map(([k, v]) => (
      <div key={k} className="uc-reaction-line">
        <strong>{k}:</strong> {v as string}
      </div>
    ))}
  </div>
)}

<ActionBar game={{ ...game, personas: advisors }} onAction={onAction} disabled={gameOver} />

        {gameOver && onReset && (
          <button className="uc-reset" type="button" onClick={onReset}>
            Try Again
          </button>
        )}
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
