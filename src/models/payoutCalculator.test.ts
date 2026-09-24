import { describe, expect, test } from "vitest";
import { pool, weeklyPayout } from "./payoutCalculator";

// Mirrors GolfPotTests/PayoutCalculatorTests.swift in the iOS app.
describe("payoutCalculator", () => {
  test("pools are split from player count", () => {
    const week = weeklyPayout(16, 10, 4);
    expect(week.points.poolAmount).toBe(80);
    expect(week.birdies.poolAmount).toBe(32);
    expect(week.totalPot).toBe(112);
  });

  test("rounds down and sends remainder to kitty", () => {
    // Real example: $60 pool, 14 points -> $4/point, $4 to kitty.
    const r = pool(60, 14);
    expect(r.valuePerUnit).toBe(4);
    expect(r.payout).toBe(56);
    expect(r.kittyAdjustment).toBe(4);
  });

  test("rounds up and takes from kitty", () => {
    const r = pool(60, 13); // $4.62
    expect(r.valuePerUnit).toBe(5);
    expect(r.payout).toBe(65);
    expect(r.kittyAdjustment).toBe(-5);
  });

  test("half dollar rounds up", () => {
    const r = pool(9, 2); // $4.50
    expect(r.valuePerUnit).toBe(5);
    expect(r.kittyAdjustment).toBe(-1);
  });

  test("exact split has no kitty change", () => {
    const r = pool(32, 4);
    expect(r.valuePerUnit).toBe(8);
    expect(r.kittyAdjustment).toBe(0);
  });

  test("zero count sends whole pool to kitty", () => {
    const r = pool(32, 0);
    expect(r.valuePerUnit).toBe(0);
    expect(r.payout).toBe(0);
    expect(r.kittyAdjustment).toBe(32);
    expect(r.rawValuePerUnit).toBeNull();
  });

  test("enforces one dollar minimum", () => {
    const r = pool(32, 80); // $0.40
    expect(r.valuePerUnit).toBe(1);
    expect(r.payout).toBe(80);
    expect(r.kittyAdjustment).toBe(-48);
  });

  test("net kitty combines both pools", () => {
    // 12 players: points $60 / 14 -> +$4, birdies $24 / 0 -> +$24
    const week = weeklyPayout(12, 14, 0);
    expect(week.netKittyChange).toBe(28);
  });
});
