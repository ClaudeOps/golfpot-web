import "./styles/theme.css";
import "./styles/app.css";
import { PayoutViewModel } from "./viewModel/payoutViewModel";
import { mountPayoutCalculator } from "./views/payoutCalculatorView";

mountPayoutCalculator(document.querySelector<HTMLElement>("#app")!, new PayoutViewModel());

// Offline support in production builds only, so the dev server never serves stale files.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker registration failed; the app still works online.", error);
    });
  });
}
