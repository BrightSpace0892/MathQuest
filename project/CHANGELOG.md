# MathQuest v4.2 All‑Up Safe Animated – UI Upgrade

## vNEXT (August 2025)

This version extends the **v4.2 all‑up safe** build to deliver a production‑ready MathQuest experience aligned with the Game Design Specs, Grade Content Matrix and Champion System.  Key improvements include:

### Grade‑aware Quickfire

* Implemented a question generator that tailors arithmetic content to the player’s stored grade (`mq.grade`).  Kindergarten and grade 1 practise addition/subtraction within 10; grades 2–3 include addition/subtraction within 100 and single‑digit multiplication/division; grades 4–5 introduce multi‑digit operations and simple decimal arithmetic; grades 6–8 mix fraction addition, integer operations and one‑step equations.  See `pages/games/quickfire.html` for details.
* Added a grade picker prompt when no grade is stored in `localStorage`.  The selected grade persists across sessions.
* Normalised answer parsing to accept fraction answers of the form `a/b` for fraction questions.

### Champion system alignment

* Updated the champion roster to match the approved designs: **Ranger**, **Mage**, **Engineer**, **Ninja**, **Captain**, **Druid**, **Pilot** and **Astronaut**.  Added alias PNGs for each champion identifier under `assets/img/champions/` (e.g. `mage.png` now points to the former `wizard.png`).
* `runtime.js` now references the new champion identifiers.  Selecting a champion stores the choice and plays a toast with confetti.

### Start/stop scripts

* Added `start_mathquest.bat` and `stop_mathquest.bat` at the project root.  The start script launches the API server (`npm run dev`), serves the client via Python’s HTTP server on port 8000 and opens the default browser.  The stop script terminates any processes bound to ports 8788 and 8000.

### Documentation

* Added `AUDIT_BASELINE.md` capturing issues observed in the stock `v4.2` build prior to enhancements.
* Added `QA_REPORT.md` summarising Lighthouse scores, accessibility compliance and per‑game test results for the vNEXT build.

### Miscellaneous fixes

* Added missing `.env` guidance via `start_mathquest.bat` to ensure Prisma uses a local SQLite database (`dev.db`).
* Removed unused champion names and normalised champion image references.

This release applies a comprehensive adventure‑themed redesign to the MathQuest client. All server endpoints remain untouched, and COPPA/GDPR/PIPEDA safeguards are preserved. Notable changes include:

## Global changes

- **Adventure visual language:** Introduced a vibrant palette (primary `#5EE7FF`, secondary `#68F5BF`, gold `#FFD166`, deep navy backgrounds) and new typography using bundled Baloo 2 and Nunito fonts. All UI elements now have rounded, glassy cards with gentle shadows and gradients. See `client/assets/css/design.css` for variables and component styles.
- **Responsive navigation:** The header has been restyled with a sticky glassy bar, champion avatar selector, and a mobile drawer with ARIA labels. Navigation links adjust automatically for smaller screens. See `client/index.html` and `runtime.js` for nav toggling.
- **Motion & delight:** Added CSS keyframe animations for floating islands, parallax hero layers, confetti bursts, toast notifications, timer rings, mission progress bars, and medal sparkles. All animations respect `prefers‑reduced‑motion`. Confetti and toast utilities are in `runtime.js`.
- **Champion system:** Users can pick from eight colorful champions (see `/client/assets/img/champions/`). A modal selector stores the choice in `localStorage`, updates the avatar, and shows a toast with confetti. See `runtime.js` and the modal markup in `index.html`.
- **New assets:** Local fonts (`Baloo2.woff2`, `Nunito.woff2`), champion images, and UI icons have been added under `client/assets/fonts/` and `client/assets/img/`.

## Homepage (index.html)

- Replaced the old feature grid with an **adventure map**. Islands are clickable circles that link to each game. A dashed progress path runs beneath them and fills as XP increases (placeholder). Each island floats on hover and contains accessible tooltips.
- Added a **hero banner** with parallax star and cloud layers and event banner below it. Both pause when reduced motion is preferred.
- Added champion selector modal, confetti canvas, toast notification container, and What’s New modal.
- Implemented mobile hamburger menu and nav drawer.
- Added ARIA labels to interactive elements and improved focus outlines.

## Games

- **Quickfire:** Overhauled UI with a scoreboard row, animated timer ring, input field styling and micro‑interactions. Score pulses on correct answers and the timer ring animates smoothly. See `pages/games/quickfire.html`.
- **Other games (Bingo, Memory, Fractions, Number Line):** Added decorative frames and themed banners. Placeholder content remains but now lives inside a colourful card. See `pages/games/*`.

## Missions

- Missions are displayed as cards with animated gradient progress bars. When a mission reaches its goal, confetti automatically fires. See `assets/js/missions.js`.

## Leaderboards

- Top three entries receive gold, silver and bronze medal icons. These rows now sparkle with a twinkling star and are assigned the `.leader-row.top3` class. Styling and keyframes are in `design.css`; logic is in `leaderboard.html`.

## Groups

- The group board now highlights the friend code with a subtle shine effect and improves button layout. The friend code remains anonymised. See `pages/groups/board.html`.

## Teacher Wizard

- Reworked the demo class screen with QR code generation using a bundled `qrcode.min.js` stub. Teachers can print login cards via a print‑friendly popup. See `pages/teacher/wizard.html`.

## Admin Analytics

- Charts now feature axis lines, tick marks, axis labels and a time‑range selector (7/30/90 days). The chart function has been rewritten to draw axes and labels on the canvas. See `pages/admin/analytics.html`.

## Miscellaneous

- Updated demo guides tooltips to use new tooltip design and rounded highlight outlines (`demo_guides.js`).
- The What’s New modal has been restyled with hero imagery and fun icons (`whatsnew.js`).
- Added `.frame-card` class to provide gradient borders for placeholder pages.

For any further changes or bug fixes, please refer to commit history or contact the maintainers.