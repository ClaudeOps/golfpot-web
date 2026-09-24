# GolfPot

Weekly golf game payout calculator. Enter the number of players, total points and total birdies, and it splits the pot, pays out per point and birdie in whole dollars, and shows what goes into or comes out of the kitty.

A static single-page app in TypeScript. Everything runs in the browser, and it works offline once loaded. You can add it to your phone's home screen.

## Develop

```sh
npm install
npm run dev
npm test
```

## Deploy

Hosted on Vercel. Connect the GitHub repo in the Vercel dashboard. `vercel.json` sets the build (`npm run build`) and output directory (`dist`), so no other configuration is needed.
