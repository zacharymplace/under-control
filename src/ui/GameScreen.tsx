"use client";

import { useState } from "react";
import { ActionBar } from "./ActionBar";
import { FeedbackPanel } from "./FeedbackPanel";
import { MessageFeed } from "./MessageFeed";
import { SystemPanel } from "./SystemPanel";
import { TrustBar } from "./TrustBar";
import { RunReport } from "./RunReport";
import { RunArc } from "./RunArc";
import { DecisionTimeline } from "./DecisionTimeline";
import { ModeSelector } from "./ModeSelector";
import { TutorialPanel } from "./TutorialPanel";
import { QuickGuide } from "./QuickGuide";
import { ActionHint } from "./ActionHint";

import { getActionHints } from "@/game/decisionHints";
import { getPersonaRecommendations } from "@/game/personaEngine";
import { analyzeDisagreement } from "@/game/disagreement";
import { detectFailurePattern } from "@/game/failurePatterns";
import { analyzeFailure } from "@/game/failureAnalysis";
import { findPointOfNoReturn } from "@/game/pointOfNoReturn";
import { findCriticalTurn } from "@/game/criticalTurn";
import { findInflection } from "@/game/inflection";
import { buildAlternativePath } from "@/game/alternative";
import { buildCriticalDecision } from "@/game/criticalDecision";
import { getPrimaryFailureDriver } from "@/game/failureDriver";
import { buildCounterfactualReplay } from "@/game/counterfactual";
import { buildRunArc } from "@/game/runArc";
import { buildPlayerTakeaway } from "@/game/playerTakeaway";
import { buildPersonaReflection } from "@/game/personaReflection";
import { buildPersonaTerminalComments } from "@/game/personaTerminal";
import { detectMomentum } from "@/game/momentum";

