"use client";

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
import { logCompletedRun } from "@/game/runAnalytics";

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
  actionHistory: [],
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
  const [game, setGame] = useState(() => buildInitialGame("guided_first_run"));
  const [bestTurn, setBestTurn] = useState(1);
  const [adaptiveModifiers, setAdaptiveModifiers] = useState<AdaptiveModifiers | null>(null);

  function handleAction(action: string) {
    const next = applyDemoAction(
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

    setTimeout(() => setGame(next), 100);
  }

  function handleReset() {
    setBestTurn((prev) => Math.max(prev, game.turn));
    setGame({
      ...buildInitialGame(scenarioId),
      trust: initialTrust,
      ignoredCounts: initialIgnoredCounts,
    });
  }

  
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/analytics");
        const data = await res.json();

        const { derivePlayerProfile, deriveAdaptiveModifiers } =
          await import("@/game/adaptive");

        const profile = derivePlayerProfile(data.runs || []);
        const mods = deriveAdaptiveModifiers(profile);

        setAdaptiveModifiers(mods);
      } catch {}
    }

    loadProfile();
  }, []);

  function handleScenarioChange(nextScenarioId: ScenarioId) {
  setScenarioId(nextScenarioId);
  setGame(buildInitialGame(nextScenarioId));
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

  const loadAcceleration =
    (adaptive.loadPressureMult ?? 1) * (scenario.loadAcceleration ?? 1);

  const driftMultiplier =
    (adaptive.driftPenaltyMult ?? 1) * (scenario.driftMultiplier ?? 1);

  const integrityDecay =
    adaptive.signalDecayMult ?? 1;

  const next = { ...game };

  next.load = clamp(
    next.load + Math.round(TUNING.BASE_LOAD * m * loadAcceleration)
  );

  next.drift = clamp(
    next.drift + Math.round(TUNING.BASE_DRIFT * m * driftMultiplier)
  );

  next.integrity = clamp(
    next.integrity - Math.round(TUNING.BASE_INTEGRITY_DECAY * m * integrityDecay)
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
    next.load += 6;
    next.drift += 2;

    next.messages = [
      msg("Elena", "Signal", "Signal improved"),
      msg("Dane", "Operations", "Falling behind", "high"),
    ];
  }

  if (action === "STABILIZE") {
    next.integrity += 9;
    next.load += 5;
    next.drift -= 3;

    next.messages = [msg("Mara", "Infrastructure", "Stability improved")];
  }

  next.load = clamp(next.load);
  next.integrity = clamp(next.integrity);
  next.drift = clamp(next.drift);

  next.pressure = getPressure(next);
  next.state =
    next.drift > 25 || next.integrity < 60 || next.load > 80
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