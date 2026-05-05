import { initialGameState } from "./initialState";
import type {
  Advisor,
  EventLogEntry,
  GameAction,
  GameState,
  NodeState,
  PlayerActionType,
  SystemNode,
} from "./types";

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(value)));

function event(state: GameState, message: string, tone: EventLogEntry["tone"] = "neutral") {
  return [
    { cycle: state.cycle, tone, message },
    ...state.events,
  ].slice(0, 8);
}

function deriveNodeState(node: SystemNode): NodeState {
  if (!node.observed && node.state === "unknown") return "unknown";
  if (node.state === "suppressed") return "suppressed";
  if (node.integrity <= 28 || node.pressure >= 84) return "critical";
  if (node.pressure >= 60 || node.volatility >= 65) return "warning";
  if (node.pressure <= 35 && node.integrity >= 82) return "stable";
  return "active";
}

function updateAdvisor(
  advisors: Advisor[],
  id: Advisor["id"],
  deltaTrust: number,
  deltaConfidence: number,
  state?: Advisor["state"],
  recommendation?: string
): Advisor[] {
  return advisors.map((advisor) => {
    if (advisor.id !== id) return advisor;

    const trust = clamp(advisor.trust + deltaTrust);
    const confidence = clamp(advisor.confidence + deltaConfidence);

    return {
      ...advisor,
      trust,
      confidence,
      state:
        state ??
        (trust < 35
          ? "low_trust"
          : confidence > 78
            ? "high_confidence"
            : advisor.state),
      recommendation: recommendation ?? advisor.recommendation,
    };
  });
}

function getNode(state: GameState, nodeId: string) {
  return state.nodes.find((node) => node.id === nodeId);
}

function isInRange(state: GameState, nodeId: string) {
  const operatorNode = getNode(state, state.operatorNodeId);
  return state.operatorNodeId === nodeId || !!operatorNode?.connections.includes(nodeId);
}

function canAct(state: GameState, action: PlayerActionType) {
  if (state.status !== "running") return "Run is no longer active.";
  if (!state.selectedNodeId) return "Select a node first.";
  if (state.energy < 1) return "No action energy remains this cycle.";
  if (state.actionCooldowns[action] > 0) return `${action.toUpperCase()} is cooling down.`;
  if (!isInRange(state, state.selectedNodeId)) return "Target is outside operator range.";
  return null;
}

function applyObserve(state: GameState): GameState {
  const failure = canAct(state, "observe");
  if (failure) return { ...state, events: event(state, failure, "warning") };

  const targetId = state.selectedNodeId!;
  let observedCritical = false;

  const nodes = state.nodes.map((node) => {
    if (node.id !== targetId) return node;

    const nextNode: SystemNode = {
      ...node,
      observed: true,
      hiddenRisk: clamp(node.hiddenRisk - 24),
      volatility: clamp(node.volatility - 8),
      lastAction: "observe",
    };

    if (node.state === "unknown") {
      nextNode.state = nextNode.hiddenRisk > 50 ? "warning" : "active";
    } else {
      nextNode.state = deriveNodeState(nextNode);
    }

    observedCritical = node.state === "critical";
    return nextNode;
  });

  let advisors = state.advisors;
  advisors = updateAdvisor(
    advisors,
    "nexus",
    5,
    6,
    "speaking",
    "Observation improved dependency clarity."
  );
  advisors = updateAdvisor(
    advisors,
    "risk",
    observedCritical ? 4 : 2,
    3,
    observedCritical ? "aligned" : undefined,
    observedCritical
      ? "Critical fault is now better understood."
      : "Observation reduced hidden risk."
  );
  advisors = updateAdvisor(
    advisors,
    "ops",
    observedCritical ? -1 : 0,
    0,
    undefined,
    "Observation complete. Preserve action economy."
  );

  return {
    ...state,
    nodes,
    advisors,
    energy: state.energy - 1,
    cascadeRisk: clamp(state.cascadeRisk - 3),
    actionCooldowns: { ...state.actionCooldowns, observe: 1 },
    events: event(state, `Observed ${getNode(state, targetId)?.label}. Hidden risk reduced.`, "good"),
  };
}

