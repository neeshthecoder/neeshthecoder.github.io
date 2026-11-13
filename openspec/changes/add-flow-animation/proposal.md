# Proposal

## Why

On desktop and tablet the home page leaves the right half of the screen empty. `flow.js` (already in the repo) draws a quiet, theme-aware ASCII flow field that can fill that space without touching the existing name, intro or project cards.

## What Changes

- Add `<canvas class="flow" aria-hidden="true"></canvas>` to `index.html` as a sibling of the existing header and main, and load `flow.js` with `<script src="flow.js" defer></script>` at the end of `<body>`. `flow.js` itself is not modified.
- In `page.css`, from 820px wide upward, lay the page out as two columns inside the existing `--space-10` margin: the left column (1fr) holds the name, intro paragraph and project cards unchanged; the right column (about 1.15fr) holds the canvas at the full available height.
- Below 820px wide, keep the current single-column layout and hide the canvas.
- The page still fits in one viewport with no scrolling at 1440×900, 1280×720 and 390×844.
- No changes to `styles.css` or to any copy, cards or links.
- Commit and push to `main` of `neeshthecoder.github.io` so GitHub Pages redeploys. The pending uncommitted edits to `index.html` and `page.css` (cache-busting `?v=4` and container-relative name sizing) go out first, as their own commit.

## Capabilities

### New Capabilities
- `home-page`: adds requirements for the flow animation panel and the responsive two-column layout. The capability is defined in the in-flight `add-personal-site` change but not yet archived into `openspec/specs/`, so these are written as ADDED requirements alongside it.

### Modified Capabilities
- None. No existing requirement text changes; the name, intro, card and link requirements all still hold as written.

## Impact

- `index.html`: one canvas element and one script tag added.
- `page.css`: body grid becomes two columns at ≥820px; new `.flow` rules.
- `flow.js`: now loaded (unchanged). It is the site's second script after `scramble.js`.
- `README.md`: the sentence saying `scramble.js` is the only JavaScript becomes inaccurate and is updated.
- Deployment: two commits pushed to `main`, which GitHub Pages redeploys.
