"use client";
import { classifyOutcome } from "@/game/decisionLearning";
import type { Game } from "@/game/types";

type AdaptiveModifiers = {
  loadPressureMult: number;
  driftPenaltyMult: number;
  signalDecayMult: number;
};


import { useState, useEffect } from "react";
import { GameScreen } from "@/ui/GameScreen";
import { getScenario, type ScenarioId } from "@/game/scenarios";
import { TUNING } from "@/game/tuning";
import { initTelemetry, updateTelemetry, summarizeTelemetry } from "@/game/telemetry";
import { getPersonaRecommendations } from "@/game/personaEngine";
import { initialTrust, updateTrust } from "@/game/trust";
import { initialIgnoredCounts, updateIgnoredCounts } from "@/game/personaMemory";
import { evaluateOutcome, evaluatePersonaOutcome } from "@/game/outcome";
import { classifyRun } from "@/game/runArchetype";
import { applyIgnoredSystemPenalty } from "@/game/systemDegradation";
import { getActionFeedback } from "@/game/actionFeedback";
import { getSimpleFeedback } from "@/game/simpleFeedback";
import { getActionJudgment } from "@/game/actionJudgment";
import { analyzePlayerTendency } from "@/game/playerTendency";
import { getAdvisorReactions } from "@/game/advisorReaction";
import { createInitialAdvisorMemory } from "@/game/advisorMemory";
import { updateAdvisorMemory } from "@/game/updateAdvisorMemory";
import { getDefaultPersonas } from "@/game/defaultPersonas";
import { applyPersonaBehavior } from "@/game/personaBehaviorApply";
import { applyConsensusDrift } from "@/game/consensusDrift";
import { createInitialAdvisorCredibility, updateAdvisorCredibility } from "@/game/advisorCredibility";
import { maybeInterruptAction } from "@/game/advisorInterruption";
import { maybeForceAction } from "@/game/forcedExecution";
import { logCompletedRun } from "@/game/runAnalytics";
import { applyLearningFeedback } from "@/game/learningFeedback";
import { isCorrectDecision } from "@/game/decisionTruth";
import { tickGame } from "@/game/tickEngine";
import { maybeOverrideAction, applyOutcomeVariance } from "@/game/actionScoring";


function safe(n: number, fallback: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return fallback;
  return n;
}

function buildInitialGame(scenarioId: ScenarioId = "guided_first_run") {
  const ACTIVE_SCENARIO = getScenario(scenarioId);

  return {
  turn: 1,
  state: "STABLE",
  pressure: "RISING",
  scenarioId: ACTIVE_SCENARIO.id,
  modeLabel: ACTIVE_SCENARIO.label,
  scenarioOpening: ACTIVE_SCENARIO.opening,
  scenarioModifiers: ACTIVE_SCENARIO.modifiers,
  tutorialSteps: ACTIVE_SCENARIO.tutorialSteps,
  eventTitle: ACTIVE_SCENARIO.initialState.eventTitle,
  eventSub: ACTIVE_SCENARIO.initialState.eventSub,
  load: ACTIVE_SCENARIO.initialState.load,
  integrity: ACTIVE_SCENARIO.initialState.integrity,
  signalClarity: ACTIVE_SCENARIO.initialState.signalClarity,
  drift: ACTIVE_SCENARIO.initialState.drift,
  driftVisible: ACTIVE_SCENARIO.initialState.driftVisible,
  actionHistory: [] as string[],
  actionLog: [],
  runInsight: null,
  telemetry: initTelemetry(),
  summary: null,
  adaptiveModifiers: null,
  analyticsLogged: false,
  trust: initialTrust,
      ignoredCounts: initialIgnoredCounts,
  messages: [
    {
      id: "1",
      name: "Elena",
      role: "Signal",
      text: "Confidence is low.",
      priority: "medium",
    },
  ],
  feedback: null,
};
}

