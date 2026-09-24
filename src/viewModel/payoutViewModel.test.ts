import { describe, expect, test } from "vitest";
import { PayoutViewModel, dollars, exactDollarsText, kittyDescription } from "./payoutViewModel";

describe("PayoutViewModel", () => {
  test("has no result until there is a player", () => {
    const vm = new PayoutViewModel();
    vm.set("points", 14);
    expect(vm.result).toBeNull();
    vm.set("players", 12);
    expect(vm.result?.points.valuePerUnit).toBe(4);
  });

  test("clamps inputs to their ranges", () => {
    const vm = new PayoutViewModel();
    vm.set("players", 500);
    vm.set("birdies", -3);
    expect(vm.get("players")).toBe(50);
    expect(vm.get("birdies")).toBe(0);
  });

  test("reset clears input and notifies", () => {
    const vm = new PayoutViewModel();
    let calls = 0;
    vm.subscribe(() => calls++);
    vm.set("players", 4);
    vm.reset();
    expect(vm.hasInput).toBe(false);
    expect(calls).toBe(2);
  });
});

describe("formatting", () => {
  test("whole and exact dollars", () => {
    expect(dollars(56)).toBe("$56");
    expect(exactDollarsText(60 / 14)).toBe("$4.29");
  });

  test("kitty wording", () => {
    expect(kittyDescription(4)).toBe("$4 to kitty");
    expect(kittyDescription(-5)).toBe("$5 from kitty");
    expect(kittyDescription(0)).toBe("No change");
  });
});
