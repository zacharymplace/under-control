import type {
  AdvisorId,
  GameState,
  PlayerActionType,
  SystemNode,
} from "./types";

export type AdvisorPreviewEffect = {
  id: AdvisorId;
  trustDelta: number;
  confidenceDelta: number;
  note: string;
};

export type NodePreviewEffect = {
  nodeId: string;
  label: string;
  pressureDelta: number;
  integrityDelta: number;
  note: string;
};

export type ActionPreview = {
  action: PlayerActionType;
  targetId: string | null;
  targetLabel: string;
  allowed: boolean;
  reason?: string;
  summary: string;
  energyCost: number;
  cooldown: number;
  targetPressureDelta: number;
  targetIntegrityDelta: number;
  cascadeRiskDelta: number;
  advisorEffects: AdvisorPreviewEffect[];
  affectedNodes: NodePreviewEffect[];
  warnings: string[];
  guidanceNextNodeId: string | null;
  guidancePathNodeIds: string[];
};

function getNode(game: GameState, nodeId: string | null | undefined) {
  if (!nodeId) return null;
  return game.nodes.find((node) => node.id === nodeId) ?? null;
}

function isInRange(game: GameState, nodeId: string) {
  const operatorNode = getNode(game, game.operatorNodeId);
  return game.operatorNodeId === nodeId || !!operatorNode?.connections.includes(nodeId);
}

function actionVerb(action: PlayerActionType) {
  if (action === "observe") return "observe";
  if (action === "reroute") return "reroute";
  return "stabilize";
}

