"use client";

import { useState, useEffect } from "react";
import { GameScreen } from "@/ui/GameScreen";
import { TUNING } from "@/game/tuning";
import { initTelemetry, updateTelemetry, summarizeTelemetry } from "@/game/telemetry";
import { getPersonaRecommendations } from "@/game/personaEngine";
import { initialTrust, updateTrust } from "@/game/trust";
import { initialIgnoredCounts, updateIgnoredCounts } from "@/game/personaMemory";
import { evaluateOutcome } from "@/game/outcome";
import { classifyRun } from "@/game/runArchetype";
import { logCompletedRun } from "@/game/runAnalytics";

const initialGame = {
  turn: 1,
  state: "STABLE",
  pressure: "RISING",
  eventTitle: "Load Spike Detected",
  eventSub: "Signal confidence low",
  load: 68,
  integrity: 74,
  signalClarity: 46,
  drift: 10,
  driftVisible: false,
  actionHistory: [],
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

export default function Page() {
  const [game, setGame] = useState(initialGame);
  const [bestTurn, setBestTurn] = useState(1);
  const [adaptiveModifiers, setAdaptiveModifiers] = useState(null);

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
      ...initialGame,
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

  return (
    <GameScreen
      game={game}
      onAction={handleAction}
      onReset={handleReset}
      bestTurn={bestTurn}
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
  const mods = game.adaptiveModifiers || {
    loadPressureMult: 1,
    driftPenaltyMult: 1,
    signalDecayMult: 1,
  };
  const m = phaseMult(game.turn);

  return {
    ...game,
    load: clamp(game.load + Math.round((TUNING.BASE_LOAD * m * mods.loadPressureMult))),
    drift: clamp(game.drift + Math.round((TUNING.BASE_DRIFT * m * mods.driftPenaltyMult))),
    integrity: clamp(game.integrity - Math.round((TUNING.BASE_INTEGRITY_DECAY * m * mods.signalDecayMult))),
  };
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
    next.signalClarity = clamp(next.signalClarity + 12);
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

  next.telemetry = updateTelemetry(next.telemetry, next);

  if (next.pressure === "CRITICAL") {
    next.eventTitle = "Critical Instability";
    next.eventSub = "System approaching failure";
  }

  const personasAfter = getPersonaRecommendations(next);
  const outcome = evaluateOutcome(prev, next, action);
  next.trust = updateTrust(game.trust || initialTrust, personasBeforeAction, action, outcome);
  next.ignoredCounts = updateIgnoredCounts(
    game.ignoredCounts || initialIgnoredCounts,
    personasBeforeAction,
    action
  );

  return checkTerminal(next);
}
