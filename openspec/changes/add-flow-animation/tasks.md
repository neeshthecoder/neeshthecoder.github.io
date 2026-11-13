# Tasks

## 1. Ship the pending edits

- [x] 1.1 Commit the existing uncommitted changes to `index.html` and `page.css` (`?v=4` cache-busting and container-relative name sizing) as their own commit, with no flow-related lines. Verify that `git show --stat HEAD` lists only those two files and that `git diff` is empty afterwards.

## 2. Markup

- [x] 2.1 In `index.html`, add `<canvas class="flow" aria-hidden="true"></canvas>` as a direct child of `<body>` after `</main>`, then `<script src="flow.js" defer></script>` as the last element in `<body>`. Verify that `git diff index.html` shows only those two added lines plus the `page.css?v=5` bump, and no copy, card or link changed.
- [x] 2.2 Bump the `page.css` link to `?v=5`. Verify with `grep 'page.css?v=5' index.html`.

## 3. Layout (page.css only)

- [x] 3.1 Add a base `.flow { display: none; }` rule. Then add an `@media (min-width: 820px)` block that sets `body` to `grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr)` with `column-gap: var(--space-10)`, places `.site-name` at column 1 row 1 and `.intro` at column 1 row 2, and gives `.flow` `grid-column: 2; grid-row: 1 / -1; display: block; width: 100%; height: 100%; min-height: 0; contain: size`. Verify that `git diff --stat` shows no change to `styles.css` or `flow.js`.

## 4. Verification

- [x] 4.1 Serve the site locally (`python3 -m http.server`) and check in a browser at 1440×900 and 1280×720 that the animation fills the right column from the top margin to the bottom margin, the right column is wider than the left, and `document.documentElement.scrollHeight <= innerHeight` and `scrollWidth <= innerWidth`.
- [x] 4.2 At 390×844, check that the canvas has `display: none`, the page doesn't scroll, and the layout looks the same as before this change.
- [x] 4.3 Resize from 819px to 820px and back. Check that the panel appears and disappears at the breakpoint. Resize repeatedly at ≥820px and check that the canvas height tracks the viewport and never grows the page.
- [x] 4.4 With reduced motion emulated, check that the panel shows a still frame. In dark mode, check that its colours switch. Also check 820×1180 and 1024×768 for a readable left column.

## 5. Docs and deploy

- [x] 5.1 Update the README sentence that calls `scramble.js` the only JavaScript so it also mentions `flow.js`, the decorative ASCII flow shown on screens 820px and wider. Verify by reading the updated sentence.
- [x] 5.2 Commit the flow change (`index.html`, `page.css`, `README.md`) and push `main` to `origin` (neeshthecoder.github.io). Verify that `git status` is clean and up to date with `origin/main`, and that https://neeshthecoder.github.io/ serves the canvas after the Pages build finishes.

## Workflow follow-up

- Archive `add-personal-site` and this change once both are reviewed, so `openspec/specs/home-page/spec.md` gets both sets of requirements.
