// Result sections. Every value here is a number formatted by the view model or a
// fixed string, so building them as HTML strings is safe.

import type { PoolResult, WeeklyPayout } from "../models/poolResult";
import { dollars, exactDollarsText, kittyDescription, type PoolName } from "../viewModel/payoutViewModel";
import { icons } from "./icons";

export function sectionHeader(title: string, icon: string): string {
  return `<h2 class="section-header"><span class="row-icon">${icon}</span>${title}</h2>`;
}

function row(label: string, value: string): string {
  return `<div class="row"><span class="row-label">${label}</span><span class="row-value">${value}</span></div>`;
}

/** Capsule showing whether money goes into or comes out of the kitty. */
export function kittyBadge(adjustment: number): string {
  const [tone, icon] =
    adjustment > 0 ? ["in", icons.arrowUpCircle]
    : adjustment < 0 ? ["out", icons.arrowDownCircle]
    : ["none", icons.equalCircle];
  return `<span class="kitty-badge kitty-${tone}">${icon}${kittyDescription(adjustment)}</span>`;
}

export function potSection(result: WeeklyPayout, entryFee: number): string {
  return `
    <section class="card" aria-labelledby="pot-header">
      <div id="pot-header">${sectionHeader("Pot", icons.dollarCircle)}</div>
      <div class="rows">
        ${row(`${result.players} × ${dollars(entryFee)}`, `<strong class="total">${dollars(result.totalPot)}</strong>`)}
        ${row("Points pool", dollars(result.points.poolAmount))}
        ${row("Birdie pool", dollars(result.birdies.poolAmount))}
      </div>
    </section>`;
}

/**
 * Switches the pool to the other rounding direction. The label names the action, so it
 * reads "Round up" while the pay is rounded down. Colors match the kitty badge: rounding
 * up takes from the kitty (sand), rounding down gives to it (fairway).
 */
function roundingButton(pool: PoolName, unitName: string, rounded: "up" | "down"): string {
  const target = rounded === "up" ? "down" : "up";
  const icon = target === "up" ? icons.chevronUp : icons.chevronDown;
  const effect = target === "up" ? "takes from kitty" : "gives to kitty";
  return `<button type="button" class="round-button round-${target}" data-pool="${pool}"
            aria-label="Round pay per ${unitName} ${target}, ${effect}">${icon}Round ${target}</button>`;
}

/**
 * Breakdown for one pool. The pay figure is circled, like a birdie on a scorecard, and
 * has a rounding toggle beside it whenever rounding up and down give different amounts.
 */
export function poolSection(
  title: string,
  icon: string,
  unitName: string,
  pool: PoolName,
  result: PoolResult,
): string {
  const id = `${unitName}-header`;
  const details =
    result.count === 0
      ? row(`No ${unitName}s`, "Pool goes to kitty")
      : [
          row("Count", String(result.count)),
          result.rawValuePerUnit === null ? "" : row(`Exact per ${unitName}`, exactDollarsText(result.rawValuePerUnit)),
          row(
            `Pay per ${unitName}`,
            `<span class="pay-controls">
               ${result.rounded ? roundingButton(pool, unitName, result.rounded) : ""}
               <span class="pay-value">${dollars(result.valuePerUnit)}</span>
             </span>`,
          ),
          row("Total payout", dollars(result.payout)),
        ].join("");

  return `
    <section class="card" aria-labelledby="${id}">
      <div id="${id}">${sectionHeader(title, icon)}</div>
      <div class="rows">
        ${details}
        ${row("Kitty", kittyBadge(result.kittyAdjustment))}
      </div>
    </section>`;
}

export function kittySection(result: WeeklyPayout): string {
  return `
    <section class="card" aria-labelledby="kitty-header">
      <div id="kitty-header">${sectionHeader("Kitty", icons.banknote)}</div>
      <div class="rows">
        ${row("Total paid out", dollars(result.totalPayout))}
        ${row("Net kitty change", kittyBadge(result.netKittyChange))}
      </div>
    </section>`;
}

/** The single line screen readers hear after each change. */
export function announcement(result: WeeklyPayout): string {
  return `Net kitty change: ${kittyDescription(result.netKittyChange)}`;
}
