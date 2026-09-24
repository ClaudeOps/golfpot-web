// Inline SVG icons standing in for the SF Symbols the iOS app uses.
// All draw with currentColor so CSS sets their color from the theme.

const svg = (body: string, extra = "") =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" ${extra}>${body}</svg>`;

export const icons = {
  /** figure.golf */
  golfer: svg(
    `<circle cx="10" cy="4" r="2.4" fill="currentColor"/>
     <path d="M9.3 7.5h2.2l1.6 5.2-1.9 1.4 1 6.4h-2.2l-1-5.6-1.6 5.6H5.3l2.2-8z" fill="currentColor"/>
     <path d="M12.2 9.8l7 9.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
     <path d="M18.4 19.4h2.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  ),
  /** flag.fill */
  flag: svg(
    `<rect x="5" y="2.5" width="2" height="19" rx="1" fill="currentColor"/>
     <path d="M7 3.5h11.2l-2.8 4.3 2.8 4.3H7z" fill="currentColor"/>`,
  ),
  /** bird.fill */
  bird: svg(
    `<path d="M20.5 5.5l-2.3.5a4.3 4.3 0 0 0-7.1 2.4L10.6 11 4 8.2c-.7-.3-1.3.4-.9 1 1.6 3.1 3.6 5.6 6.4 6.8L7 19.5h2.4l2-2.7c.5.1 1 .1 1.5.1 3.9 0 6.3-3.1 6.3-6.9V8.2z" fill="currentColor"/>
     <circle cx="15.3" cy="7.6" r=".9" fill="var(--card)"/>`,
  ),
  /** calendar */
  calendar: svg(
    `<rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
     <path d="M3.5 9.5h17" stroke="currentColor" stroke-width="1.8"/>
     <path d="M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  ),
  /** dollarsign.circle.fill */
  dollarCircle: svg(
    `<circle cx="12" cy="12" r="9.5" fill="currentColor"/>
     <path d="M14.6 9.2c-.4-1-1.4-1.6-2.6-1.6-1.5 0-2.6.8-2.6 2 0 2.7 5.4 1.5 5.4 4.4 0 1.3-1.2 2.2-2.8 2.2-1.4 0-2.5-.7-2.9-1.8M12 6v1.6M12 16.2V18"
       fill="none" stroke="var(--card)" stroke-width="1.7" stroke-linecap="round"/>`,
  ),
  /** banknote.fill */
  banknote: svg(
    `<rect x="2" y="6" width="20" height="12" rx="2" fill="currentColor"/>
     <circle cx="12" cy="12" r="2.8" fill="var(--card)"/>`,
  ),
  minus: svg(`<path d="M6 12h12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`),
  plus: svg(`<path d="M6 12h12M12 6v12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`),
  /** arrow.up.circle.fill */
  arrowUpCircle: svg(
    `<circle cx="12" cy="12" r="10" fill="currentColor"/>
     <path d="M12 17V7.5M7.8 11.5 12 7.3l4.2 4.2" fill="none" stroke="var(--card)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  /** arrow.down.circle.fill */
  arrowDownCircle: svg(
    `<circle cx="12" cy="12" r="10" fill="currentColor"/>
     <path d="M12 7v9.5M7.8 12.5 12 16.7l4.2-4.2" fill="none" stroke="var(--card)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  /** equal.circle.fill */
  equalCircle: svg(
    `<circle cx="12" cy="12" r="10" fill="currentColor"/>
     <path d="M7.5 10h9M7.5 14h9" stroke="var(--card)" stroke-width="2.2" stroke-linecap="round"/>`,
  ),
} as const;
