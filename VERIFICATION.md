# Portfolio redesign verification

Checked locally on 2026-10-07 with Chromium through Playwright. The site remains
plain HTML, CSS, and JavaScript; no build step or backend is required.

## Copy refresh

The subsequent EN/CZ rewrite was checked in 30 Chromium configurations: all five
pages in both languages at 1440, 390, and 320 px. There were no overflow, missing
resource, or browser error findings. All 212 static translation pairs match the
rendered English fallback; translated passages retain their existing controls,
links, and accessibility attributes. JavaScript syntax and whitespace checks pass.
The social preview was refreshed to match the new introduction.

## Completed checks

- 100 page configurations: all five pages at 1440, 900, 768, 390, and 320 px,
  in English and Czech, in dark and light themes.
- No horizontal overflow, browser exceptions, failed resources, missing visible
  images, duplicate page headings, unnamed buttons, or rendered text below 14 px.
- Mobile navigation opens, traps keyboard focus, closes with Escape, and restores
  focus. Theme and language preferences survive navigation.
- Every Chess and Komplex scene opens with its matching description; selectors
  support click, arrow keys, Home, and End. Reduced motion disables scene animation.
- Julia rendering changes with the parameters and resets correctly. Work is
  scheduled only when necessary and stopped outside the viewport or hidden tab.
- Chess puzzle: keyboard selection, mate in one, blocked move, hint, and reset.
  Original position: `7k/8/5KQ1/8/8/8/8/8 w - - 0 1`; solution `Qg7#`.
- Simulated terminal: open, focus, supported commands, unknown commands, escaping
  entered HTML, clear, Escape, restored focus, and translated output.
- Without JavaScript, navigation and project galleries remain available and toys
  have readable explanations. Blocked storage does not break the controls.
- Failed image and video requests show a useful fallback. Videos do not autoplay.
- Local links, fragment targets, fonts, scripts, styles, images, and translation
  attribute pairs checked; JavaScript syntax and `git diff --check` pass.
- Desktop and mobile page screenshots, rendered Julia canvas, Chess UCI scene,
  Komplex lesson scene, and the 1200 × 630 social preview visually inspected.

Testing used the local server at `http://127.0.0.1:4173`. No live deployment was
performed. These checks do not claim Safari or Firefox coverage.

## Serving and quick checks

```sh
python3 -m http.server 4173 --bind 127.0.0.1
node --check ui-logic.js
node --check theme-init.js
node --check showcase.js
node --check playground.js
git diff --check
```

Current application screenshots and the UCI transcript are documented in
[`assets/README.md`](assets/README.md). Chess and Komplex are represented with
genuine current captures; neither native engine runs in the browser. The small
Julia illustration and fixed chess puzzle are independent website interactions.
