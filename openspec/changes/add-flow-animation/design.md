# Design

## Context

- `index.html` body has two children: `header.site-name` and `main.intro`. `page.css` makes `body` a one-column grid (`grid-template-rows: auto 1fr`) with `padding: var(--space-10)`, `max-width: 1440px` and `min-height: 100dvh`.
- `flow.js` (read-only for this change) finds every `canvas.flow`, sizes its backing store from `getBoundingClientRect()` × devicePixelRatio (capped at 2) on a `ResizeObserver`, pauses when off-screen, hidden or under `prefers-reduced-motion` (draws one still frame), and reads `--rule`, `--ink` and `--font-mono` from `styles.css` for colours and font.
- Uncommitted edits already sit in `index.html` and `page.css` (`?v=4` cache-busting, container-relative name sizing). The user chose to ship them first as their own commit.

## Goals / Non-Goals

**Goals:**
- Place the canvas in a right-hand column at ≥820px with no change to how the left-column content looks or reads.
- Keep the canvas from ever influencing the height of the page.

**Non-Goals:**
- Tuning the animation (font size, speed, line count) — that lives in `flow.js`, which stays untouched.
- Any tablet-specific styling beyond the 820px switch.

## Decisions

**Grid placement.** At `@media (min-width: 820px)`: `body { grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); column-gap: var(--space-10); }`. Header goes in column 1 row 1, main in column 1 row 2, canvas in column 2 spanning `grid-row: 1 / -1`. The canvas is a direct child of `body` (sibling of header and main), so no wrapper element is added and the left-column markup stays the same. `minmax(0, …)` stops long content from forcing a column wider than its share. The gap uses the existing `--space-10` token, matching the outer margin. In the same media query `body` also gets `height: 100vh; height: 100dvh;` (see below).

**Canvas sizing and the resize feedback loop.** `flow.js` sets `canvas.height = H × dpr`. A canvas's intrinsic height is its `height` attribute in CSS px, so if the canvas's content size ever fed into grid track sizing, each resize could double it on a 2× screen. `body` uses `min-height`, not `height`, so its block size is not definite during track sizing. `.flow` gets `contain: size` in addition to the requested `display: block; width: 100%; height: 100%; min-height: 0`, so its intrinsic size is zero. *Revised during implementation:* that alone was not enough. In Chrome, with only `min-height` on `body`, the canvas's `height: 100%` resolved against the previous layout's grid area. After resizing the window, the page stayed taller than the viewport and kept growing: 1656px at 1440×900 after going 820→1440 wide, while a fresh load gave the correct 900px. Giving `body` a definite `height: 100vh; height: 100dvh` at ≥820px fixes it, and the layout stays stable through repeated resizes, across the 819/820 breakpoint, and at 1280×500.
- Trade-off accepted: on a desktop window shorter than the left column's content, that content overflows the fixed-height body instead of the body growing. The page still scrolls to reach it, and at 1280×500 nothing overflows.
- Alternative: `position: absolute` canvas inside a wrapper. Rejected because it needs a wrapper and the request asks for a sibling canvas.
- Alternative: drop `height: 100%` and rely on grid stretch. Rejected because the request specifies `height: 100%`.

**Hiding below 820px.** The base rule is `.flow { display: none; }` and the media query turns it on, so phones never lay out the canvas. When the canvas is `display: none`, `flow.js` reads a 0×0 rect, draws nothing, and its IntersectionObserver reports it as not intersecting, so no animation loop runs.

**Script tag.** Use exactly `<script src="flow.js" defer></script>` as the last child of `<body>`, as specified, without a `?v=` query. `page.css` is bumped from `?v=4` to `?v=5` so returning visitors get the new layout instead of a cached one-column stylesheet next to a new canvas.

**Accessibility.** `aria-hidden="true"` on the canvas; canvases are not focusable by default, so nothing else is needed.

## Risks / Trade-offs

- [Tablet widths from 820 to about 1000px make the left column narrow (about 340px at 820px)] → The paragraph wraps to fewer characters per line and the two cards shrink through the existing `min(220px, …)` rule. Copy and styles are unchanged, so the specs still hold. Check visually at 820×1180 (iPad Air portrait) and 1024×768.
- [iPad mini portrait (744px) gets the phone layout] → This follows the 820px breakpoint the user specified.
- [`flow.js` is cached without a version query] → It is new, so no stale copy exists. Future edits to it would need a query, but `flow.js` is out of scope here.
- [CPU on low-end devices] → `flow.js` already caps the frame rate at 30fps and pauses when hidden or off-screen.

## Migration Plan

1. Commit the existing uncommitted edits by themselves.
2. Commit the flow change.
3. Push `main`. GitHub Pages redeploys in about a minute.
Rollback: `git revert` the flow commit and push.
