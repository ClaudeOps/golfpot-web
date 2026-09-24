# GolfPot (web)

Single-page web version of the GolfPot iOS app: a calculator for a weekly golf game's payouts. The admin enters the number of players, total points, and total birdies. The app splits the pot into two pools, pays each out per point/birdie in whole dollars, and reports how much goes into or comes out of the kitty.

The app is static and stateless: no backend, no persistence, no accounts. All math runs in the browser. It is hosted on Vercel and works offline after the first visit.

## Game rules (source of truth)

- Entry fee is $7 per player: **$5 to the points pool**, **$2 to the birdie pool**. These amounts live in `standardRules`.
- For each pool:
  - If count is 0, the payout is $0 and **the whole pool goes to the kitty**.
  - Otherwise, value per unit = pool ÷ count, **rounded to the nearest dollar, halves round up**, with a **$1 minimum**.
  - Payout = value per unit × count.
  - Kitty adjustment = pool − payout. Positive means money goes into the kitty; negative means it comes out.
- Net kitty change = the sum of both pools' adjustments.
- Reference case: $60 pool, 14 points → $4.29 → **$4 per point**, $56 paid, **$4 to kitty**.

Do not change these rules without being asked. If a change is requested, update `payoutCalculator.ts` and its tests together. The iOS app (`~/Projects/xcode/GolfPot`) implements the same rules; keep the two in step.

## Stack

- TypeScript (strict), Vite, Vitest. No UI framework, no runtime dependencies.
- Deployed on Vercel as a static site (`vercel.json`: `npm run build` → `dist/`).

## Commands

```sh
npm install
npm run dev       # local dev server
npm test          # unit tests (Vitest)
npm run build     # type-check, then production build into dist/
npm run preview   # serve the production build from dist/ (run build first; service worker active)
```

## Architecture: MVVM, mirroring the iOS app

```
index.html                    page shell, meta tags, manifest and icon links
src/
  main.ts                     entry point; mounts the view, registers the service worker (prod only)
  models/                     pure logic and types; no DOM access
    gameRules.ts              per-player pool amounts, entry fee
    poolResult.ts             PoolResult (one pool) and WeeklyPayout (whole week)
    payoutCalculator.ts       all payout math
    payoutCalculator.test.ts  mirrors the iOS PayoutCalculatorTests
  viewModel/
    payoutViewModel.ts        inputs, ranges, derived result, subscribe(), formatting helpers
    payoutViewModel.test.ts
  views/                      DOM only; no business logic
    payoutCalculatorView.ts   main screen
    countStepper.ts           −/+ stepper with tap-to-type number and hold-to-repeat
    results.ts                pot, pool and kitty sections; kitty badge
    icons.ts                  inline SVG stand-ins for the iOS SF Symbols
  styles/
    theme.css                 color tokens (light/dark), matching Theme.swift
    app.css                   layout and components
public/
  sw.js                       offline support (network first, cache fallback)
  manifest.webmanifest        installable web app metadata
  icon-*.png, apple-touch-icon.png, favicon-32.png
```

Layer rules:
- **Models** hold all game logic. They must stay pure and deterministic so they can be unit tested without a DOM.
- **The view model** holds input state and exposes `result: WeeklyPayout | null`. It must not duplicate payout math; it calls `weeklyPayout`. Views re-render through `subscribe`.
- **Views** read from the view model and write inputs back through `set`. No arithmetic on money in views.

## Conventions

- **Money is whole dollars in plain `number`s.** Rounding uses integer math: `Math.floor((2 * amount + count) / (2 * count))`. `Math.floor` is required: JavaScript `/` does not truncate like Swift's `Int` division. `rawValuePerUnit` is fractional and for display only.
- Format currency only through `dollars()` (0 decimals) and `exactDollarsText()` (2 decimals). Kitty wording comes from `kittyDescription()`.
- Input ranges: players `0...50`, points and birdies `0...199`. Results show only when players ≥ 1.
- UI copy is sentence case, plain and short. No all-caps labels.
- Result sections are built as HTML strings. That is safe only because every value is a formatted number or fixed text. Never interpolate user-typed text into them.

## Styling

- All colors come from the tokens in `styles/theme.css`; don't hard-code colors in `app.css` or views.
  - `--fairway` is the accent, used for buttons, icons, and pay amounts.
  - `--evergreen` is used for headings and totals.
  - `--sand` marks money coming out of the kitty.
  - `--card` is the row background.
  - `--turf-top` and `--turf-bottom` form the background gradient.
  - `--destructive` is the Clear button.
  - `--text`, `--text-secondary` and `--separator` are body text, secondary values and row dividers.
  - `--stripe` is the mowing stripe over the gradient; `--shadow` lifts cards in light mode.
- **Colors copied outside `theme.css`:** the `theme-color` meta tags in `index.html` and `background_color`/`theme_color` in `public/manifest.webmanifest` can't use CSS variables, so they repeat `--turf-top` (light and dark) and `--fairway`. Update them by hand when those tokens change.
- Light and dark mode follow `prefers-color-scheme`.
- The "Pay per point" and "Pay per birdie" figures are circled to enhance attention to the numbers.
- The kitty badge pairs color with an arrow icon and wording, so meaning never depends on color alone.
- The fairway background is decorative and `aria-hidden`.

## Gotchas

- **Stepper text sync:** the field updates from the value only when they disagree (`syncText`). An empty field is treated as the lower bound, so typing isn't interrupted. The field normalizes when focus leaves. Preserve this behavior when editing.
- **Stepper buttons** step on `pointerdown` (with hold-to-repeat) and ignore the `click` that follows. Keyboard activation arrives as a `click` with `detail === 0` and steps there. Don't add a plain click handler, or taps will count twice.
- **Steppers are built once.** Only `#results` is re-rendered, so focus and typing survive updates.
- **Screen reader announcements:** `#results` is not a live region, since it re-renders on every tap. A visually hidden `role="status"` element announces one line (the net kitty change, from `announcement()` in `results.ts`) and is only updated when that line changes.
- **Service worker** runs only in production builds. Vercel serves `sw.js` with `Cache-Control: no-cache` so updates are picked up. Bump `CACHE` in `sw.js` if its caching strategy changes.
- **Icons** in `public/` are resized from the iOS app's `AppIcon.png`, which is generated by `Tools/make_app_icon.swift` in the iOS repo. Regenerate there, then resize with `sips -z <size> <size>`.

## Testing

- `payoutCalculator.test.ts` covers every rule above: the pool split, rounding down, rounding up, a $0.50 tie, an exact split, a zero count, the $1 minimum, and the combined net kitty.
- When changing any payout behavior, add or update tests first, then run the full suite.
- Always run `npm run build` (which type-checks) and `npm test` before committing.
