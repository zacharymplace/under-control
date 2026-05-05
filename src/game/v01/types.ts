export type NodeState =
  | "stable"
  | "active"
  | "warning"
  | "critical"
  | "unknown"
  | "suppressed";

export type PlayerActionType = "observe" | "reroute" | "stabilize";

export type AdvisorId = "risk" | "ops" | "nexus";

export type AdvisorState =
  | "aligned"
  | "cautious"
  | "disagreeing"
  | "low_trust"
  | "high_confidence"
  | "speaking";

export type EventTone = "neutral" | "good" | "warning" | "critical";

export type SystemNode = {
  id: string;
  label: string;
  state: NodeState;
  pressure: number;
  volatility: number;
  integrity: number;
  hiddenRisk: number;
  connections: string[];
  observed: boolean;
  ignoredCriticalCycles: number;
  x: number;
  y: number;
  lastAction?: PlayerActionType;
};

export type Advisor = {
  id: AdvisorId;
  name: string;
  trust: number;
  confidence: number;
  state: AdvisorState;
  recommendation: string;
};

export type EventLogEntry = {
  cycle: number;
  tone: EventTone;
  message: string;
};

export type GameStatus = "running" | "won" | "lost";

export type GameState = {
  cycle: number;
  maxCycles: number;
  integrity: number;
  pressure: number;
  cascadeRisk: number;
  cascadeBreaches: number;
  energy: number;
  operatorNodeId: string;
  selectedNodeId: string | null;
  nodes: SystemNode[];
  advisors: Advisor[];
  actionCooldowns: Record<PlayerActionType, number>;
  currentPriority: string;
  status: GameStatus;
  recklessActions: number;
  observedBeforeCriticalAction: number;
  unresolvedCriticalCycles: number;
  events: EventLogEntry[];
};

export type GameAction =
  | { type: "select_node"; nodeId: string }
  | { type: "move_operator"; nodeId: string }
  | { type: "perform_action"; action: PlayerActionType }
  | { type: "advance_cycle" }
  | { type: "reset" };
