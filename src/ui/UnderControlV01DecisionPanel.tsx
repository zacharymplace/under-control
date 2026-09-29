"use client";

import { useMemo, useReducer, useState } from "react";
import { createInitialGameState, scenarioCatalog } from "../game/v01/scenarios";
import { gameReducer } from "../game/v01/reducer";
import { getActionPreview, formatDelta } from "../game/v01/preview";
import type { Advisor, EventTone, GameState, NodeState, PlayerActionType, SystemNode } from "../game/v01/types";

const colors: Record<NodeState, string> = {
  stable: "var(--ink)",
  active: "var(--data)",
  warning: "var(--ink)",
  critical: "var(--ink)",
  unknown: "var(--rule-strong)",
  suppressed: "var(--ink-muted)",
};

const toneColors: Record<EventTone, string> = {
  neutral: "var(--ink-2)",
  good: "var(--ink)",
  warning: "var(--ink)",
  critical: "var(--ink)",
};

const actionCopy: Record<PlayerActionType, { label: string; detail: string; best: string }> = {
  observe: { label: "OBSERVE", detail: "Reveal hidden risk.", best: "Best before force." },
  reroute: { label: "REROUTE", detail: "Shift pressure flow.", best: "Best on warning." },
  stabilize: { label: "STABILIZE", detail: "Repair instability.", best: "Best after observe." },
};

function getAverageAdvisorTrust(game: GameState) {
  if (game.advisors.length === 0) return 0;

  return Math.round(
    game.advisors.reduce((sum, advisor) => sum + advisor.trust, 0) / game.advisors.length
  );
}

function deriveActionCountsFromEvents(game: GameState) {
  const fromState = game.actionCounts ?? {
    observe: 0,
    reroute: 0,
    stabilize: 0,
  };

  const stateTotal = fromState.observe + fromState.reroute + fromState.stabilize;

  if (stateTotal > 0) {
    return {
      observe: fromState.observe,
      reroute: fromState.reroute,
      stabilize: fromState.stabilize,
      total: stateTotal,
      source: "state" as const,
    };
  }

  const fromEvents = {
    observe: 0,
    reroute: 0,
    stabilize: 0,
  };

  for (const entry of game.events ?? []) {
    const message = entry.message.toLowerCase();

    if (message.startsWith("observed ")) fromEvents.observe += 1;
    if (message.startsWith("rerouted ")) fromEvents.reroute += 1;
    if (message.startsWith("stabilized ")) fromEvents.stabilize += 1;
  }

  return {
    observe: fromEvents.observe,
    reroute: fromEvents.reroute,
    stabilize: fromEvents.stabilize,
    total: fromEvents.observe + fromEvents.reroute + fromEvents.stabilize,
    source: "event_fallback" as const,
  };
}

function getOperatorProfile(game: GameState) {
  const counts = game.actionCounts;
  const totalActions = counts.observe + counts.reroute + counts.stabilize;
  const maxAction = Math.max(counts.observe, counts.reroute, counts.stabilize);
  const minAction = Math.min(counts.observe, counts.reroute, counts.stabilize);
  const observeShare = totalActions > 0 ? counts.observe / totalActions : 0;
  const rerouteShare = totalActions > 0 ? counts.reroute / totalActions : 0;
  const stabilizeShare = totalActions > 0 ? counts.stabilize / totalActions : 0;
  const lost = game.status === "lost";

  if (totalActions <= 2 && lost) {
    return {
      name: "Passive Containment",
      summary: "You preserved action discipline, but the system degraded faster than you intervened.",
    };
  }

  if (game.recklessActions >= 2) {
    return {
      name: lost ? "Overexposed Gambler" : "Gambler",
      summary: lost
        ? "You forced outcomes through hidden risk until the system could no longer absorb the volatility."
        : "You accepted hidden risk and forced outcomes before the system was fully understood.",
    };
  }

  if (totalActions >= 6 && maxAction - minAction <= 4 && counts.observe > 0 && counts.reroute > 0 && counts.stabilize > 0) {
    return {
      name: lost ? "Overloaded Architect" : "Architect",
      summary: lost
        ? "You used a balanced operating style, but the cascade outran the system before final stabilization."
        : "You balanced observation, flow control, and repair across the system.",
    };
  }

  if (stabilizeShare >= 0.45 && totalActions >= 4) {
    return {
      name: lost ? "Exhausted Firefighter" : "Firefighter",
      summary: lost
        ? "You fought visible failures directly, but too many critical nodes accumulated before recovery."
        : "You prioritized visible failures and direct repair under pressure.",
    };
  }

  if (observeShare >= 0.45 && totalActions >= 4) {
    return {
      name: lost ? "Delayed Analyst" : "Analyst",
      summary: lost
        ? "You gathered information and reduced hidden risk, but confirmation lagged behind the cascade."
        : "You favored information, confirmation, and hidden-risk reduction before intervention.",
    };
  }

  if (rerouteShare >= 0.45 && totalActions >= 4) {
    return {
      name: lost ? "Overloaded Flow Operator" : "Flow Operator",
      summary: lost
        ? "You managed pressure through routing, but transferred load eventually overwhelmed the network."
        : "You managed pressure through routing, capacity, and transfer discipline.",
    };
  }

  if (lost && game.cascadeRisk >= 80) {
    return {
      name: "Cascade Manager",
      summary: "You stayed active deep into the run, but cascading failures crossed the system's tolerance.",
    };
  }

  return {
    name: lost ? "Failed Containment Lead" : "Containment Lead",
    summary: lost
      ? "You intervened selectively, but the system crossed failure thresholds before stabilization."
      : "You kept the system inside survivable bounds through selective intervention.",
  };
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-muted)", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 0, background: "var(--paper-3)", overflow: "hidden" }}>
        <div
          style={{
            width: value + "%",
            height: "100%",
            background: value > 66 ? "var(--data)" : value > 40 ? "var(--spot)" : "var(--spot)",
          }}
        />
      </div>
    </div>
  );
}

