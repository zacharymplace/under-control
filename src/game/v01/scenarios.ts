import { initialGameState } from "./initialState";
import type { Advisor, GameState, NodeState, SystemNode } from "./types";

export type ScenarioId =
  | "baseline_degraded"
  | "critical_cascade"
  | "hidden_dependency"
  | "flow_bottleneck"
  | "recovery_window";

export type ScenarioDefinition = {
  id: ScenarioId;
  label: string;
  description: string;
};

export const scenarioCatalog: ScenarioDefinition[] = [
  {
    id: "baseline_degraded",
    label: "Baseline Degraded",
    description: "Default pressure-control setup with one critical fault and several warning nodes.",
  },
  {
    id: "critical_cascade",
    label: "Critical Cascade",
    description: "A harsher opening state where failure propagation is already accelerating.",
  },
  {
    id: "hidden_dependency",
    label: "Hidden Dependency",
    description: "Unknown risk is the main threat. Observation and Nexus trust matter more.",
  },
  {
    id: "flow_bottleneck",
    label: "Flow Bottleneck",
    description: "Routing pressure is concentrated around Flow Regulator and Router Node.",
  },
  {
    id: "recovery_window",
    label: "Recovery Window",
    description: "A more forgiving run with room to learn the observe-reroute-stabilize cadence.",
  },
];

const fallbackScenario = scenarioCatalog[0];

function cloneInitialGameState(): GameState {
  return JSON.parse(JSON.stringify(initialGameState)) as GameState;
}

function scenarioDefinition(id: string | undefined | null) {
  return scenarioCatalog.find((scenario) => scenario.id === id) ?? fallbackScenario;
}

function patchNode(
  nodes: SystemNode[],
  nodeId: string,
  patch: Partial<Omit<SystemNode, "id" | "connections" | "x" | "y">>
) {
  return nodes.map((node) => {
    if (node.id !== nodeId) return node;

    return {
      ...node,
      ...patch,
    };
  });
}

function patchAdvisor(
  advisors: Advisor[],
  advisorId: Advisor["id"],
  patch: Partial<Advisor>
) {
  return advisors.map((advisor) => {
    if (advisor.id !== advisorId) return advisor;

    return {
      ...advisor,
      ...patch,
    };
  });
}

function scenarioIntro(label: string, message: string) {
  return [
    {
      cycle: 1,
      tone: "warning" as const,
      message: `${label}: ${message}`,
    },
  ];
}

function applyBaseline(game: GameState): GameState {
  return {
    ...game,
    currentPriority: "Reroute Flow Regulator before Signal Break cascades.",
    events: scenarioIntro(
      "Baseline Degraded",
      "System enters DEGRADED state. Signal Break is unstable."
    ),
  };
}

function applyCriticalCascade(game: GameState): GameState {
  let nodes = game.nodes;

  nodes = patchNode(nodes, "signal", {
    state: "critical" as NodeState,
    pressure: 92,
    volatility: 88,
    integrity: 24,
    hiddenRisk: 76,
    observed: false,
    ignoredCriticalCycles: 2,
  });

  nodes = patchNode(nodes, "flow", {
    state: "warning" as NodeState,
    pressure: 72,
    volatility: 62,
    integrity: 58,
    observed: true,
  });

  nodes = patchNode(nodes, "router", {
    state: "warning" as NodeState,
    pressure: 70,
    volatility: 58,
    integrity: 60,
    observed: true,
  });

  let advisors = game.advisors;
  advisors = patchAdvisor(advisors, "risk", {
    trust: 68,
    confidence: 82,
    state: "speaking",
    recommendation: "Cascade risk is already active. Confirm, then repair.",
  });
  advisors = patchAdvisor(advisors, "ops", {
    trust: 70,
    confidence: 70,
    state: "cautious",
    recommendation: "Reroute quickly, but avoid dumping load into Router Node.",
  });

  return {
    ...game,
    nodes,
    advisors,
    pressure: 64,
    cascadeRisk: 34,
    currentPriority: "Contain Signal Break before the cascade breaches twice.",
    events: scenarioIntro(
      "Critical Cascade",
      "Failure propagation is already accelerating."
    ),
  };
}

function applyHiddenDependency(game: GameState): GameState {
  let nodes = game.nodes;

  nodes = patchNode(nodes, "signal", {
    state: "warning" as NodeState,
    pressure: 70,
    volatility: 64,
    integrity: 54,
    hiddenRisk: 84,
    observed: false,
    ignoredCriticalCycles: 0,
  });

  nodes = patchNode(nodes, "null", {
    state: "unknown" as NodeState,
    pressure: 58,
    volatility: 72,
    integrity: 58,
    hiddenRisk: 92,
    observed: false,
  });

  nodes = patchNode(nodes, "data", {
    state: "active" as NodeState,
    pressure: 50,
    volatility: 42,
    integrity: 78,
    hiddenRisk: 54,
    observed: true,
  });

  let advisors = game.advisors;
  advisors = patchAdvisor(advisors, "nexus", {
    trust: 74,
    confidence: 84,
    state: "speaking",
    recommendation: "Unknown dependencies are driving system risk. Observe before force.",
  });
  advisors = patchAdvisor(advisors, "risk", {
    trust: 58,
    confidence: 66,
    state: "cautious",
    recommendation: "Do not stabilize blind faults unless cascade is unavoidable.",
  });

  return {
    ...game,
    nodes,
    advisors,
    pressure: 54,
    cascadeRisk: 22,
    currentPriority: "Observe Null Buffer or Signal Break before direct intervention.",
    events: scenarioIntro(
      "Hidden Dependency",
      "Unknown risk is distorting system behavior."
    ),
  };
}

