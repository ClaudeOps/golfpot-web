import { entryFee, standardRules, type GameRules } from "../models/gameRules";
import { weeklyPayout } from "../models/payoutCalculator";
import type { WeeklyPayout } from "../models/poolResult";

export type InputField = "players" | "points" | "birdies";

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
    return weeklyPayout(players, points, birdies, this.rules);
  }

  get hasInput(): boolean {
    const { players, points, birdies } = this.values;
    return players !== 0 || points !== 0 || birdies !== 0;
  }

  reset(): void {
    this.values = { players: 0, points: 0, birdies: 0 };
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