function nodeUrgency(node: SystemNode) {
  if (node.state === "critical") return 4;
  if (node.state === "warning") return 3;
  if (node.state === "unknown") return 2;
  if (node.state === "active") return 1;
  return 0;
}

function findHardGuidedPath(nodes: SystemNode[], fromId: string, toId: string) {
  if (fromId === toId) return [fromId];

  const queue: string[][] = [[fromId]];
  const visited = new Set<string>([fromId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const currentId = path[path.length - 1];
    const current = nodes.find((node) => node.id === currentId);

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

function edgeKey(a: string, b: string) {
  return [a, b].sort().join("::");
}

function AdvisorCard({ advisor }: { advisor: Advisor }) {
  const active = advisor.state === "speaking";

  return (
    <div
      style={{
        border: "1px solid " + (active ? "var(--data)" : "var(--rule-strong)"),
        background: active ? "var(--data-tint)" : "var(--paper-2)",
        borderRadius: 0,
        padding: 12,
        boxShadow: "none",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 0,
            background: "var(--paper)",
            border: "1px solid var(--data)",
          }}
        />
        <div>
          <div style={{ color: "var(--ink)", letterSpacing: 1.6, fontSize: 13 }}>{advisor.name}</div>
          <div style={{ color: "var(--ink-muted)", fontSize: 11, textTransform: "uppercase" }}>
            {advisor.state.replace("_", " ")}
          </div>
        </div>
      </div>

      <p style={{ color: "var(--ink-2)", fontSize: 12, lineHeight: 1.35, minHeight: 34 }}>
        {advisor.recommendation}
      </p>

      <div style={{ display: "grid", gap: 6 }}>
        <Meter label="TRUST" value={advisor.trust} />
        <Meter label="CONF" value={advisor.confidence} />
      </div>
    </div>
  );
}

function ActionButton({
  action,
  cooldown,
  energy,
  selected,
  onPreview,
}: {
  action: PlayerActionType;
  cooldown: number;
  energy: number;
  selected: boolean;
  onPreview: () => void;
}) {
  const disabled = cooldown > 0 || energy < 1;
  const copy = actionCopy[action];

  return (
    <button
      type="button"
      onClick={onPreview}
      onPointerEnter={onPreview}
      onFocus={onPreview}
      style={{
        textAlign: "left",
        border:
          "1px solid " +
          (selected
            ? "var(--spot)"
            : disabled
              ? "var(--rule-strong)"
              : "var(--data)"),
        background: selected
          ? "var(--spot-tint)"
          : disabled
            ? "var(--paper-2)"
            : "var(--data-tint)",
        color: disabled ? "var(--ink-muted)" : "var(--ink)",
        borderRadius: 0,
        padding: "12px 14px",
        cursor: "pointer",
        boxShadow: "none",
      }}
    >
      <div style={{ fontSize: 15, letterSpacing: 1.8, marginBottom: 7 }}>{copy.label}</div>
      <div style={{ fontSize: 12, color: disabled ? "var(--ink-muted)" : "var(--ink-2)" }}>{copy.detail}</div>
      <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 8 }}>{copy.best}</div>
      <div style={{ display: "flex", gap: 10, marginTop: 10, fontSize: 11, color: "var(--ink-muted)" }}>
        <span>COST 1</span>
        <span>CD {cooldown}</span>
      </div>
    </button>
  );
}

function downloadRunTelemetry(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function NodeButton({
  node,
  selected,
  operator,
  inRange,
  previewTarget,
  previewAffected,
  previewAction,
  onSelect,
}: {
  node: SystemNode;
  selected: boolean;
  operator: boolean;
  inRange: boolean;
  previewTarget: boolean;
  previewAffected: boolean;
  previewAction: PlayerActionType;
  onSelect: () => void;
}) {
  const color = colors[node.state];
  const targetLabel =
    previewAction === "observe"
      ? "SCAN"
      : previewAction === "stabilize"
        ? "REPAIR"
        : "TARGET";
  const targetColor =
    previewAction === "observe"
      ? "var(--data)"
      : previewAction === "stabilize"
        ? "var(--ink)"
        : "var(--ink)";

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        position: "absolute",
        left: node.x + "%",
        top: node.y + "%",
        transform: "translate(-50%, -50%)",
        width: selected ? 86 : 74,
        height: selected ? 86 : 74,
        borderRadius: 0,
        border:
          "2px solid " +
          (previewTarget
            ? targetColor
            : selected
              ? "var(--ink)"
              : previewAffected
                ? "var(--spot)"
                : color),
        background: "var(--paper)",
        color: "var(--ink)",
        boxShadow: "none",
        cursor: "pointer",
        opacity: inRange || operator ? 1 : 0.64,
      }}
      title={node.label}
    >
      <span style={{ display: "block", margin: "0 auto 3px", width: 9, height: 9, borderRadius: 0, background: color, boxShadow: "none" }} />
      <span style={{ display: "block", fontSize: 10, letterSpacing: 1.1 }}>{node.label}</span>
      <span style={{ display: "block", color, fontSize: 9, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>
        {node.state}
      </span>
      {previewTarget && (
        <span
          style={{
            position: "absolute",
            inset: previewAction === "observe" ? -22 : -17,
            border:
              previewAction === "observe"
                ? "1px dashed " + targetColor
                : "1px solid " + targetColor,
            borderRadius: 0,
            opacity: 0.86,
          }}
        />
      )}
      {previewTarget && previewAction === "observe" && (
        <span
          style={{
            position: "absolute",
            inset: -31,
            border: "1px dotted var(--data)",
            borderRadius: 0,
            opacity: 0.74,
          }}
        />
      )}
      {previewTarget && previewAction === "stabilize" && (
        <span
          style={{
            position: "absolute",
            inset: -27,
            borderTop: "2px solid " + targetColor,
            borderBottom: "2px solid " + targetColor,
            borderLeft: "1px solid transparent",
            borderRight: "1px solid transparent",
            borderRadius: 0,
            opacity: 0.86,
          }}
        />
      )}
      {previewTarget && (
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: -20,
            transform: "translateX(-50%)",
            color: targetColor,
            fontSize: 9,
            letterSpacing: 1.2,
            whiteSpace: "nowrap",
          }}
        >
          {targetLabel}
        </span>
      )}
      {previewAffected && (
        <span
          style={{
            position: "absolute",
            left: "50%",
            bottom: -18,
            transform: "translateX(-50%)",
            color: "var(--ink)",
            fontSize: 9,
            letterSpacing: 1.1,
            whiteSpace: "nowrap",
          }}
        >
          +LOAD
        </span>
      )}
      {operator && (
        <span style={{ position: "absolute", inset: -13, border: "1px dashed var(--ink)", borderRadius: 0 }} />
      )}
    </button>
  );
}

