export const TUNING = {
  TARGET_TURN: 25,

  // base decay
  BASE_LOAD: 3,
  BASE_DRIFT: 1,
  BASE_INTEGRITY_DECAY: 1,

  // phase multipliers
  EARLY: 1.0,
  MID: 1.35,
  LATE: 1.75,

  // failure thresholds
  MAX_LOAD: 100,
  MAX_DRIFT: 60,
  MIN_INTEGRITY: 20,
};
