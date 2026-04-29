"use client";
import { getRunGrade } from "@/game/runGrade";
import { getDecisionWindow } from "@/game/decisionWindow";

import { ActionBar } from "./ActionBar";
import { ReferencePanel } from "./ReferencePanel";
import { StickyHud } from "./StickyHud";
import { RunReplay } from "./RunReplay";
import { RunLegibility } from "./RunLegibility";
import { Counterfactual } from "./Counterfactual";
import { PlayerTendency } from "./PlayerTendency";
import { getAlignment } from "@/game/alignment";
import { getDefaultPersonas } from "@/game/defaultPersonas";
import { applyPersonaBehavior } from "@/game/personaBehaviorApply";
import { buildPersonaConflict } from "@/game/personaConflict";
import { getAdvisorMemoryNote } from "@/game/advisorMemory";
import { getAdvisorWeight, getAdvisorWeightLabel } from "@/game/advisorWeighting";
import { getAdvisorTrajectoryNote } from "@/game/advisorTrajectory";
import { getAdvisorNeedEscalation } from "@/game/advisorNeedEscalation";
import { getAdvisorCommitmentNote } from "@/game/advisorCommitment";
import { getAdvisorEscalationPhase } from "@/game/advisorEscalationPhase";
import { getAdvisorDecisionWindowNote } from "@/game/advisorDecisionWindow";
import { getAdvisorCollapseTone } from "@/game/advisorCollapseTone";
import { getAdvisorCertaintyTone } from "@/game/advisorCertainty";
import { getAdvisorCredibilityLabel } from "@/game/advisorCredibilityLabel";

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
  const decisionWindow = getDecisionWindow(game);
  const runGrade = getRunGrade(game);

return (
    <main className="uc-root">
      <div className="uc-shell">
        <header className="uc-header">
          <div>Control State: {game.state}</div>
          <div className="uc-header-center">Pressure: {game.pressure}</div>
          <div className="uc-header-right">Turn: {game.turn}</div>
        </header>

        <section className="uc-panel" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div className="uc-label">Run Goal</div>
              <div style={{ fontWeight: 800 }}>Keep the system under control for 15 turns.</div>
              <div className="uc-footer-note">Survive the control window. Keep load, drift, and integrity within recoverable range.</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div className="uc-label">Time to Act</div>
              <div style={{ fontWeight: 900 }}>{decisionWindow.label}</div>
              <div className="uc-footer-note">{decisionWindow.note}</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div className="uc-label">Run Status</div>
              <div style={{ fontWeight: 900 }}>{runGrade}</div>
            </div>
          </div>
        </section>

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
            <Metric label="Structure" value={game.integrity} />
            <Metric label="Signal" value={game.signalClarity ?? game.signal} />
            <Metric label="Instability" value={game.drift} />
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
            const trajectoryNote = getAdvisorTrajectoryNote(name, game);
            const needEscalationNote = getAdvisorNeedEscalation(name, game);
            const commitmentNote = getAdvisorCommitmentNote(name, game);
            const escalationPhaseNote = getAdvisorEscalationPhase(name, game);
            const decisionWindowNote = getAdvisorDecisionWindowNote(name, game);
            const collapseToneNote = getAdvisorCollapseTone(name, game);
            const certaintyToneNote = getAdvisorCertaintyTone(name, game);
            const credibilityKey = String(name || "").toUpperCase();
            const credibilityLabel = getAdvisorCredibilityLabel(game.credibility?.[credibilityKey]);

          return (
              <article key={`${name}
                  <span style={{ marginLeft: 8, color: "#7f8da1", fontSize: 11, fontWeight: 600 }}>
                    {credibilityLabel}
                  </span>-${index}`} className="uc-advisor">
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
      <div className="uc-footer-note" style={{ color: "#f59e0b", fontWeight: 500, textAlign: "left", marginTop: 6 }}>
        {p.behaviorNote}
      </div>
    )}
    {memoryNote && (
                  <div className="uc-footer-note" style={{ color: "#f59e0b", fontWeight: 500, textAlign: "left", marginTop: 8 }}>
                    {memoryNote}
                  </div>
                )}

                {p.reactionNote && (
                  <div className="uc-footer-note" style={{ color: "#f59e0b", fontWeight: 500, textAlign: "left", marginTop: 8 }}>
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

        <RunLegibility game={{ ...game, personas: advisors }} />
        <RunReplay game={{ ...game, personas: advisors }} />
        <PlayerTendency tendency={game.playerTendency} />
        <Counterfactual game={{ ...game, personas: advisors }} />

        {game.forced && (
          <div style={{ color: "#7f1d1d", fontWeight: 900, marginBottom: 8 }}>
            System override: action executed due to collapse conditions
          </div>
        )}

        {game.interrupted && (
          <div style={{ color: "#ef4444", fontWeight: 800, marginBottom: 8 }}>
            Advisor override: your decision was replaced under collapse pressure
          </div>
        )}

        {game.simpleFeedback && (
          <section className="uc-panel" style={{ marginBottom: 12 }}>
            <div className="uc-label">Immediate Result</div>
            <div style={{ fontWeight: 800 }}>{game.simpleFeedback.result}</div>
            <div className="uc-footer-note">{game.simpleFeedback.meaning}</div>
          </section>
        )}

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

{game.simpleFeedback && (
  <section className="uc-panel" style={{ marginBottom: 12 }}>
    <div className="uc-label">Immediate Result</div>
    <div style={{ fontWeight: 800 }}>{game.simpleFeedback.result}</div>
    <div className="uc-footer-note">{game.simpleFeedback.meaning}</div>
  </section>
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