function findShortestPath(game: GameState, fromId: string, toId: string): string[] {
  if (fromId === toId) return [fromId];

  const queue: string[][] = [[fromId]];
  const visited = new Set<string>([fromId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const currentId = path[path.length - 1];
    const current = getNode(game, currentId);

    if (!current) continue;

    for (const nextId of current.connections) {
      if (visited.has(nextId)) continue;

      const nextPath = [...path, nextId];

      if (nextId === toId) {
        return nextPath;
      }

      visited.add(nextId);
      queue.push(nextPath);
    }
  }

  return [];
}

function blockedGuidance(game: GameState, action: PlayerActionType, target: SystemNode | null, reason: string) {
  if (!target) return reason;

  if (reason === "Target is outside operator range.") {
    const path = findShortestPath(game, game.operatorNodeId, target.id);

    if (path.length >= 2) {
      const nextStep = getNode(game, path[1]);
      const current = getNode(game, game.operatorNodeId);

      if (nextStep && current) {
        return `Target is outside operator range. Move from ${current.label} to ${nextStep.label} first, then ${actionVerb(action)} ${target.label}.`;
      }
    }

    return `Target is outside operator range. Move closer before trying to ${actionVerb(action)} ${target.label}.`;
  }

  if (reason === "No action energy remains this cycle.") {
    return "No action energy remains this cycle. Advance the cycle to regain energy.";
  }

  if (reason.endsWith("is cooling down.")) {
    return `${reason} Select another action or advance the cycle.`;
  }

  if (reason === "Run is no longer active.") {
    return "Run is no longer active. Reset to start a new run.";
  }

  return reason;
}

function blockedPreview(
  game: GameState,
  action: PlayerActionType,
  reason: string
): ActionPreview {
  const target = getNode(game, game.selectedNodeId);
  const guidance = blockedGuidance(game, action, target, reason);
  const guidancePathNodeIds =
    target && reason === "Target is outside operator range."
      ? findShortestPath(game, game.operatorNodeId, target.id)
      : [];
  const guidanceNextNodeId = guidancePathNodeIds.length >= 2 ? guidancePathNodeIds[1] : null;

  return {
    action,
    targetId: target?.id ?? null,
    targetLabel: target?.label ?? "No target",
    allowed: false,
    reason,
    summary: guidance,
    energyCost: 1,
    cooldown: game.actionCooldowns[action] ?? 0,
    targetPressureDelta: 0,
    targetIntegrityDelta: 0,
    cascadeRiskDelta: 0,
    advisorEffects: [],
    affectedNodes: [],
    warnings: [guidance],
    guidanceNextNodeId,
    guidancePathNodeIds,
  };
}

function validatePreview(game: GameState, action: PlayerActionType) {
  const target = getNode(game, game.selectedNodeId);

  if (game.status !== "running") return "Run is no longer active.";
  if (!target) return "Select a node first.";
  if (game.energy < 1) return "No action energy remains this cycle.";
  if ((game.actionCooldowns[action] ?? 0) > 0) return `${action.toUpperCase()} is cooling down.`;
  if (!isInRange(game, target.id)) return "Target is outside operator range.";

  return null;
}

export function formatDelta(value: number) {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

export function getActionPreview(
  game: GameState,
  action: PlayerActionType,
  targetId = game.selectedNodeId
): ActionPreview {
  const previewGame: GameState = {
    ...game,
    selectedNodeId: targetId ?? game.selectedNodeId,
  };

  const blocked = validatePreview(previewGame, action);
  if (blocked) return blockedPreview(previewGame, action, blocked);

  const target = getNode(previewGame, previewGame.selectedNodeId)!;
  const warnings: string[] = [];
  const advisorEffects: AdvisorPreviewEffect[] = [];
  const affectedNodes: NodePreviewEffect[] = [];

  if (action === "observe") {
    const hiddenRiskReduction = target.observed ? 10 : 24;
    const targetPressureDelta = 0;
    const targetIntegrityDelta = 0;
    const cascadeRiskDelta = -3;

    advisorEffects.push(
      {
        id: "nexus",
        trustDelta: 5,
        confidenceDelta: 6,
        note: "Dependency clarity improves.",
      },
      {
        id: "risk",
        trustDelta: target.state === "critical" ? 4 : 2,
        confidenceDelta: 3,
        note: "Hidden risk gets easier to reason about.",
      }
    );

    if (target.state === "critical") {
      warnings.push("Pressure still advances if the critical node is not resolved this cycle.");
    }

    return {
      action,
      targetId: target.id,
      targetLabel: target.label,
      allowed: true,
      summary: `Reveal ${target.label}. Hidden risk estimated ${formatDelta(-hiddenRiskReduction)} with no direct repair.`,
      energyCost: 1,
      cooldown: 1,
      targetPressureDelta,
      targetIntegrityDelta,
      cascadeRiskDelta,
      advisorEffects,
      affectedNodes,
      warnings,
      guidanceNextNodeId: null,
      guidancePathNodeIds: [],
    };
  }

  if (action === "reroute") {
    const transfer = target.observed ? 5 : 8;
    const targetPressureDelta = -22;
    const targetIntegrityDelta = 0;
    const cascadeRiskDelta = -4;

    for (const connectedId of target.connections) {
      const connected = getNode(previewGame, connectedId);
      if (!connected) continue;

      affectedNodes.push({
        nodeId: connected.id,
        label: connected.label,
        pressureDelta: transfer,
        integrityDelta: 0,
        note: `Receives shifted load ${formatDelta(transfer)} pressure.`,
      });
    }

    advisorEffects.push(
      {
        id: "ops",
        trustDelta: 6,
        confidenceDelta: 5,
        note: "Flow pressure is relieved.",
      },
      {
        id: "nexus",
        trustDelta: target.observed ? 2 : -4,
        confidenceDelta: target.observed ? 2 : -2,
        note: target.observed
          ? "Dependency impact is understood."
          : "Reroute uses unresolved dependency risk.",
      }
    );

    if (!target.observed) {
      warnings.push("Rerouting an unobserved node may overload hidden dependencies.");
    }

    if (target.connections.some((id) => getNode(previewGame, id)?.state === "warning")) {
      warnings.push("At least one connected warning node may cross threshold after transfer.");
    }

    return {
      action,
      targetId: target.id,
      targetLabel: target.label,
      allowed: true,
      summary: `Relieve ${target.label} pressure, but transfer load into connected paths.`,
      energyCost: 1,
      cooldown: 2,
      targetPressureDelta,
      targetIntegrityDelta,
      cascadeRiskDelta,
      advisorEffects,
      affectedNodes,
      warnings,
      guidanceNextNodeId: null,
      guidancePathNodeIds: [],
    };
  }

  const reckless = !target.observed && target.hiddenRisk > 60;
  const targetPressureDelta = reckless ? -6 : -16;
  const targetIntegrityDelta = reckless ? 10 : 24;
  const cascadeRiskDelta = reckless ? 12 : -6;

  advisorEffects.push(
    reckless
      ? {
          id: "risk",
          trustDelta: -7,
          confidenceDelta: -5,
          note: "Direct repair before confirmation reduces trust.",
        }
      : {
          id: "risk",
          trustDelta: 6,
          confidenceDelta: 5,
          note: "Confirmed instability is reduced.",
        },
    reckless
      ? {
          id: "nexus",
          trustDelta: -4,
          confidenceDelta: -3,
          note: "Blind intervention stresses coherence.",
        }
      : {
          id: "ops",
          trustDelta: 2,
          confidenceDelta: 1,
          note: "Node capacity improves.",
        }
  );

  if (reckless) {
    warnings.push("High hidden risk: stabilizing now may spike cascade risk.");
  }

  if (target.state !== "critical" && target.state !== "warning") {
    warnings.push("Stabilize is less efficient on non-warning/non-critical nodes.");
  }

  return {
    action,
    targetId: target.id,
    targetLabel: target.label,
    allowed: true,
    summary: reckless
      ? `Force repair ${target.label}, but hidden risk may convert into cascade pressure.`
      : `Repair ${target.label} and reduce immediate instability.`,
    energyCost: 1,
    cooldown: 2,
    targetPressureDelta,
    targetIntegrityDelta,
    cascadeRiskDelta,
    advisorEffects,
    affectedNodes,
    warnings,
    guidanceNextNodeId: null,
    guidancePathNodeIds: [],
  };
}
