export type ScenarioId =
  | "guided_first_run"
  | "standard_control"
  | "signal_chaos"
  | "load_crisis"
  | "drift_collapse";

export type TutorialStep = {
  turn: number;
  title: string;
  body: string;
};

export type Scenario = {
  id: ScenarioId;
  label: string;
  opening: string;
  initialState: {
    eventTitle: string;
    eventSub: string;
    load: number;
    integrity: number;
    signalClarity: number;
    drift: number;
    driftVisible: boolean;
  };
  modifiers: {
    loadAcceleration?: number;
    driftMultiplier?: number;
    signalRecoveryMultiplier?: number;
  };
  tutorialSteps: TutorialStep[];
};

export const scenarios: Record<ScenarioId, Scenario> = {
  guided_first_run: {
    id: "guided_first_run",
    label: "First Watch",
    opening:
      "You have been handed control mid-incident. The system is not broken yet, but it will be if pressure is unmanaged.",
    initialState: {
      eventTitle: "First Watch",
      eventSub: "The system is viable, but pressure is already building",
      load: 62,
      integrity: 76,
      signalClarity: 48,
      drift: 8,
      driftVisible: false,
    },
    modifiers: {
      loadAcceleration: 1,
      driftMultiplier: 1,
      signalRecoveryMultiplier: 1,
    },
    tutorialSteps: [
      {
        turn: 1,
        title: "Read the system before acting",
        body:
          "Low signal means you do not fully understand the state yet. OBSERVE improves clarity, but pressure will keep moving.",
      },
      {
        turn: 2,
        title: "Every action trades one risk for another",
        body:
          "STABILIZE protects integrity and drift, but it usually lets load climb.",
      },
      {
        turn: 3,
        title: "Reroute is powerful, not free",
        body:
          "REROUTE releases load quickly, but it adds instability that can compound later.",
      },
      {
        turn: 5,
        title: "Coworkers are advisors, not answers",
        body:
          "Trust changes based on whether their advice helps within their domain.",
      },
    ],
  },

  standard_control: {
    id: "standard_control",
    label: "Standard Control",
    opening: "Maintain control through a balanced operating window.",
    initialState: {
      eventTitle: "Load Spike Detected",
      eventSub: "Signal confidence low",
      load: 68,
      integrity: 74,
      signalClarity: 46,
      drift: 10,
      driftVisible: false,
    },
    modifiers: {
      loadAcceleration: 1,
      driftMultiplier: 1,
      signalRecoveryMultiplier: 1,
    },
    tutorialSteps: [],
  },

  signal_chaos: {
    id: "signal_chaos",
    label: "Signal Chaos",
    opening:
      "The system is noisy. Information is unreliable, and waiting too long will create pressure.",
    initialState: {
      eventTitle: "Signal Chaos",
      eventSub: "Clarity is poor and pressure is rising",
      load: 64,
      integrity: 78,
      signalClarity: 28,
      drift: 12,
      driftVisible: true,
    },
    modifiers: {
      loadAcceleration: 1.1,
      driftMultiplier: 1,
      signalRecoveryMultiplier: 0.75,
    },
    tutorialSteps: [],
  },

  load_crisis: {
    id: "load_crisis",
    label: "Load Crisis",
    opening:
      "Capacity is already constrained. You need to create room before the system saturates.",
    initialState: {
      eventTitle: "Load Crisis",
      eventSub: "Capacity is narrowing",
      load: 82,
      integrity: 76,
      signalClarity: 58,
      drift: 10,
      driftVisible: true,
    },
    modifiers: {
      loadAcceleration: 1.35,
      driftMultiplier: 1,
      signalRecoveryMultiplier: 1,
    },
    tutorialSteps: [],
  },

  drift_collapse: {
    id: "drift_collapse",
    label: "Drift Collapse",
    opening:
      "Prior decisions left hidden instability in the system. Drift must be controlled early.",
    initialState: {
      eventTitle: "Drift Collapse",
      eventSub: "Instability is already present",
      load: 58,
      integrity: 70,
      signalClarity: 62,
      drift: 32,
      driftVisible: true,
    },
    modifiers: {
      loadAcceleration: 1,
      driftMultiplier: 1.4,
      signalRecoveryMultiplier: 1,
    },
    tutorialSteps: [],
  },
};

export function getScenario(id: ScenarioId) {
  return scenarios[id];
}