function applyReroute(state: GameState): GameState {
  const failure = canAct(state, "reroute");
  if (failure) return { ...state, events: event(state, failure, "warning") };

  const targetId = state.selectedNodeId!;
  const target = getNode(state, targetId)!;
  const connectedIds = target.connections;
  const transfer = target.observed ? 5 : 8;

  const nodes = state.nodes.map((node) => {
    if (node.id === targetId) {
      const next = {
        ...node,
        pressure: clamp(node.pressure - 22),
        volatility: clamp(node.volatility - 8),
        lastAction: "reroute" as const,
      };
      return { ...next, state: deriveNodeState(next) };
    }

    if (connectedIds.includes(node.id)) {
      const next = {
        ...node,
        pressure: clamp(node.pressure + transfer),
        volatility: clamp(node.volatility + (target.observed ? 2 : 5)),
      };
      return { ...next, state: deriveNodeState(next) };
    }

    return node;
  });

  let advisors = state.advisors;
  advisors = updateAdvisor(
    advisors,
    "ops",
    6,
    5,
    "speaking",
    "Reroute relieved immediate flow pressure."
  );
  advisors = updateAdvisor(
    advisors,
    "nexus",
    target.observed ? 2 : -4,
    target.observed ? 2 : -2,
    target.observed ? "aligned" : "disagreeing",
    target.observed
      ? "Dependency impact remained within tolerance."
      : "Reroute executed with unresolved dependency risk."
  );
  advisors = updateAdvisor(
    advisors,
    "risk",
    target.state === "critical" ? 1 : -1,
    0,
    undefined,
    "Monitor transferred pressure after reroute."
  );

  return {
    ...state,
    nodes,
    advisors,
    energy: state.energy - 1,
    cascadeRisk: clamp(state.cascadeRisk - 4),
    actionCooldowns: { ...state.actionCooldowns, reroute: 2 },
    events: event(state, `Rerouted ${target.label}. Pressure shifted through connected paths.`, "good"),
  };
}

function applyStabilize(state: GameState): GameState {
  const failure = canAct(state, "stabilize");
  if (failure) return { ...state, events: event(state, failure, "warning") };

  const targetId = state.selectedNodeId!;
  const target = getNode(state, targetId)!;
  const reckless = !target.observed && target.hiddenRisk > 60;

  const nodes = state.nodes.map((node) => {
    if (node.id !== targetId) return node;

    const next = {
      ...node,
      integrity: clamp(node.integrity + (reckless ? 10 : 24)),
      pressure: clamp(node.pressure - (reckless ? 6 : 16)),
      volatility: clamp(node.volatility - (reckless ? 2 : 10)),
      observed: node.observed,
      lastAction: "stabilize" as const,
    };

    return { ...next, state: deriveNodeState(next) };
  });

  let advisors = state.advisors;

  if (reckless) {
    advisors = updateAdvisor(
      advisors,
      "risk",
      -7,
      -5,
      "disagreeing",
      "Direct stabilization applied before confirming hidden risk."
    );
    advisors = updateAdvisor(
      advisors,
      "nexus",
      -4,
      -3,
      "cautious",
      "System coherence degraded by blind intervention."
    );
  } else {
    advisors = updateAdvisor(
      advisors,
      "risk",
      6,
      5,
      "speaking",
      "Confirmed instability reduced."
    );
    advisors = updateAdvisor(
      advisors,
      "ops",
      2,
      1,
      "aligned",
      "Node capacity improved."
    );
  }

  return {
    ...state,
    nodes,
    advisors,
    energy: state.energy - 1,
    cascadeRisk: clamp(state.cascadeRisk + (reckless ? 12 : -6)),
    recklessActions: state.recklessActions + (reckless ? 1 : 0),
    observedBeforeCriticalAction:
      state.observedBeforeCriticalAction + (!reckless && target.state === "critical" ? 1 : 0),
    actionCooldowns: { ...state.actionCooldowns, stabilize: 2 },
    events: event(
      state,
      reckless
        ? `Stabilized ${target.label}, but hidden risk spiked cascade pressure.`
        : `Stabilized ${target.label}. Instability reduced.`,
      reckless ? "critical" : "good"
    ),
  };
}

function updateCurrentPriority(nodes: SystemNode[]) {
  const critical = nodes.find((node) => node.state === "critical");
  if (critical) return `Stabilize or observe ${critical.label} before the cascade spreads.`;

  const warning = nodes.find((node) => node.state === "warning");
  if (warning) return `Reroute ${warning.label} before it crosses threshold.`;

  const unknown = nodes.find((node) => node.state === "unknown");
  if (unknown) return `Observe ${unknown.label} to resolve hidden system risk.`;

  return "Maintain stability through the next cycle.";
}

