import { standardRules, type GameRules } from "./gameRules";
import { nearestRounding, type PoolResult, type PoolRounding, type Rounding, type WeeklyPayout } from "./poolResult";

/** Minimum whole-dollar value per point or birdie when count > 0. */
export const minimumValuePerUnit = 1;

/**
 * Splits a pool evenly per unit, rounded to whole dollars with a $1 minimum.
 * `nearest` (the standard rule) rounds halves up; `up` and `down` force a direction.
 * A count of 0 sends the whole pool to the kitty.
 */
export function pool(amount: number, count: number, rounding: Rounding = "nearest"): PoolResult {
  if (count <= 0) {
    return {
      poolAmount: amount,
      count: 0,
      rawValuePerUnit: null,
      valuePerUnit: 0,
      payout: 0,
      kittyAdjustment: amount,
      rounded: null,
    };
  }

  // Integer math throughout. Math.floor stands in for Swift's truncating Int
  // division (inputs are never negative, so the two agree).
  const down = Math.max(minimumValuePerUnit, Math.floor(amount / count));
  const up = Math.max(minimumValuePerUnit, Math.floor((amount + count - 1) / count));
  const nearest = Math.max(minimumValuePerUnit, Math.floor((2 * amount + count) / (2 * count)));

  const value = rounding === "up" ? up : rounding === "down" ? down : nearest;
  const payout = value * count;

  return {
    poolAmount: amount,
    count,
    rawValuePerUnit: amount / count,
    valuePerUnit: value,
    payout,
    kittyAdjustment: amount - payout,
    rounded: up === down ? null : value === up ? "up" : "down",
  };
}

export function weeklyPayout(
  players: number,
  points: number,
  birdies: number,
  rules: GameRules = standardRules,
  rounding: PoolRounding = nearestRounding,
): WeeklyPayout {
  const pointsPool = pool(players * rules.pointsPerPlayer, points, rounding.points);
  const birdiesPool = pool(players * rules.birdiesPerPlayer, birdies, rounding.birdies);

  return {
    players,
    points: pointsPool,
    birdies: birdiesPool,
    totalPot: pointsPool.poolAmount + birdiesPool.poolAmount,
    totalPayout: pointsPool.payout + birdiesPool.payout,
    netKittyChange: pointsPool.kittyAdjustment + birdiesPool.kittyAdjustment,
  };
}
