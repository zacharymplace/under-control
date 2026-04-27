"use client";

import { useState } from "react";
import { GameScreen } from "@/ui/GameScreen";

const TARGET_TURN = 25;

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

  function handleAction(action: string) {
    const next = applyDemoAction(game, action);
    setTimeout(() => setGame(next), 100);
  }

  function handleReset() {
    setBestTurn((prev) => Math.max(prev, game.turn));
    setGame(initialGame);
  }

  return (
    <GameScreen
      game={game}
      onAction={handleAction}
      onReset={handleReset}
      bestTurn={bestTurn}
    />
  );
}

/* -------------------- helpers -------------------- */

function msg(name: string, role: string, text: string, priority = "medium") {
  return {
    id: crypto.randomUUID(),
    name,
    role,
    text,
    priority,
  };
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function getPhase(turn: number) {
  if (turn >= 18) return "LATE";
  if (turn >= 10) return "MID";
  return "EARLY";
}

function getDifficultyMultiplier(turn: number) {
  if (turn >= 18) return 1.75;
  if (turn >= 10) return 1.35;
  return 1;
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

/* -------------------- passive system pressure -------------------- */

function applyPassiveDecay(game: any) {
  const multiplier = getDifficultyMultiplier(game.turn);

  return {
    ...game,
    load: clamp(game.load + Math.round(3 * multiplier)),
    drift: clamp(game.drift + Math.round(1 * multiplier)),
    integrity: clamp(game.integrity - Math.round(1 * multiplier)),
  };
}

/* -------------------- run insight -------------------- */

function getRunInsight(game: any) {
  const history = game.actionHistory || [];
  const total = history.length || 1;

  const reroutes = history.filter((a: string) => a === "REROUTE").length;
  const observes = history.filter((a: string) => a === "OBSERVE").length;
  const stabilizes = history.filter((a: string) => a === "STABILIZE").length;

  const rerouteRate = reroutes / total;
  const observeRate = observes / total;
  const stabilizeRate = stabilizes / total;

  if (rerouteRate >= 0.5) {
    return {
      title: "Pattern Detected: Early Reroute Bias",
      text: "You reduced load quickly, but instability accumulated underneath it.",
    };
  }

  if (observeRate >= 0.5) {
    return {
      title: "Pattern Detected: Delayed Action",
      text: "You gathered signal, but pressure kept rising while the system moved without you.",
    };
  }

  if (stabilizeRate >= 0.5) {
    return {
      title: "Pattern Detected: Conservative Stabilizer",
      text: "You protected integrity, but load pressure remained a persistent threat.",
    };
  }

  return {
    title: "Pattern Detected: Mixed Response",
    text: "You varied your actions, but the system still crossed its instability limit.",
  };
}

/* -------------------- terminal states -------------------- */

function checkWinOrFailure(game: any) {
  if (game.turn >= TARGET_TURN && game.state !== "FAILED") {
    return {
      ...game,
      state: "STABILIZED",
      pressure: "LOW",
      eventTitle: "System Stabilized",
      eventSub: "You maintained control through the assignment window",
      runInsight: {
        title: "Assignment Complete",
        text: "You kept the system viable long enough to stabilize the operating window.",
      },
      feedback: {
        title: "RUN COMPLETE",
        effects: [`Reached turn ${game.turn}`, "System remained viable"],
        note: "You survived the first control window.",
      },
      messages: [
        msg("Mara", "Infrastructure", "The system is holding."),
        msg("Ishaan", "Risk", "The decision path is defensible."),
      ],
    };
  }

  if (game.integrity <= 20 || game.drift >= 60 || game.load >= 100) {
    return {
      ...game,
      state: "FAILED",
      pressure: "CRITICAL",
      eventTitle: "System Failure",
      eventSub: "Control was lost",
      runInsight: getRunInsight(game),
      feedback: {
        title: "RUN ENDED",
        effects: [`Reached turn ${game.turn}`],
        note:
          game.load >= 100
            ? "Cause: load pressure exceeded system capacity."
            : game.drift >= 60
            ? "Cause: instability accumulated beyond recovery limits."
            : "Cause: integrity collapsed under sustained pressure.",
      },
      messages: [
        msg("Mara", "Infrastructure", "We lost it.", "high"),
        msg("Ishaan", "Risk", "The failure path is traceable.", "high"),
      ],
    };
  }

  return game;
}

/* -------------------- event updates -------------------- */

function updateEventState(game: any) {
  const phase = getPhase(game.turn);

  if (game.pressure === "CRITICAL") {
    return {
      ...game,
      eventTitle: "Critical Instability",
      eventSub: "System approaching failure",
      messages: [
        msg("Mara", "Infrastructure", "We are close to losing control.", "high"),
        msg("Ishaan", "Risk", "Any action now carries heavy consequences.", "high"),
      ],
    };
  }

  if (phase === "LATE") {
    return {
      ...game,
      eventTitle: "Sustained Pressure",
      eventSub: "The system is degrading faster than recovery can stabilize",
    };
  }

  if (phase === "MID") {
    return {
      ...game,
      eventTitle: "Instability Increasing",
      eventSub: "System behavior becoming less predictable",
    };
  }

  return game;
}

/* -------------------- core loop -------------------- */

function applyDemoAction(game: any, action: string) {
  if (game.state === "FAILED" || game.state === "STABILIZED") return game;

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

    next.feedback = {
      title: "REROUTE EXECUTED",
      effects: ["Load ↓↓↓", "Drift ↑↑", "Integrity ↓"],
      note: "That helped… but at a cost",
    };

    next.messages = [
      msg("Dane", "Operations", "Short-term relief achieved"),
      msg("Mara", "Infrastructure", "Instability rising rapidly", "high"),
      msg("Ishaan", "Risk", "That decision compounds risk", "high"),
    ];
  }

  if (action === "OBSERVE") {
    next.signalClarity = clamp(next.signalClarity + 12);
    next.load += 6;
    next.drift += 2;

    next.feedback = {
      title: "OBSERVE EXECUTED",
      effects: ["Signal ↑↑", "Load ↑", "Drift ↑"],
      note: "You gained clarity, but the system kept moving",
    };

    next.messages = [
      msg("Elena", "Signal", "Signal improved"),
      msg("Dane", "Operations", "We are falling behind", "high"),
    ];
  }

  if (action === "STABILIZE") {
    next.integrity += 9;
    next.load += 5;
    next.drift -= 3;

    next.feedback = {
      title: "STABILIZE EXECUTED",
      effects: ["Integrity ↑↑", "Load ↑", "Drift ↓"],
      note: "You bought time",
    };

    next.messages = [msg("Mara", "Infrastructure", "Stability improved")];
  }

  next.load = clamp(next.load);
  next.integrity = clamp(next.integrity);
  next.drift = clamp(next.drift);

  next.pressure = getPressure(next);

  if (next.drift > 25 || next.integrity < 60 || next.load > 80) {
    next.state = "DEGRADED";
  } else {
    next.state = "STABLE";
  }

  next = updateEventState(next);
  next = checkWinOrFailure(next);

  return next;
}