export function GameScreen({ game, onAction, onReset, bestTurn, scenarioId, onScenarioChange }: any) {
  const [showGuide, setShowGuide] = useState(false);

  const terminal = game.state === "FAILED" || game.state === "STABILIZED";
  const displayBest = Math.max(bestTurn, game.turn);

  const hints = terminal ? {} : getActionHints(game);
  const personas = getPersonaRecommendations(game);
  const disagreement = analyzeDisagreement(personas);

  const point = terminal ? findPointOfNoReturn(game.actionLog || []) : null;
const criticalTurn = terminal ? findCriticalTurn(game.actionLog || []) : null;
  const inflection = terminal ? findInflection(game.actionLog || []) : null;
  const failure = terminal ? analyzeFailure(game.actionLog || [], game) : null;
const pattern = terminal ? detectFailurePattern(game.actionLog || []) : null;
  const failureDriver = terminal ? getPrimaryFailureDriver(game) : null;
  const counterfactual = terminal ? buildCounterfactualReplay(game, inflection) : null;
  const runArc =
 terminal ? buildRunArc(game, failureDriver) : null;
  const verdict = null;
  const momentum = terminal ? detectMomentum(game.log || []) : null;

  const alternative = buildAlternativePath({
  log: game.actionLog || [],
  inflectionTurn: inflection?.turn ?? point?.turn ?? null,
});

const critical = buildCriticalDecision({
  personas,
  turn: inflection?.turn ?? point?.turn ?? null,
});

const terminalComments = buildPersonaTerminalComments({
  personas: game.personas || [],
  trust: game.trust || {},
  ignoredCounts: game.ignoredCounts || {},
  moodMap: game.moodMap || {},
  game,
});

const reflection = terminal
    ? buildPersonaReflection({
  log: game.log || [],
        trust: game.trust || {},
        ignoredCounts: game.ignoredCounts || {},
  log: game.log || [],
        personas,
      })
    : [];

  return (
    <main className="min-h-screen px-5 py-6 text-[#E6EAF0] bg-[#0B0D10]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex justify-between text-xs uppercase tracking-widest text-[#8A93A3]">
          <div>State: {game.state}</div>
          <div>Pressure: {game.pressure}</div>
          <div>Turn: {game.turn}</div>
        </div>

        <div className="mb-3 flex justify-between text-xs uppercase tracking-widest text-[#8A93A3]">
          <div>Best Run: {displayBest}</div>
          <div>Mode: {game.modeLabel || "Standard"}</div>
          <button
            onClick={() => setShowGuide((v) => !v)}
            className="hover:text-[#E6EAF0]"
          >
            {showGuide ? "Hide Guide" : "Guide"}
          </button>
        </div>

        {showGuide && <QuickGuide />}

        <ModeSelector
          scenarioId={scenarioId}
          onScenarioChange={onScenarioChange}
          disabled={!terminal && game.turn > 1}
        />

        <TrustBar trust={game.trust || {}} />

        <TutorialPanel game={game} />

        <SystemPanel game={game} />

        {!terminal && game.scenarioId === "guided_first_run" && (
          <ActionHint
            load={game.load}
            drift={game.drift}
            signal={game.signalClarity}
            pressure={game.pressure}
          />
        )}

                {!terminal && disagreement && (
          <section className="mb-3 rounded-lg border border-[#2A313A] bg-[#12161C] p-3">
            <div className="mb-1 flex justify-between text-xs uppercase tracking-widest text-[#8A93A3]">
              <span>{disagreement.label}</span>
              <span>{disagreement.level}</span>
            </div>
            <div className="text-sm text-[#8A93A3]">
              {disagreement.text}

            <div className="text-xs text-[#5A646F] mt-1">
              Weighted by trust and confidence — not all voices carry equal influence.
            </div>
            </div>
          </section>
        )}

        <MessageFeed personas={personas} />
        <ActionBar onAction={onAction} disabled={terminal} hints={hints} personas={personas} disagreement={disagreement} />
        <FeedbackPanel feedback={game.feedback} summary={game.summary} />
        {terminal && (
          <>
            {failureDriver && (
              <section className="mt-6 rounded-lg border-l-4 border-[#D4A84F] border border-[#4A3918] bg-gradient-to-r from-[#1A140B] to-[#12161C] p-6 shadow-[0_0_20px_rgba(212,168,79,0.08)]">
                <div className="mb-2 text-xs uppercase tracking-widest text-[#D4A84F]">
                  PRIMARY FAILURE DRIVER
                </div>
                <div className="text-xl font-bold text-[#F1D08A]">
                  {failureDriver.title}
                </div>
                <div className="mt-2 text-sm text-[#8A93A3]">
                  {failureDriver.detail}
                </div>
              </section>
            )}

            {false && (
          <section className="mt-4 rounded border border-[#2A313A] bg-[#0B0D10] p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#8A93A3]">
              Run Verdict
            </div>
            <div className="mt-1 text-lg font-semibold text-[#E6EAF0]">
              {verdict}
            </div>
          </section>
        )}

        <RunArc arc={runArc} />

        {momentum && (
          <section className="mt-3 rounded border border-[#2A313A] bg-[#0B0D10] p-3">
            <div className="text-[10px] uppercase tracking-widest text-[#8A93A3]">
              Run Momentum
            </div>
            <div className="mt-1 font-semibold text-[#E6EAF0]">
              {momentum}
            </div>
          </section>
        )}

            {point && (
              <section className="mt-5 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
                <div className="mb-2 text-xs uppercase tracking-widest text-[#8A93A3]">
                  Point of No Return
                </div>
                <div className="text-lg font-bold">Turn {point.turn}</div>
                <div className="mt-1 text-sm text-[#8A93A3]">{point.reason}</div>
              </section>
            )}

            {inflection && (
              <section className="mt-5 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
                <div className="mb-2 text-xs uppercase tracking-widest text-[#8A93A3]">
                  Missed Intervention
                </div>
                <div className="text-lg font-bold">
                  Turn {inflection.turn} — {inflection.type}
                </div>
                <div className="mt-1 text-sm text-[#8A93A3]">
                  {inflection.insight}
                </div>
                <div className="mt-2 text-sm text-[#E6EAF0]">
                  Recommendation: {inflection.recommendation}
                </div>
              </section>
            )}

            {counterfactual && (
              <section className="mt-5 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
                <div className="mb-2 text-xs uppercase tracking-widest text-[#8A93A3]">
                  Counterfactual Replay
                </div>
                <div className="text-lg font-bold">
                  Turn {counterfactual.turn}: {counterfactual.actualAction} → {counterfactual.betterAction}
                </div>
                <div className="mt-1 text-sm text-[#8A93A3]">
                  {counterfactual.insight}
                </div>
                <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
                  <div className="rounded border border-[#2A313A] bg-[#0B0D10] p-3">
                    <div className="mb-1 uppercase tracking-widest text-[#8A93A3]">
                      Actual
                    </div>
                    <div>
                      Load {counterfactual.actual.load} • Drift {counterfactual.actual.drift} • Integrity {counterfactual.actual.integrity}
                    </div>
                  </div>
                  <div className="rounded border border-[#2B5D45] bg-[#0B0F0C] p-3">
                    <div className="mb-1 uppercase tracking-widest text-[#4FAF7B]">
                      Projected Alternative
                    </div>
                    <div>
                      Load {counterfactual.projected.load} • Drift {counterfactual.projected.drift} • Integrity {counterfactual.projected.integrity}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <RunReport game={game} />
            <DecisionTimeline game={game} criticalTurn={criticalTurn} />
          </>
        )}


        {pattern && (
          <section className="mt-3 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
            <div className="mb-2 text-xs uppercase tracking-widest text-[#8A93A3]">
              Decision Pattern
            </div>
            <div className="text-lg font-bold">{pattern.title}</div>
            <div className="mt-1 text-sm text-[#8A93A3]">{pattern.detail}</div>
            <div className="mt-2 text-sm text-[#E6EAF0]">
              Recommendation: {pattern.recommendation}
            </div>
          </section>
        )}

        

        {terminal && reflection.length > 0 && (
          <section className="mt-3 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
            <div className="mb-2 text-xs uppercase tracking-widest text-[#8A93A3]">
              Team Debrief
            </div>
            <div className="space-y-1">
              {reflection.map((r: any) => (
                <div key={r.name} className="text-sm text-[#8A93A3]">
                  {r.text}
                </div>
              ))}
            </div>
          </section>
        )}

        {game.runInsight && (
          <section className="mt-3 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
            <div className="mb-2 text-xs uppercase tracking-widest text-[#8A93A3]">
              Run Insight
            </div>
            <h2 className="mb-1 font-bold">{game.runInsight.title}</h2>
            <p className="text-sm text-[#8A93A3]">{game.runInsight.text}</p>
          </section>
        )}

        {terminal && (
          <button
            onClick={onReset}
            className="mt-4 w-full border border-[#2A313A] bg-[#1A1F26] py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#222A34]"
          >
            {game.state === "STABILIZED" ? "Run Again" : "Try Again"}
          </button>
        )}
      </div>
    </main>
  );
}