export default function Page() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("guided_first_run");
  const [game, setGame] = useState<Game>(() => buildInitialGame("guided_first_run"));
  const [bestTurn, setBestTurn] = useState(1);
  const [adaptiveModifiers, setAdaptiveModifiers] = useState<AdaptiveModifiers | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  
  function applyBurstTicks(game: any, steps = 3) {
    let next = game;
    for (let i = 0; i < steps; i++) {
      next = tickGame(next);
    }
    return next;
  }

  function handleAction(action: string) {
    let next = applyDemoAction(
      { ...game, adaptiveModifiers },
      action
    );

    if (
      (next.state === "FAILED" || next.state === "STABILIZED") &&
      !next.analyticsLogged
    ) {
      next.analyticsLogged = true;
      logCompletedRun(next);
    }

    setTimeout(() => {
      let advisorsForMemory = applyPersonaBehavior(
        game.personas?.length ? game.personas : getDefaultPersonas(game),
        game
      );

      advisorsForMemory = applyConsensusDrift(advisorsForMemory, game);

      const forced = maybeForceAction(action, game, advisorsForMemory);

      const interruption = forced.forced
        ? { action: forced.action, interrupted: false }
        : maybeInterruptAction(action, game, advisorsForMemory);

      const finalAction = forced.forced ? forced.action : interruption.action;

      // Advisor-driven override
      const override = maybeOverrideAction(finalAction as any, game);
      const executedAction = override.action;

      // Source of truth for state, feedback, replay, and logging.
      next = applyDemoAction({ ...game, adaptiveModifiers }, executedAction);
      next = applyOutcomeVariance(next, executedAction as any, game);

      const simpleFeedback = getSimpleFeedback(executedAction, game, next);
      const feedback = getActionFeedback(executedAction, game, next);
      const judgment = getActionJudgment(executedAction, game, next);
      const combined = judgment ? `${feedback}. ${judgment}` : feedback;
      const reactions = getAdvisorReactions(executedAction, judgment);

      const updatedCredibility = updateAdvisorCredibility({
        previous: game.credibility || {},
        advisors: advisorsForMemory,
        finalAction: executedAction,
        judgment,
      });

      const learningAdjustedCredibility = applyLearningFeedback({
        credibility: updatedCredibility,
        advisors: advisorsForMemory,
        correct: isCorrectDecision(executedAction, game),
      });

      const advisorMemory = updateAdvisorMemory({
        memory: game.advisorMemory,
        advisors: advisorsForMemory,
        action: executedAction,
        judgment,
      });
      setIsPaused(true);

      setTimeout(() => {
        setIsPaused(false);
      }, 1200);

      const afterBurst = next;

      setGame({ interrupted: interruption.interrupted, forced: forced.forced, ...next, ...afterBurst, feedback: combined,
        simpleFeedback, reactions, advisorMemory,
        credibility: learningAdjustedCredibility });
    }, 100);
  }

  function handleReset() {
    setBestTurn((prev) => Math.max(prev, game.turn));
    setGame({
      ...buildInitialGame(scenarioId),
      interrupted: false,
      forced: false,
      trust: initialTrust,
      ignoredCounts: initialIgnoredCounts,
      actionHistory: [] as string[],
    });
  }

  
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/analytics");
        const data = await res.json();

        const { derivePlayerProfile, deriveAdaptiveModifiers } =
          await import("@/game/adaptive");

        
        const mods = deriveAdaptiveModifiers(data.runs || []);
        if (mods) setAdaptiveModifiers(mods);

      } catch {}
    }

    loadProfile();
  }, []);

  function handleScenarioChange(nextScenarioId: ScenarioId) {
  setScenarioId(nextScenarioId);
  setGame({ ...(buildInitialGame(nextScenarioId) as Game), advisorMemory: createInitialAdvisorMemory(),
    credibility: createInitialAdvisorCredibility(getDefaultPersonas(buildInitialGame(nextScenarioId))), interrupted: false });
}

return (
    <GameScreen
      game={game}
      onAction={handleAction}
      onReset={handleReset}
      bestTurn={bestTurn}
      scenarioId={scenarioId}
      onScenarioChange={handleScenarioChange}
    />
  );
}

