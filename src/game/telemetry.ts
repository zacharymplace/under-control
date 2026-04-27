export function initTelemetry() {
  return {
    samples: 0,
    pressureSum: 0,
    peakLoad: 0,
    peakDrift: 0,
  };
}

export function updateTelemetry(t: any, game: any) {
  const pressureScore =
    game.load * 0.5 + game.drift * 1.0 + (100 - game.integrity) * 0.4;

  return {
    samples: t.samples + 1,
    pressureSum: t.pressureSum + pressureScore,
    peakLoad: Math.max(t.peakLoad, game.load),
    peakDrift: Math.max(t.peakDrift, game.drift),
  };
}

export function summarizeTelemetry(t: any) {
  const avgPressure = t.samples ? Math.round(t.pressureSum / t.samples) : 0;

  return {
    avgPressure,
    peakLoad: t.peakLoad,
    peakDrift: t.peakDrift,
  };
}
