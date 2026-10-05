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
    expect(vm.canClear).toBe(false);
    expect(calls).toBe(2);
  });
});

describe("rounding toggle", () => {
  const twelvePlayers = () => {
    const vm = new PayoutViewModel();
    vm.set("players", 12);
    vm.set("points", 14); // $60 / 14 = $4.29, nearest rounds down
    vm.set("birdies", 5); // $24 / 5 = $4.80, nearest rounds up
    return vm;
  };

  test("flips each pool away from nearest and back", () => {
    const vm = twelvePlayers();
    vm.toggleRounding("points");
    expect(vm.result?.points.valuePerUnit).toBe(5);
    expect(vm.result?.points.rounded).toBe("up");
    vm.toggleRounding("points");
    expect(vm.result?.points.valuePerUnit).toBe(4);

    vm.toggleRounding("birdies");
    expect(vm.result?.birdies.valuePerUnit).toBe(4);
    expect(vm.result?.birdies.rounded).toBe("down");
  });

  test("pools toggle independently", () => {
    const vm = twelvePlayers();
    vm.toggleRounding("points");
    expect(vm.result?.points.rounded).toBe("up");
    expect(vm.result?.birdies.rounded).toBe("up"); // still nearest
  });

  test("does nothing when there is no choice", () => {
    const vm = twelvePlayers();
    vm.set("birdies", 4); // $24 / 4 = $6 exactly
    let calls = 0;
    vm.subscribe(() => calls++);
    vm.toggleRounding("birdies");
    expect(calls).toBe(0);
    expect(vm.result?.birdies.valuePerUnit).toBe(6);
  });

  test("choice survives input changes until clear", () => {
    const vm = twelvePlayers();
    vm.toggleRounding("points"); // now rounding up
    vm.set("points", 13); // $60 / 13 = $4.62
    expect(vm.result?.points.valuePerUnit).toBe(5);
    vm.set("points", 11); // $60 / 11 = $5.45, nearest would give $5
    expect(vm.result?.points.valuePerUnit).toBe(6);

    vm.reset();
    vm.set("players", 12);
    vm.set("points", 14);
    expect(vm.result?.points.valuePerUnit).toBe(4); // back to nearest
  });

  test("clear stays available while a rounding choice is set", () => {
    const vm = twelvePlayers();
    vm.toggleRounding("points");
    // Zero every count by hand: the choice is still stored, so Clear must stay usable.
    vm.set("players", 0);
    vm.set("points", 0);
    vm.set("birdies", 0);
    expect(vm.canClear).toBe(true);

    vm.reset();
    expect(vm.canClear).toBe(false);
    vm.set("players", 12);
    vm.set("points", 14);
    expect(vm.result?.points.valuePerUnit).toBe(4); // nearest again
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
