export type TelemetryState = {
  samples: number;
  pressureSum: number;
  peakLoad: number;
  peakDrift: number;
};

type TelemetryGameState = {
  load?: number;
  drift?: number;
  integrity?: number;
};

export function initTelemetry(): TelemetryState {
  return {
    samples: 0,
    pressureSum: 0,
    peakLoad: 0,
    peakDrift: 0,
  };
}

export function updateTelemetry(
  telemetry: TelemetryState,
  game: TelemetryGameState
): TelemetryState {
  const load = game.load ?? 0;
  const drift = game.drift ?? 0;
  const integrity = game.integrity ?? 100;

  const pressureScore =
    load * 0.5 + drift * 1.0 + (100 - integrity) * 0.4;

  return {
    samples: telemetry.samples + 1,
    pressureSum: telemetry.pressureSum + pressureScore,
    peakLoad: Math.max(telemetry.peakLoad, load),
    peakDrift: Math.max(telemetry.peakDrift, drift),
  };
}

export function summarizeTelemetry(telemetry: TelemetryState) {
  const avgPressure = telemetry.samples
    ? Math.round(telemetry.pressureSum / telemetry.samples)
    : 0;

  return {
    avgPressure,
    peakLoad: telemetry.peakLoad,
    peakDrift: telemetry.peakDrift,
  };
}