function applyFlowBottleneck(game: GameState): GameState {
  let nodes = game.nodes;

  nodes = patchNode(nodes, "flow", {
    state: "warning" as NodeState,
    pressure: 82,
    volatility: 60,
    integrity: 58,
    hiddenRisk: 42,
    observed: true,
  });

  nodes = patchNode(nodes, "router", {
    state: "warning" as NodeState,
    pressure: 78,
    volatility: 56,
    integrity: 62,
    hiddenRisk: 38,
    observed: true,
  });

  nodes = patchNode(nodes, "signal", {
    state: "warning" as NodeState,
    pressure: 74,
    volatility: 70,
    integrity: 44,
    hiddenRisk: 68,
    observed: false,
    ignoredCriticalCycles: 0,
  });

  nodes = patchNode(nodes, "stability", {
    state: "stable" as NodeState,
    pressure: 24,
    volatility: 12,
    integrity: 96,
    hiddenRisk: 14,
    observed: true,
  });

  let advisors = game.advisors;
  advisors = patchAdvisor(advisors, "ops", {
    trust: 82,
    confidence: 86,
    state: "speaking",
    recommendation: "Flow is the constraint. Reroute before stabilizing.",
  });
  advisors = patchAdvisor(advisors, "nexus", {
    trust: 60,
    confidence: 68,
    state: "aligned",
    recommendation: "Stability Grid can absorb load if transfers stay measured.",
  });

  return {
    ...game,
    nodes,
    advisors,
    pressure: 60,
    cascadeRisk: 20,
    currentPriority: "Relieve Flow Regulator without overloading Router Node.",
    events: scenarioIntro(
      "Flow Bottleneck",
      "Throughput pressure is concentrated in routing infrastructure."
    ),
  };
}

function applyRecoveryWindow(game: GameState): GameState {
  let nodes = game.nodes;

  nodes = patchNode(nodes, "signal", {
    state: "warning" as NodeState,
    pressure: 68,
    volatility: 62,
    integrity: 48,
    hiddenRisk: 64,
    observed: false,
    ignoredCriticalCycles: 0,
  });

  nodes = patchNode(nodes, "flow", {
    state: "warning" as NodeState,
    pressure: 58,
    volatility: 44,
    integrity: 72,
    hiddenRisk: 36,
    observed: true,
  });

  nodes = patchNode(nodes, "router", {
    state: "active" as NodeState,
    pressure: 48,
    volatility: 38,
    integrity: 78,
    hiddenRisk: 30,
    observed: true,
  });

  nodes = patchNode(nodes, "stability", {
    state: "stable" as NodeState,
    pressure: 18,
    volatility: 10,
    integrity: 98,
    hiddenRisk: 10,
    observed: true,
  });

  let advisors = game.advisors;
  advisors = patchAdvisor(advisors, "risk", {
    trust: 70,
    confidence: 74,
    state: "aligned",
    recommendation: "This is recoverable. Observe Signal Break before stabilizing.",
  });
  advisors = patchAdvisor(advisors, "ops", {
    trust: 76,
    confidence: 78,
    state: "speaking",
    recommendation: "Use the recovery window to reduce flow strain early.",
  });
  advisors = patchAdvisor(advisors, "nexus", {
    trust: 72,
    confidence: 76,
    state: "aligned",
    recommendation: "System coherence is still intact.",
  });

  return {
    ...game,
    nodes,
    advisors,
    pressure: 46,
    cascadeRisk: 10,
    currentPriority: "Use the recovery window: observe, reroute, then stabilize.",
    events: scenarioIntro(
      "Recovery Window",
      "System is degraded but still highly recoverable."
    ),
  };
}

export function createInitialGameState(scenarioId: string = "baseline_degraded"): GameState {
  const scenario = scenarioDefinition(scenarioId);
  const game: GameState = {
    ...cloneInitialGameState(),
    scenarioId: scenario.id,
    scenarioLabel: scenario.label,
  };

  if (scenario.id === "critical_cascade") return applyCriticalCascade(game);
  if (scenario.id === "hidden_dependency") return applyHiddenDependency(game);
  if (scenario.id === "flow_bottleneck") return applyFlowBottleneck(game);
  if (scenario.id === "recovery_window") return applyRecoveryWindow(game);

  return applyBaseline(game);
}
