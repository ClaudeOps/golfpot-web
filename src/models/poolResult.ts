/**
 * How a pool's value per unit is rounded to whole dollars.
 * `nearest` is the standard rule (halves round up). `up` takes money from the kitty;
 * `down` gives money to it.
 */
export type Rounding = "nearest" | "up" | "down";

/** Rounding for each pool in a week. */
export interface PoolRounding {
  readonly points: Rounding;
  readonly birdies: Rounding;
}

export const nearestRounding: PoolRounding = { points: "nearest", birdies: "nearest" };

/** The payout for a single pool (points or birdies). All money is whole dollars. */
export interface PoolResult {
  /** Total dollars in the pool before any kitty adjustment. */
  readonly poolAmount: number;
  /** Number of points or birdies being paid. */
  readonly count: number;
  /** Exact value per unit before rounding, for display only. `null` when count is 0. */
  readonly rawValuePerUnit: number | null;
  /** Whole-dollar value paid per unit after rounding and the $1 minimum. */
  readonly valuePerUnit: number;
  /** Total dollars paid out to players. */
  readonly payout: number;
  /** Positive: money goes into the kitty. Negative: money comes out of the kitty. */
  readonly kittyAdjustment: number;
  /**
   * Which way `valuePerUnit` was rounded. `null` when there is no choice to make:
   * an exact split, a value held at the $1 minimum either way, or a count of 0.
   */
  readonly rounded: "up" | "down" | null;
}

/** The complete result for one week. */
export interface WeeklyPayout {
  readonly players: number;
  readonly points: PoolResult;
  readonly birdies: PoolResult;
  readonly totalPot: number;
  readonly totalPayout: number;
  readonly netKittyChange: number;
}
