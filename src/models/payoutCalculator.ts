import { standardRules, type GameRules } from "./gameRules";
import type { PoolResult, WeeklyPayout } from "./poolResult";

/** Minimum whole-dollar value per point or birdie when count > 0. */
export const minimumValuePerUnit = 1;

/**
 * Splits a pool evenly per unit, rounded to the nearest dollar (halves round up),
 * with a $1 minimum. A count of 0 sends the whole pool to the kitty.
 */
export function pool(amount: number, count: number): PoolResult {
  if (count <= 0) {
    return {
      poolAmount: amount,
      count: 0,
      rawValuePerUnit: null,
      valuePerUnit: 0,
      payout: 0,
      kittyAdjustment: amount,
    };
  }

  // Integer round-half-up of amount / count. Math.floor stands in for Swift's
  // truncating Int division (inputs are never negative, so the two agree).
  const rounded = Math.floor((2 * amount + count) / (2 * count));
  const value = Math.max(minimumValuePerUnit, rounded);
  const payout = value * count;

  return {
    poolAmount: amount,
    count,
    rawValuePerUnit: amount / count,
    valuePerUnit: value,
    payout,
    kittyAdjustment: amount - payout,
  };
}

export function weeklyPayout(
  players: number,
  points: number,
  birdies: number,
  rules: GameRules = standardRules,
): WeeklyPayout {
  const pointsPool = pool(players * rules.pointsPerPlayer, points);
  const birdiesPool = pool(players * rules.birdiesPerPlayer, birdies);

  return {
    players,
    points: pointsPool,
    birdies: birdiesPool,
    totalPot: pointsPool.poolAmount + birdiesPool.poolAmount,
    totalPayout: pointsPool.payout + birdiesPool.payout,
    netKittyChange: pointsPool.kittyAdjustment + birdiesPool.kittyAdjustment,
  };
}
