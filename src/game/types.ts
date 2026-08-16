/**
 * Legacy prototype compatibility types.
 *
 * v0.1 systems-arena types now live in src/game/v01/types.ts.
 * The existing home-page prototype still imports Game from "@/game/types".
 */
export type Game = Record<string, unknown>;