function msg(name: string, role: string, text: string, priority = "medium") {
  return { id: crypto.randomUUID(), name, role, text, priority };
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function phaseMult(turn: number) {
  if (turn >= 18) return TUNING.LATE;
  if (turn >= 10) return TUNING.MID;
  return TUNING.EARLY;
}

function getPressure(game: any) {
  const score =
    game.load * 0.5 +
    game.drift * 1.0 +
    (100 - game.integrity) * 0.4;

  if (score > 120) return "CRITICAL";
  if (score > 80) return "HIGH";
  if (score > 50) return "RISING";
  return "LOW";
}

function applyPassiveDecay(game: any) {
  const m = phaseMult(game.turn);

  const adaptive = game.adaptiveModifiers || {};
  const scenario = game.scenarioModifiers || {};

  const baseLoad = safe(TUNING.BASE_LOAD, 3);
  const baseDrift = safe(TUNING.BASE_DRIFT, 1);
  const baseIntegrityDecay = safe(TUNING.BASE_INTEGRITY_DECAY, 1);

  const loadAcceleration =
    safe(adaptive.loadPressureMult, 1) * safe(scenario.loadAcceleration, 1);

  const driftMultiplier =
    safe(adaptive.driftPenaltyMult, 1) * safe(scenario.driftMultiplier, 1);

  const integrityDecay =
    safe(adaptive.signalDecayMult, 1);

  const next = {
    ...game,
    load: safe(game.load, 0),
    integrity: safe(game.integrity, 100),
    drift: safe(game.drift, 0),
    signalClarity: safe(game.signalClarity, 50),
  };

  next.load = clamp(
    next.load + Math.round(baseLoad * m * loadAcceleration)
  );

  next.drift = clamp(
    next.drift + Math.round(baseDrift * m * driftMultiplier)
  );

  next.integrity = clamp(
    next.integrity - Math.round(baseIntegrityDecay * m * integrityDecay)
  );

  return next;
}

function finalizeRun(game: any) {
  const summary = summarizeTelemetry(game.telemetry);

  const cause =
    game.load >= TUNING.MAX_LOAD
      ? "Load exceeded capacity"
      : game.drift >= TUNING.MAX_DRIFT
      ? "Instability exceeded limits"
      : "Integrity collapsed";

  return {
    ...game,
    summary,
    feedback: {
      title: game.state === "STABILIZED" ? "RUN COMPLETE" : "RUN ENDED",
      effects: [`Reached turn ${game.turn}`],
      note:
        game.state === "STABILIZED"
          ? "You held through the control window."
          : `Cause: ${cause}. Avg pressure: ${summary.avgPressure}.`,
    },
  };
}

function checkTerminal(game: any) {
  if (game.turn >= TUNING.TARGET_TURN && game.state !== "FAILED") {
    const next = {
      ...game,
      state: "STABILIZED",
      pressure: "LOW",
      eventTitle: "System Stabilized",
      eventSub: "You maintained control through the window",
      runInsight: {
        title: `Run Type: ${classifyRun(game)}`,
        text: "Control was maintained under increasing pressure.",
      },
      messages: [
        msg("Mara", "Infrastructure", "The system is holding."),
        msg("Ishaan", "Risk", "The path is defensible."),
      ],
    };

    return finalizeRun(next);
  }

  if (
    game.load >= TUNING.MAX_LOAD ||
    game.drift >= TUNING.MAX_DRIFT ||
    game.integrity <= TUNING.MIN_INTEGRITY
  ) {
    const next = {
      ...game,
      state: "FAILED",
      pressure: "CRITICAL",
      eventTitle: "System Failure",
      eventSub: "Control was lost",
      runInsight: {
        title: `Run Type: ${classifyRun(game)}`,
        text: "Review pressure vs. action timing.",
      },
      messages: [
        msg("Mara", "Infrastructure", "We lost it.", "high"),
        msg("Ishaan", "Risk", "The failure path is traceable.", "high"),
      ],
    };

    return finalizeRun(next);
  }

  return game;
}

function applyDemoAction(game: any, action: string) {
  if (game.state === "FAILED" || game.state === "STABILIZED") return game;

  const prev = game;
  const personasBeforeAction = getPersonaRecommendations(prev);

  let next = applyPassiveDecay(game);

  next = {
    ...next,
    turn: game.turn + 1,
    actionHistory: [...(game.actionHistory || []), action],
  };

  if (action === "REROUTE") {
    next.load -= 14;
    next.drift += 14;
    next.integrity -= 5;
    next.driftVisible = true;

    next.messages = [
      msg("Dane", "Operations", "Short-term relief achieved"),
      msg("Mara", "Infrastructure", "Instability rising rapidly", "high"),
      msg("Ishaan", "Risk", "Compounding risk", "high"),
    ];
  }

  if (action === "OBSERVE") {
    const signalRecoveryMultiplier =
      next.scenarioModifiers?.signalRecoveryMultiplier ?? 1;
    next.signalClarity = clamp(
      next.signalClarity + Math.round(12 * signalRecoveryMultiplier)
    );
    const turn = game.turn ?? 1;

    next.load += 6 + Math.floor(turn * 0.8);
    next.drift += 2 + Math.floor(turn * 0.6);

    next.messages = [
      msg("Elena", "Signal", "Signal improved"),
      msg("Dane", "Operations", "Falling behind", "high"),
    ];
  }

  if (action === "STABILIZE") {
    const driftLevel = next.drift ?? 0;

    let correction = 6;
    if (driftLevel > 40) correction = 10;
    if (driftLevel > 60) correction = 14;

    next.drift -= correction;
    next.integrity += 8;

    if (next.pressure === "CRITICAL") {
      next.load -= 6;
    } else if (next.pressure !== "HIGH") {
      next.load += 4;
    }

    next.messages = [msg("Mara", "Infrastructure", "Stability improved")];
  }

  const history = next.actionHistory || [];
  const recent = history.slice(-3);
  const observeCount = recent.filter((a: string) => a === "OBSERVE").length;

  if (observeCount >= 2) {
    next.drift += 4;
    next.load += 3;
  }

  next.load = clamp(next.load ?? 0);
next.integrity = clamp(next.integrity ?? 0);
next.drift = clamp(next.drift ?? 0);

next.pressure = getPressure(next);
  const stateTurn = next.turn ?? 1;

  const driftLimit = stateTurn > 6 ? 22 : 25;
  const loadLimit = stateTurn > 6 ? 75 : 80;
  const integrityLimit = stateTurn > 6 ? 65 : 60;

  next.state =
    next.drift > driftLimit ||
    next.integrity < integrityLimit ||
    next.load > loadLimit
      ? "DEGRADED"
      : "STABLE";

  next.actionLog = [
    ...(game.actionLog || []),
    {
      turn: next.turn,
      action,
      before: {
        load: prev.load,
        drift: prev.drift,
        integrity: prev.integrity,
        signalClarity: prev.signalClarity,
      },
      after: {
        load: next.load,
        drift: next.drift,
        integrity: next.integrity,
        signalClarity: next.signalClarity,
      },
      note:
        action === "REROUTE"
          ? "Reduced load, increased instability."
          : action === "STABILIZE"
          ? "Improved integrity, increased load pressure."
          : "Improved signal, allowed pressure to rise.",
    },
  ];

  next.telemetry = updateTelemetry(next.telemetry, next);

  if (next.pressure === "CRITICAL") {
    next.eventTitle = "Critical Instability";
    next.eventSub = "System approaching failure";
  }

  const personasAfter = getPersonaRecommendations(next);
  const outcome = evaluateOutcome(prev, next, action);
  next.trust = updateTrust(
    game.trust || initialTrust,
    personasBeforeAction,
    action,
    (persona) => evaluatePersonaOutcome(prev, next, persona)
  );
  next.ignoredCounts = updateIgnoredCounts(
    game.ignoredCounts || initialIgnoredCounts,
    personasBeforeAction,
    action
  );

  return checkTerminal(next);
}


// --- decision learning hook ---
function logDecisionLearning({
  correct,
  confidence,
  weight,
}: {
  correct: boolean;
  confidence: number;
  weight: number;
}) {
  const outcome = classifyOutcome({ correct, confidence, weight });

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "decision_learning",
      ts: new Date().toISOString(),
      correct,
      confidence,
      weight,
      outcome,
    }),
  }).catch(() => {});
}