export function UnderControlV01DecisionPanel() {
  const [selectedScenarioId, setSelectedScenarioId] = useState("baseline_degraded");
  const [game, dispatch] = useReducer(gameReducer, createInitialGameState("baseline_degraded"));
  const [previewAction, setPreviewAction] = useState<PlayerActionType>("reroute");

  const operatorNode = game.nodes.find((node) => node.id === game.operatorNodeId)!;
  const selectedNode = game.nodes.find((node) => node.id === game.selectedNodeId) ?? operatorNode;

  const actionPreview = useMemo(
    () => getActionPreview(game, previewAction, selectedNode.id),
    [game, previewAction, selectedNode.id]
  );

  const previewAffectedNodeIds = useMemo(() => {
    return new Set(actionPreview.affectedNodes.map((node) => node.nodeId));
  }, [actionPreview]);

  const previewRouteKeys = useMemo(() => {
    if (actionPreview.action !== "reroute" || !actionPreview.targetId) {
      return new Set<string>();
    }

    return new Set(
      actionPreview.affectedNodes.map((node) => edgeKey(actionPreview.targetId!, node.nodeId))
    );
  }, [actionPreview]);

  const previewTargetId = actionPreview.targetId;

  const inRangeIds = useMemo(() => new Set([operatorNode.id, ...operatorNode.connections]), [operatorNode]);

  const hardGuidedPathNodeIds = useMemo(() => {
    const isBlockedByRange =
      !actionPreview.allowed &&
      (actionPreview.reason === "Target is outside operator range." ||
        actionPreview.summary.includes("outside operator range"));

    if (!isBlockedByRange || !actionPreview.targetId) {
      return [];
    }

    return findHardGuidedPath(game.nodes, game.operatorNodeId, actionPreview.targetId);
  }, [
    actionPreview.allowed,
    actionPreview.reason,
    actionPreview.summary,
    actionPreview.targetId,
    game.nodes,
    game.operatorNodeId,
  ]);

  const hardGuidedFromNode =
    hardGuidedPathNodeIds.length >= 2
      ? game.nodes.find((node) => node.id === hardGuidedPathNodeIds[0]) ?? null
      : null;

  const hardGuidedNextNode =
    hardGuidedPathNodeIds.length >= 2
      ? game.nodes.find((node) => node.id === hardGuidedPathNodeIds[1]) ?? null
      : null;

  const effectiveActionCounts = deriveActionCountsFromEvents(game);

  const score =
    game.integrity * 10 +
    Math.round(game.advisors.reduce((sum, advisor) => sum + advisor.trust, 0) / 3) * 5 -
    game.cascadeRisk * 4 -
    game.recklessActions * 25 +
    game.observedBeforeCriticalAction * 20;

  const operatorProfile = getOperatorProfile(game);
  const averageAdvisorTrust = getAverageAdvisorTrust(game);
  const totalActions = effectiveActionCounts.total;

  const runTelemetry = useMemo(() => {
    return {
      schemaVersion: "under-control.playtest-run.v0.1",
      exportedAt: new Date().toISOString(),
      route: "/playable-v01",
      scenario: {
        id: game.scenarioId,
        label: game.scenarioLabel,
      },
      status: game.status,
      cycleReached: game.cycle,
      cyclesSurvived: Math.max(1, game.cycle - 1),
      maxCycles: game.maxCycles,
      score,
      operatorProfile,
      finalState: {
        integrity: game.integrity,
        pressure: game.pressure,
        cascadeRisk: game.cascadeRisk,
        cascadeBreaches: game.cascadeBreaches,
        energy: game.energy,
      },
      actions: {
        total: totalActions,
        observe: effectiveActionCounts.observe,
        reroute: effectiveActionCounts.reroute,
        stabilize: effectiveActionCounts.stabilize,
        reckless: game.recklessActions,
        observedBeforeCriticalAction: game.observedBeforeCriticalAction,
      },
      advisors: game.advisors.map((advisor) => ({
        id: advisor.id,
        name: advisor.name,
        trust: advisor.trust,
        confidence: advisor.confidence,
        state: advisor.state,
        recommendation: advisor.recommendation,
      })),
      nodes: game.nodes.map((node) => ({
        id: node.id,
        label: node.label,
        state: node.state,
        pressure: node.pressure,
        volatility: node.volatility,
        integrity: node.integrity,
        hiddenRisk: node.hiddenRisk,
        observed: node.observed,
        ignoredCriticalCycles: node.ignoredCriticalCycles,
        lastAction: node.lastAction ?? null,
      })),
      events: game.events,
    };
  }, [game, operatorProfile, score, totalActions, effectiveActionCounts.observe, effectiveActionCounts.reroute, effectiveActionCounts.stabilize]);

  const telemetryFilename =
    "under-control-run-" +
    game.status +
    "-cycle-" +
    game.cycle +
    "-score-" +
    score +
    ".json";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--paper)",
        color: "var(--ink)",
        padding: 12,
        fontFamily: "var(--font-body)",
      }}
    >
      <section style={{ maxWidth: 1480, margin: "0 auto", display: "grid", gridTemplateRows: "auto 1fr auto", gap: 10 }}>
        <header style={{ border: "1px solid var(--rule-strong)", background: "var(--paper)", borderRadius: 0, padding: "12px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 18 }}>
            <div style={{ color: "var(--ink-muted)", fontSize: 12, letterSpacing: 1.4 }}>CYCLE {game.cycle}/{game.maxCycles}</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, letterSpacing: 5 }}>UNDER CONTROL</div>
              <div style={{ color: "var(--ink)", fontSize: 12, letterSpacing: 2, marginTop: 4 }}>
                {game.status === "running" ? (game.cascadeRisk > 68 ? "UNSTABLE" : game.pressure > 50 ? "DEGRADED" : "STABLE") : game.status.toUpperCase()}
              </div>
            </div>
            <div style={{ textAlign: "right", color: "var(--ink-muted)", fontSize: 12 }}>
              <div>SCORE {score}</div>
              <a
                href="/playtest-runs"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  border: "1px solid var(--spot)",
                  background: "var(--spot-tint)",
                  color: "var(--ink)",
                  borderRadius: 0,
                  padding: "7px 8px",
                  textDecoration: "none",
                  fontSize: 11,
                  letterSpacing: 1.1,
                }}
              >
                RUN LAB
              </a>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <select
                  value={selectedScenarioId}
                  onChange={(event) => setSelectedScenarioId(event.currentTarget.value)}
                  style={{
                    border: "1px solid var(--rule-strong)",
                    background: "var(--paper-2)",
                    color: "var(--ink-2)",
                    borderRadius: 0,
                    padding: "7px 8px",
                    fontSize: 11,
                  }}
                >
                  {scenarioCatalog.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => dispatch({ type: "reset", scenarioId: selectedScenarioId })}
                  style={{
                    border: "1px solid var(--data)",
                    background: "var(--data-tint)",
                    color: "var(--ink)",
                    borderRadius: 0,
                    padding: "7px 8px",
                    cursor: "pointer",
                    fontSize: 11,
                    letterSpacing: 1.1,
                  }}
                >
                  START
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <Meter label="PRESSURE" value={game.pressure} />
          </div>

          <div style={{ marginTop: 10, border: "1px solid var(--spot)", background: "var(--spot-tint)", borderRadius: 0, padding: "10px 12px", color: "var(--ink)", fontSize: 13 }}>
            <strong style={{ letterSpacing: 1.3 }}>{game.scenarioLabel} / CURRENT PRIORITY:</strong>{" "}
            {game.currentPriority}
          </div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "260px 1fr 270px", gap: 14, minHeight: 560 }}>
          <aside style={{ border: "1px solid var(--rule-strong)", background: "var(--paper)", borderRadius: 0, padding: 12, display: "grid", gap: 12, alignContent: "start" }}>
            <div style={{ color: "var(--ink)", letterSpacing: 2, fontSize: 13 }}>ADVISORS</div>
            {game.advisors.map((advisor) => (
              <AdvisorCard advisor={advisor} key={advisor.id} />
            ))}
          </aside>

          <section style={{ position: "relative", border: "1px solid var(--rule-strong)", background: "var(--paper)", borderRadius: 0, overflow: "hidden", minHeight: 560 }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.78 }}>
              {game.nodes.flatMap((node) =>
                node.connections
                  .filter((targetId) => node.id < targetId)
                  .map((targetId) => {
                    const target = game.nodes.find((item) => item.id === targetId)!;
                    const hot = node.state === "critical" || target.state === "critical" || node.state === "warning" || target.state === "warning";
                    const previewedRoute = previewRouteKeys.has(edgeKey(node.id, target.id));

                    return (
                      <line
                        key={node.id + "-" + target.id}
                        x1={node.x}
                        y1={node.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={
                          previewedRoute
                            ? "var(--spot)"
                            : hot
                              ? "var(--spot)"
                              : "var(--data)"
                        }
                        strokeWidth={previewedRoute ? 0.72 : hot ? 0.42 : 0.28}
                        strokeDasharray={previewedRoute ? "1.4 0.9" : undefined}
                      />
                    );
                  })
              )}
            </svg>

            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                maskImage: "radial-gradient(circle at center, black, transparent 82%)",
              }}
            />

            {hardGuidedFromNode && hardGuidedNextNode && (
              <svg
                data-hard-guided-route-overlay="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  zIndex: 6,
                }}
              >
                <line
                  x1={hardGuidedFromNode.x}
                  y1={hardGuidedFromNode.y}
                  x2={hardGuidedNextNode.x}
                  y2={hardGuidedNextNode.y}
                  stroke="var(--data)"
                  strokeWidth={0.95}
                  strokeDasharray="1.2 1"
                  
                />
              </svg>
            )}

            {hardGuidedNextNode && (
              <div
                data-hard-guided-next-node="true"
                style={{
                  position: "absolute",
                  left: hardGuidedNextNode.x + "%",
                  top: hardGuidedNextNode.y + "%",
                  transform: "translate(-50%, -50%)",
                  width: 112,
                  height: 112,
                  border: "1px dashed var(--data)",
                  borderRadius: 0,
                  boxShadow: "none",
                  pointerEvents: "none",
                  zIndex: 7,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -24,
                    transform: "translateX(-50%)",
                    color: "var(--data)",
                    fontSize: 9,
                    letterSpacing: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  NEXT MOVE
                </div>
              </div>
            )}

            {game.nodes.map((node) => (
              <NodeButton
                key={node.id}
                node={node}
                selected={selectedNode.id === node.id}
                operator={operatorNode.id === node.id}
                inRange={inRangeIds.has(node.id)}
                previewTarget={previewTargetId === node.id}
                previewAffected={previewAction === "reroute" && previewAffectedNodeIds.has(node.id)}
                previewAction={previewAction}
                onSelect={() => dispatch({ type: "select_node", nodeId: node.id })}
              />
            ))}

            <div
              style={{
                position: "absolute",
                left: operatorNode.x + "%",
                top: operatorNode.y + "%",
                transform: "translate(-50%, -50%)",
                width: 22,
                height: 36,
                borderRadius: 0,
                background: "var(--paper)",
                boxShadow: "none",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: 18,
                bottom: 18,
                right: 18,
                border: "1px solid var(--rule-strong)",
                background: "var(--paper)",
                borderRadius: 0,
                padding: 12,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 14,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ color: colors[selectedNode.state], fontSize: 12, letterSpacing: 1.5 }}>
                  SELECTED NODE / {selectedNode.state.toUpperCase()}
                </div>
                <div style={{ fontSize: 18, marginTop: 4 }}>{selectedNode.label}</div>
                <div style={{ color: "var(--ink-muted)", fontSize: 12, marginTop: 6 }}>
                  Pressure {selectedNode.pressure}% · Integrity {selectedNode.integrity}% · Hidden risk {selectedNode.observed ? selectedNode.hiddenRisk + "%" : "unresolved"}
                </div>
                <div
                  style={{
                    color:
                      previewAction === "observe"
                        ? "var(--data)"
                        : previewAction === "stabilize"
                          ? "var(--ink)"
                          : "var(--ink)",
                    fontSize: 11,
                    letterSpacing: 1.2,
                    marginTop: 6,
                    textTransform: "uppercase",
                  }}
                >
                  Preview Mode: {previewAction}
                </div>
              </div>

              <button
                type="button"
                onClick={() => dispatch({ type: "move_operator", nodeId: selectedNode.id })}
                disabled={!inRangeIds.has(selectedNode.id) || operatorNode.id === selectedNode.id}
                style={{
                  border: "1px solid var(--data)",
                  background: !inRangeIds.has(selectedNode.id) || operatorNode.id === selectedNode.id ? "var(--paper-2)" : "var(--data-tint)",
                  color: !inRangeIds.has(selectedNode.id) || operatorNode.id === selectedNode.id ? "var(--ink-muted)" : "var(--ink)",
                  borderRadius: 0,
                  padding: "11px 14px",
                  cursor: !inRangeIds.has(selectedNode.id) || operatorNode.id === selectedNode.id ? "not-allowed" : "pointer",
                }}
              >
                MOVE TO NODE
              </button>
            </div>
          </section>

          <aside style={{ border: "1px solid var(--rule-strong)", background: "var(--paper)", borderRadius: 0, padding: 14, display: "grid", gap: 14, alignContent: "start" }}>
            <div style={{ color: "var(--ink)", letterSpacing: 2, fontSize: 13 }}>SYSTEM STATUS</div>

            <Meter label="INTEGRITY" value={game.integrity} />
            <Meter label="CASCADE" value={game.cascadeRisk} />
            <Meter label="ENERGY" value={game.energy * 50} />

            <div
              style={{
                border: "1px solid var(--rule-strong)",
                borderRadius: 0,
                padding: 12,
                background: "var(--paper-2)",
              }}
            >
              <div style={{ color: "var(--ink-muted)", fontSize: 11, letterSpacing: 1.4 }}>
                COMMITTED ACTIONS
              </div>
              <div style={{ color: "var(--ink)", fontSize: 20, marginTop: 6 }}>
                {totalActions}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                  color: "var(--ink-2)",
                  fontSize: 11,
                  marginTop: 8,
                }}
              >
                <span>OBS {effectiveActionCounts.observe}</span>
                <span>RER {effectiveActionCounts.reroute}</span>
                <span>STA {effectiveActionCounts.stabilize}</span>
              </div>
            </div>

            <div style={{ border: "1px solid var(--rule-strong)", borderRadius: 0, padding: 12, background: "var(--paper-2)" }}>
              <div style={{ color: "var(--ink-muted)", fontSize: 11, letterSpacing: 1.4 }}>ACTIVE THREATS</div>
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {game.nodes
                  .filter((node) => ["critical", "warning", "unknown"].includes(node.state))
                  .sort((a, b) => nodeUrgency(b) - nodeUrgency(a))
                  .slice(0, 4)
                  .map((node) => (
                    <div key={node.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, color: "var(--ink-2)", fontSize: 12 }}>
                      <span>{node.label}</span>
                      <span style={{ color: colors[node.state] }}>{node.state}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div style={{ border: "1px solid var(--rule-strong)", borderRadius: 0, padding: 12, background: "var(--paper-2)" }}>
              <div style={{ color: "var(--ink-muted)", fontSize: 11, letterSpacing: 1.4 }}>EVENT LOG</div>
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {game.events.map((entry, index) => (
                  <div key={entry.cycle + "-" + entry.message + "-" + index} style={{ color: toneColors[entry.tone], fontSize: 12, lineHeight: 1.35 }}>
                    C{entry.cycle}: {entry.message}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {game.status !== "running" && (
          <section
            style={{
              border: "1px solid var(--spot)",
              background:
                game.status === "won"
                  ? "var(--paper)"
                  : "var(--paper)",
              borderRadius: 0,
              padding: 16,
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr auto",
              gap: 16,
              alignItems: "center",
              boxShadow: "none",
            }}
          >
            <div>
              <div
                style={{
                  color: game.status === "won" ? "var(--ink)" : "var(--ink)",
                  fontSize: 12,
                  letterSpacing: 1.8,
                  textTransform: "uppercase",
                }}
              >
                RUN-END SUMMARY / {game.status.toUpperCase()}
              </div>
              <div style={{ fontSize: 22, marginTop: 6, letterSpacing: 1.4 }}>
                Operator Profile: {operatorProfile.name}
              </div>
              <div style={{ color: "var(--ink-2)", fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>
                {operatorProfile.summary}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                color: "var(--ink-2)",
                fontSize: 12,
              }}
            >
              <div>
                <div style={{ color: "var(--ink-muted)", fontSize: 10, letterSpacing: 1.2 }}>FINAL SCORE</div>
                <div style={{ color: "var(--ink)", fontSize: 18 }}>{score}</div>
              </div>
              <div>
                <div style={{ color: "var(--ink-muted)", fontSize: 10, letterSpacing: 1.2 }}>AVG TRUST</div>
                <div style={{ color: "var(--ink)", fontSize: 18 }}>{averageAdvisorTrust}%</div>
              </div>
              <div>
                <div style={{ color: "var(--ink-muted)", fontSize: 10, letterSpacing: 1.2 }}>INTEGRITY</div>
                <div style={{ color: "var(--ink)", fontSize: 18 }}>{game.integrity}%</div>
              </div>
              <div>
                <div style={{ color: "var(--ink-muted)", fontSize: 10, letterSpacing: 1.2 }}>CASCADE</div>
                <div style={{ color: "var(--ink)", fontSize: 18 }}>{game.cascadeRisk}%</div>
              </div>
              <div>
                <div style={{ color: "var(--ink-muted)", fontSize: 10, letterSpacing: 1.2 }}>COMMITTED</div>
                <div style={{ color: "var(--ink)", fontSize: 18 }}>{totalActions}</div>
              </div>
              <div>
                <div style={{ color: "var(--ink-muted)", fontSize: 10, letterSpacing: 1.2 }}>CYCLES SURVIVED</div>
                <div style={{ color: "var(--ink)", fontSize: 18 }}>{Math.max(1, game.cycle - 1)}</div>
              </div>
              <div>
                <div style={{ color: "var(--ink-muted)", fontSize: 10, letterSpacing: 1.2 }}>RECKLESS</div>
                <div style={{ color: "var(--ink)", fontSize: 18 }}>{game.recklessActions}</div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <button
                type="button"
                onClick={() => downloadRunTelemetry(telemetryFilename, runTelemetry)}
                style={{
                  border: "1px solid var(--data)",
                  background: "var(--data-tint)",
                  color: "var(--ink)",
                  borderRadius: 0,
                  padding: "12px 14px",
                  cursor: "pointer",
                  letterSpacing: 1.3,
                  fontSize: 12,
                }}
              >
                EXPORT RUN JSON
              </button>

              <button
                type="button"
                onClick={() => dispatch({ type: "reset", scenarioId: selectedScenarioId })}
                style={{
                  border: "1px solid var(--spot)",
                  background: "var(--spot-tint)",
                  color: "var(--ink)",
                  borderRadius: 0,
                  padding: "12px 14px",
                  cursor: "pointer",
                  letterSpacing: 1.3,
                  fontSize: 12,
                }}
              >
                RESET RUN
              </button>
            </div>
          </section>
        )}

        <footer
          style={{
            border: "1px solid var(--rule-strong)",
            background: "var(--paper)",
            borderRadius: 0,
            padding: 14,
            display: "grid",
            gridTemplateColumns: "0.8fr 0.8fr 0.8fr 1.45fr auto auto",
            gap: 12,
            alignItems: "stretch",
          }}
        >
          {(["observe", "reroute", "stabilize"] as PlayerActionType[]).map((action) => (
            <ActionButton
              key={action}
              action={action}
              cooldown={game.actionCooldowns[action]}
              energy={game.energy}
              selected={previewAction === action}
              onPreview={() => setPreviewAction(action)}
            />
          ))}

          <section
            style={{
              border: "1px solid " + (actionPreview.allowed ? "var(--data)" : "var(--spot)"),
              background: actionPreview.allowed ? "var(--data-tint)" : "var(--spot-tint)",
              borderRadius: 0,
              padding: 14,
              minWidth: 320,
            }}
          >
            <div style={{ color: actionPreview.allowed ? "var(--data)" : "var(--ink)", fontSize: 11, letterSpacing: 1.3, textTransform: "uppercase" }}>
              Decision Preview / {actionPreview.action}
            </div>

            <div style={{ color: "var(--ink)", fontSize: 13, marginTop: 6, lineHeight: 1.35 }}>
              <strong style={{ color: "var(--ink)" }}>Target:</strong> {selectedNode.label} · {actionPreview.summary}
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", color: "var(--ink-muted)", fontSize: 12, marginTop: 8 }}>
              <span>Pressure {formatDelta(actionPreview.targetPressureDelta)}</span>
              <span>Integrity {formatDelta(actionPreview.targetIntegrityDelta)}</span>
              <span>Cascade {formatDelta(actionPreview.cascadeRiskDelta)}</span>
              <span>Cost {actionPreview.energyCost}</span>
              <span>CD {actionPreview.cooldown}</span>
            </div>

            {actionPreview.advisorEffects.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", color: "var(--ink-2)", fontSize: 11, marginTop: 8 }}>
                {actionPreview.advisorEffects.map((effect) => (
                  <span key={effect.id + "-" + effect.note}>
                    {effect.id.toUpperCase()} trust {formatDelta(effect.trustDelta)}
                  </span>
                ))}
              </div>
            )}

            {actionPreview.affectedNodes.length > 0 && (
              <div style={{ color: "var(--ink-muted)", fontSize: 11, marginTop: 8 }}>
                Load transfer:{" "}
                {actionPreview.affectedNodes
                  .slice(0, 3)
                  .map((node) => node.label + " " + formatDelta(node.pressureDelta))
                  .join(" · ")}
              </div>
            )}

            {hardGuidedNextNode && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  color: "var(--data)",
                  fontSize: 11,
                  marginTop: 8,
                }}
              >
                <span>
                  Hard suggested next move: {hardGuidedNextNode.label}. Target focus will stay on{" "}
                  {actionPreview.targetLabel}.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const targetAfterMove = actionPreview.targetId;

                    dispatch({ type: "move_operator", nodeId: hardGuidedNextNode.id });

                    if (targetAfterMove) {
                      dispatch({ type: "select_node", nodeId: targetAfterMove });
                    }
                  }}
                  style={{
                    border: "1px solid var(--data)",
                    background: "var(--data-tint)",
                    color: "var(--ink)",
                    borderRadius: 0,
                    padding: "6px 8px",
                    cursor: "pointer",
                    fontSize: 10,
                    letterSpacing: 1.1,
                    whiteSpace: "nowrap",
                  }}
                >
                  MOVE TO {hardGuidedNextNode.label.toUpperCase()}
                </button>
              </div>
            )}

            {actionPreview.warnings.length > 0 && (
              <div style={{ color: "var(--ink)", fontSize: 11, marginTop: 8 }}>
                {actionPreview.warnings[0]}
              </div>
            )}

            <button
              type="button"
              disabled={!actionPreview.allowed}
              onClick={() => dispatch({ type: "perform_action", action: actionPreview.action })}
              style={{
                marginTop: 10,
                border: "1px solid " + (actionPreview.allowed ? "var(--spot)" : "var(--rule-strong)"),
                background: actionPreview.allowed ? "var(--spot-tint)" : "var(--paper-2)",
                color: actionPreview.allowed ? "var(--ink)" : "var(--ink-muted)",
                borderRadius: 0,
                padding: "8px 10px",
                cursor: actionPreview.allowed ? "pointer" : "not-allowed",
                letterSpacing: 1.2,
                fontSize: 11,
              }}
            >
              COMMIT {actionPreview.action.toUpperCase()}
            </button>
          </section>

          <button
            type="button"
            onClick={() => dispatch({ type: "advance_cycle" })}
            disabled={game.status !== "running"}
            style={{
              border: "1px solid var(--spot)",
              background: "var(--spot-tint)",
              color: game.status === "running" ? "var(--ink)" : "var(--ink-muted)",
              borderRadius: 0,
              padding: "0 18px",
              cursor: game.status === "running" ? "pointer" : "not-allowed",
              letterSpacing: 1.6,
            }}
          >
            ADVANCE CYCLE
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: "reset", scenarioId: selectedScenarioId })}
            style={{
              border: "1px solid var(--rule-strong)",
              background: "var(--paper-2)",
              color: "var(--ink-2)",
              borderRadius: 0,
              padding: "0 18px",
              cursor: "pointer",
              letterSpacing: 1.4,
            }}
          >
            RESET
          </button>
        </footer>
      </section>
    </main>
  );
}