function resolveCycle(state: GameState): GameState {
  if (state.status !== "running") return state;

  let unresolvedCriticalCycles = 0;

  const nodes = state.nodes.map((node) => {
    let pressure = node.pressure;
    let volatility = node.volatility;
    let integrity = node.integrity;

    if (node.state === "stable") pressure -= 2;
    if (node.state === "active") pressure += 2;
    if (node.state === "warning") pressure += 5;
    if (node.state === "critical") {
      pressure += 10;
      integrity -= 6;
    }
    if (node.state === "unknown" && node.hiddenRisk > 60) {
      pressure += 3;
      volatility += 4;
    }

    const next: SystemNode = {
      ...node,
      pressure: clamp(pressure),
      volatility: clamp(volatility),
      integrity: clamp(integrity),
      ignoredCriticalCycles:
        node.state === "critical" ? node.ignoredCriticalCycles + 1 : 0,
    };

    next.state = deriveNodeState(next);

    if (next.state === "critical") unresolvedCriticalCycles += 1;

    return next;
  });

  const criticalCount = nodes.filter((node) => node.state === "critical").length;
  const warningCount = nodes.filter((node) => node.state === "warning").length;
  const ignoredCriticalPenalty = nodes.reduce(
    (sum, node) => sum + (node.ignoredCriticalCycles >= 2 ? 10 : 0),
    0
  );

  const stabilityGrid = nodes.find((node) => node.id === "stability");
  const stabilityRecovery =
    stabilityGrid?.state === "stable" || stabilityGrid?.state === "active" ? 2 : 0;

  let cascadeRisk = clamp(
    state.cascadeRisk +
      criticalCount * 8 +
      warningCount * 3 +
      ignoredCriticalPenalty -
      (criticalCount === 0 ? 4 : 0)
  );

  let cascadeBreaches = state.cascadeBreaches;
  let integrity = clamp(
    state.integrity -
      criticalCount * 6 -
      warningCount * 2 -
      (cascadeRisk > 70 ? 10 : 0) +
      stabilityRecovery
  );

  let cycleEvents: EventLogEntry[] = state.events;

  if (cascadeRisk >= 100) {
    cascadeBreaches += 1;
    integrity = clamp(integrity - 30);
    cascadeRisk = 70;
    cycleEvents = [
      {
        cycle: state.cycle,
        tone: "critical" as const,
        message: "Cascade breach. Integrity took a major hit.",
      },
      ...cycleEvents,
    ].slice(0, 8);
  }

  const pressure = clamp(
    nodes.reduce((sum, node) => sum + node.pressure, 0) / nodes.length
  );

  const core = nodes.find((node) => node.id === "core");
  let status: GameState["status"] = "running";

  if (integrity <= 0 || cascadeBreaches >= 2) status = "lost";
  if (core?.state === "critical" && core.ignoredCriticalCycles >= 2) status = "lost";
  if (state.cycle >= state.maxCycles && integrity > 40 && cascadeBreaches < 2) status = "won";
  if (state.cycle >= state.maxCycles && integrity <= 40) status = "lost";

  const actionCooldowns = {
    observe: Math.max(0, state.actionCooldowns.observe - 1),
    reroute: Math.max(0, state.actionCooldowns.reroute - 1),
    stabilize: Math.max(0, state.actionCooldowns.stabilize - 1),
  };

  const resolvedEndTone: EventLogEntry["tone"] =
    status === "running" ? "neutral" : status === "won" ? "good" : "critical";

  const resolvedEndMessage =
    status === "running"
      ? "Cycle advanced. System pressure redistributed."
      : status === "won"
        ? "Run stabilized. Operator maintained control."
        : "Run failed. System entered uncontrolled cascade.";

  let advisors: Advisor[] = state.advisors.map((advisor) => ({
    ...advisor,
    state:
      advisor.trust < 35
        ? ("low_trust" as const)
        : advisor.confidence > 82
          ? ("high_confidence" as const)
          : advisor.state === "speaking"
            ? ("aligned" as const)
            : advisor.state,
  }));

  if (criticalCount > 0) {
    advisors = updateAdvisor(
      advisors,
      "risk",
      0,
      2,
      "speaking",
      "Critical pressure remains active. Confirm before forceful repair."
    );
  } else if (warningCount > 0) {
    advisors = updateAdvisor(
      advisors,
      "ops",
      0,
      2,
      "speaking",
      "Warning nodes are still routable. Keep flow moving."
    );
  } else {
    advisors = updateAdvisor(
      advisors,
      "nexus",
      1,
      2,
      "speaking",
      "System coherence improving. Maintain restraint."
    );
  }

  return {
    ...state,
    cycle: state.cycle + 1,
    nodes,
    advisors,
    pressure,
    cascadeRisk,
    cascadeBreaches,
    integrity,
    energy: 2,
    unresolvedCriticalCycles,
    actionCooldowns,
    currentPriority: updateCurrentPriority(nodes),
    status,
    events: [
      {
        cycle: state.cycle,
        tone: resolvedEndTone,
        message: resolvedEndMessage,
      },
      ...cycleEvents,
    ].slice(0, 8),
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "select_node":
      return { ...state, selectedNodeId: action.nodeId };

    case "move_operator": {
      if (!isInRange(state, action.nodeId)) {
        return { ...state, events: event(state, "Move target outside operator range.", "warning") };
      }

      return {
        ...state,
        operatorNodeId: action.nodeId,
        selectedNodeId: action.nodeId,
        events: event(state, `Operator moved to ${getNode(state, action.nodeId)?.label}.`, "neutral"),
      };
    }

    case "perform_action":
      if (action.action === "observe") return applyObserve(state);
      if (action.action === "reroute") return applyReroute(state);
      if (action.action === "stabilize") return applyStabilize(state);
      return state;

    case "advance_cycle":
      return resolveCycle(state);

    case "reset":
      return initialGameState;

    default:
      return state;
  }
}
