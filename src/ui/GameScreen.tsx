"use client";

import { useState } from "react";
import { ActionBar } from "./ActionBar";
import { FeedbackPanel } from "./FeedbackPanel";
import { MessageFeed } from "./MessageFeed";
import { SystemPanel } from "./SystemPanel";
import { TrustBar } from "./TrustBar";
import { RunReport } from "./RunReport";
import { DecisionTimeline } from "./DecisionTimeline";
import { QuickGuide } from "./QuickGuide";
import { TutorialPanel } from "./TutorialPanel";
import { ModeSelector } from "./ModeSelector";
import { ActionHint } from "./ActionHint";
import { analyzeFailure } from "@/game/failureAnalysis";
import { findInflection } from "@/game/inflection";
import { detectFailurePattern } from "@/game/failurePatterns";
import { findPointOfNoReturn } from "@/game/pointOfNoReturn";
import { findCriticalTurn } from "@/game/criticalTurn";
import { buildPersonaReflection } from "@/game/personaReflection";
import { getActionHints } from "@/game/decisionHints";
import { getPersonaRecommendations } from "@/game/personaEngine";
import { analyzeDisagreement } from "@/game/disagreement";

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

  const reflection = terminal
    ? buildPersonaReflection({
        trust: game.trust || {},
        ignoredCounts: game.ignoredCounts || {},
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
        <RunReport game={game} />
        <DecisionTimeline game={game} criticalTurn={criticalTurn} />

        {point && (
          <section className="mt-3 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
            <div className="mb-2 text-xs uppercase tracking-widest text-[#8A93A3]">
              Point of No Return
            </div>
            <div className="text-lg font-bold">Turn {point.turn}</div>
            <div className="mt-1 text-sm text-[#8A93A3]">{point.reason}</div>
          </section>
        )}

        {inflection && (
        <div className="mt-6 p-4 rounded-lg border border-[#1C2330]">
          <div className="text-sm text-[#8A93A3] mb-2">MISSED INTERVENTION</div>
          <div className="text-[#C7D0E0] font-medium">
            Turn {inflection.turn} — {inflection.type}
          </div>
          <div className="text-sm text-[#8A93A3]">{inflection.insight}</div>
          <div className="text-sm mt-2 text-[#8A93A3]">
            Recommendation: {inflection.recommendation}
          </div>
        </div>
      )}

      {failure && (


          <section className="mt-3 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
            <div className="mb-2 text-xs uppercase tracking-widest text-[#8A93A3]">
              System Breakdown
            </div>
            <div className="text-lg font-bold">{failure.label}</div>
            <div className="mt-1 text-sm text-[#8A93A3]">{failure.insight}</div>
            <div className="mt-2 text-sm text-[#E6EAF0]">
              Recommendation: {failure.recommendation}
            </div>
          </section>
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