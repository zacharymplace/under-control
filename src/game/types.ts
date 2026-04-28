import { AdvisorMemoryMap } from "./advisorMemory";

export type Game = {
  turn: number;
  state: string;
  pressure: string;
  scenarioId: any;

  load: number;
  signal?: number;
  signalClarity?: number;
  integrity: number;
  drift: number;

  personas?: any[];

  trust: Record<string, number>;
  ignoredCounts: Record<string, number>;

  feedback: string | null;
  reactions?: any[];

  actionHistory?: string[];

  advisorMemory?: AdvisorMemoryMap;

  playerTendency?: any;
  pointOfNoReturn?: any;
  interrupted?: boolean;
};
