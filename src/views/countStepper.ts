import { ranges, type InputField, type PayoutViewModel } from "../viewModel/payoutViewModel";
import { icons } from "./icons";

const repeatDelay = 400;
const repeatInterval = 80;

export interface CountStepperOptions {
  field: InputField;
  title: string;
  icon: string;
  viewModel: PayoutViewModel;
  /** Where Enter moves focus; `null` for the last field, which closes the keyboard. */
  next: () => HTMLInputElement | null;
}

export interface CountStepper {
  element: HTMLElement;
  input: HTMLInputElement;
}

/** A −/+ stepper whose number can also be tapped and typed. */
export function createCountStepper(options: CountStepperOptions): CountStepper {
  const { field, title, icon, viewModel, next } = options;
  const range = ranges[field];
  const inputId = `input-${field}`;

  const row = document.createElement("div");
  row.className = "row stepper";
  row.innerHTML = `
    <label class="row-label" for="${inputId}">
      <span class="row-icon">${icon}</span>${title}
    </label>
    <div class="stepper-controls">
      <button type="button" class="step-button" data-delta="-1" aria-label="Decrease ${title}">${icons.minus}</button>
      <input id="${inputId}" class="count-input" type="text" inputmode="numeric" pattern="[0-9]*"
             autocomplete="off" maxlength="3" placeholder="0" aria-label="${title}">
      <button type="button" class="step-button" data-delta="1" aria-label="Increase ${title}">${icons.plus}</button>
    </div>`;

  const input = row.querySelector<HTMLInputElement>("input")!;
  const [decrease, increase] = row.querySelectorAll<HTMLButtonElement>(".step-button");

  const display = (value: number) => String(value);

  // MARK: Buttons (tap, or hold to repeat)

  for (const button of [decrease, increase]) {
    const delta = Number(button.dataset.delta);
    let timer: number | undefined;

    const step = () => viewModel.set(field, viewModel.get(field) + delta);
    const stop = () => {
      window.clearTimeout(timer);
      window.clearInterval(timer);
      timer = undefined;
    };

    button.addEventListener("pointerdown", (event) => {
      if (button.disabled || event.button !== 0) return;
      step();
      timer = window.setTimeout(() => {
        timer = window.setInterval(() => (button.disabled ? stop() : step()), repeatInterval);
      }, repeatDelay);
    });
    for (const type of ["pointerup", "pointerleave", "pointercancel"]) {
      button.addEventListener(type, stop);
    }
    // Keyboard activation (Enter/Space) reports detail 0; pointer taps already stepped.
    button.addEventListener("click", (event) => {
      if (event.detail === 0) step();
    });
  }

  // MARK: Text ↔ value

  input.addEventListener("input", () => {
    const digits = input.value.replace(/[^0-9]/g, "").slice(0, 3);
    if (digits !== input.value) input.value = digits;
    viewModel.set(field, digits === "" ? range.min : Number(digits));
    // Clamping may have changed the value without a change event, e.g. typing 99 players.
    syncText();
  });

  input.addEventListener("focus", () => input.select());

  // Tidy the field when editing ends (e.g. empty → "0").
  input.addEventListener("blur", () => {
    input.value = display(viewModel.get(field));
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const target = next();
    if (target) target.focus();
    else input.blur();
  });

  /**
   * Updates the text only when it no longer matches the value
   * (button taps, clamping, reset), so typing isn't interrupted.
   * An empty field counts as the lower bound.
   */
  function syncText() {
    const value = viewModel.get(field);
    const typed = input.value === "" ? range.min : Number(input.value);
    if (typed !== value) input.value = display(value);
  }

  function update() {
    const value = viewModel.get(field);
    syncText();
    decrease.disabled = value <= range.min;
    increase.disabled = value >= range.max;
  }

  input.value = display(viewModel.get(field));
  update();
  viewModel.subscribe(update);

  return { element: row, input };
}
