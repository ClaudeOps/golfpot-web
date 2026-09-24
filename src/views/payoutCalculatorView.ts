import type { PayoutViewModel } from "../viewModel/payoutViewModel";
import { createCountStepper, type CountStepper } from "./countStepper";
import { icons } from "./icons";
import { announcement, kittySection, poolSection, potSection, sectionHeader } from "./results";

/** The main screen: inputs on top, results below once there is a player. */
export function mountPayoutCalculator(root: HTMLElement, viewModel: PayoutViewModel): void {
  root.innerHTML = `
    <header class="top-bar">
      <h1>Weekly payout</h1>
      <button type="button" class="clear-button">Clear</button>
    </header>
    <main>
      <section class="card" aria-labelledby="inputs-header">
        <div id="inputs-header">${sectionHeader("This week", icons.calendar)}</div>
        <div class="rows" id="inputs"></div>
      </section>
      <p class="hint">Add players to see payouts. Tap a number to type it.</p>
      <div id="results"></div>
      <p class="visually-hidden" role="status" id="announcement"></p>
    </main>`;

  const inputs = root.querySelector<HTMLElement>("#inputs")!;
  const results = root.querySelector<HTMLElement>("#results")!;
  const status = root.querySelector<HTMLElement>("#announcement")!;
  const hint = root.querySelector<HTMLElement>(".hint")!;
  const clear = root.querySelector<HTMLButtonElement>(".clear-button")!;

  // Steppers are built once so typing and focus survive result updates.
  const steppers: CountStepper[] = [];
  const nextInput = (index: number) => () => steppers[index + 1]?.input ?? null;
  steppers.push(
    createCountStepper({ field: "players", title: "Players", icon: icons.golfer, viewModel, next: nextInput(0) }),
    createCountStepper({ field: "points", title: "Points", icon: icons.flag, viewModel, next: nextInput(1) }),
    createCountStepper({ field: "birdies", title: "Birdies", icon: icons.bird, viewModel, next: nextInput(2) }),
  );
  for (const stepper of steppers) {
    stepper.input.enterKeyHint = stepper === steppers.at(-1) ? "done" : "next";
    inputs.append(stepper.element);
  }

  clear.addEventListener("click", () => {
    (document.activeElement as HTMLElement | null)?.blur();
    viewModel.reset();
  });

  function render() {
    const result = viewModel.result;
    clear.disabled = !viewModel.hasInput;
    hint.hidden = result !== null;
    results.innerHTML = result
      ? potSection(result, viewModel.entryFee) +
        poolSection("Points", icons.flag, "point", result.points) +
        poolSection("Birdies", icons.bird, "birdie", result.birdies) +
        kittySection(result)
      : "";
    // Screen readers hear one short line per change, not every result section.
    // Only update when it differs, so an unchanged value isn't re-announced.
    const text = result ? announcement(result) : "";
    if (status.textContent !== text) status.textContent = text;
  }

  render();
  viewModel.subscribe(render);
}
