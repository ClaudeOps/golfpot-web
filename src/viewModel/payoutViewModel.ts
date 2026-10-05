import { entryFee, standardRules, type GameRules } from "../models/gameRules";
import { weeklyPayout } from "../models/payoutCalculator";
import { nearestRounding, type PoolRounding, type WeeklyPayout } from "../models/poolResult";

export type InputField = "players" | "points" | "birdies";
export type PoolName = "points" | "birdies";

export interface Range {
  readonly min: number;
  readonly max: number;
}

export const playerRange: Range = { min: 0, max: 50 };
export const countRange: Range = { min: 0, max: 199 };

export const ranges: Record<InputField, Range> = {
  players: playerRange,
  points: countRange,
  birdies: countRange,
};

export function clamp(value: number, range: Range): number {
  return Math.min(Math.max(value, range.min), range.max);
}

/** Holds input state and derives the result. Views subscribe to be told when it changes. */
export class PayoutViewModel {
  private values: Record<InputField, number> = { players: 0, points: 0, birdies: 0 };
  /** Starts at nearest-dollar rounding; a toggle pins a pool to up or down until Clear. */
  private rounding: PoolRounding = nearestRounding;
  private listeners = new Set<() => void>();

  constructor(readonly rules: GameRules = standardRules) {}

  get(field: InputField): number {
    return this.values[field];
  }

  set(field: InputField, value: number): void {
    const next = clamp(value, ranges[field]);
    if (next === this.values[field]) return;
    this.values[field] = next;
    this.notify();
  }

  get entryFee(): number {
    return entryFee(this.rules);
  }

  /** `null` until there is at least one player. */
  get result(): WeeklyPayout | null {
    const { players, points, birdies } = this.values;
    if (players < 1) return null;
    return weeklyPayout(players, points, birdies, this.rules, this.rounding);
  }

  /**
   * Switches a pool to the other rounding direction: up (money from the kitty)
   * or down (money to the kitty). Does nothing when the pool has no choice to make.
   */
  toggleRounding(pool: PoolName): void {
    const current = this.result?.[pool].rounded;
    if (!current) return;
    this.rounding = { ...this.rounding, [pool]: current === "up" ? "down" : "up" };
    this.notify();
  }

  /**
   * Whether Clear has anything to reset: a non-zero count, or a pool pinned to
   * rounding up or down. The rounding check matters because a choice survives
   * counts being stepped back to 0, and would otherwise carry into the next week.
   */
  get canClear(): boolean {
    const { players, points, birdies } = this.values;
    const hasCounts = players !== 0 || points !== 0 || birdies !== 0;
    const hasRoundingChoice = this.rounding.points !== "nearest" || this.rounding.birdies !== "nearest";
    return hasCounts || hasRoundingChoice;
  }

  reset(): void {
    this.values = { players: 0, points: 0, birdies: 0 };
    this.rounding = nearestRounding;
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }
}

// MARK: Formatting

const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const exactDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

/** Whole-dollar amounts. */
export function dollars(amount: number): string {
  return wholeDollars.format(amount);
}

/** Exact amounts such as the raw value per unit, to the cent. */
export function exactDollarsText(amount: number): string {
  return exactDollars.format(amount);
}

export function kittyDescription(adjustment: number): string {
  if (adjustment > 0) return `${dollars(adjustment)} to kitty`;
  if (adjustment < 0) return `${dollars(-adjustment)} from kitty`;
  return "No change";
}
