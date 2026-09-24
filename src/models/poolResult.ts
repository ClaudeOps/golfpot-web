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
