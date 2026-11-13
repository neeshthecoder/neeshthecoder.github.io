# Design

## Context

The project root has only the design system: `styles.css` (tokens with light/dark values, type classes, `.ps-header`, `.ps-card`, `.ps-card--sm`, etc.) and `STYLEGUIDE (1).md`. There is no git repo, no build tooling, and `openspec/specs/` is empty. `gh` 2.95 is installed and authenticated as `neeshthecoder` with `repo` scope; the repo `neeshthecoder/neeshthecoder.github.io` does not yet exist.

Facts from `styles.css` that shape the layout:
- `.ps-card--sm` is fixed at `width: 220px; min-height: 260px` and clipped with `clip-path` (24px notch). Two of them plus a `--space-5` gutter need 460px, but at 390px wide with a `--space-10` (40px) margin each side the content box is only 310px.
- `.ps-header` already provides `surface-200`, the only shadow, `space-5` horizontal padding and flex alignment. Without `.ps-header__right` it is just the name.
- `html, body` get `margin: 0` and the `paper` background, and the dark tokens switch under `prefers-color-scheme: dark`, so theming comes from the tokens with no extra work.
- `.ps-card__body` sets 19px `ink-soft`; `.ps-card__label` sets the mono uppercase label in `ink`.

See `proposal.md` for motivation and `specs/home-page/spec.md` and `specs/site-hosting/spec.md` for requirements.

## Goals / Non-Goals

**Goals:**
- Meet the single-screen fit at the three target viewports through sizing, not clipping.
- Keep `page.css` to layout and small, token-bound overrides of component sizes.
- Make the projects row take any number of cards with no CSS edits.

**Non-Goals:**
- Supporting very short viewports (e.g. landscape phones under ~500px tall) without scroll. The page falls back to normal document scroll there rather than cutting content.
- A theme toggle, analytics, favicon or social-card images.
- Any change to the `gym-routine` or `library` repos.

## Decisions

### 1. Page frame: a three-row grid on `body` sized to `100dvh`
`body` gets the styleguide skeleton (`padding-inline: var(--space-10); max-width: 1440px; margin-inline: auto; box-sizing: border-box`) plus `display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; min-height: 100dvh` and block padding of `--space-5` top / `--space-10` bottom. Rows are header, `main` (intro), and the projects `section`, so the cards sit at the bottom and leftover space falls between paragraph and cards.
- Use `min-height`, not `height` with `overflow: hidden`, so a viewport too small for the content scrolls instead of hiding it (the spec forbids clipping as a fit strategy). At the three target sizes the content is well under the viewport height (estimated about 520px at 1280×720 and 620px at 390×844), so no scroll appears.
- `100vh` is declared first as a fallback for browsers without `dvh`.
- The projects `section` sits inside `main` as its last child, which keeps the required semantics (header, main, section for projects). `main` is a flex column with `justify-content: space-between`, so the frame is really header + `main` (which fills the remaining height). Alternative considered: `position: fixed` for the row. Rejected because it takes the row out of flow and can overlap the paragraph on short screens.

### 2. Fluid sizing bound to the type scale
- Intro: `.body-lg` with `color: var(--ink-soft)`, `max-width: 36ch` (`ch` is the width of "0", which is wide in Inter Tight, so 36ch gives about 43 real characters per line; 46ch measured about 60), `font-size: clamp(16px, 0.9rem + 0.35vw, 19px)`. 16px (`.body`) and 19px (`.body-lg`) are both on the scale.
- Card label: `clamp(12px, …, 18px)` (`.caption` to `.label`). Card link: the same clamp as the intro.
- Spacing between header and paragraph: `clamp(var(--space-5), 6dvh, var(--space-20))`. All bounds are tokens.
- Name (revised after launch): no `.ps-header` band. An `h1.display` with `font-size: clamp(56px, 2.5rem + 3vw, 88px)` (heading-1 to display), measured at 224–333px wide against a 310–395px paragraph. `font-kerning: none` keeps letter positions identical during and after the scramble.

### 3. Card size on narrow screens
Cards keep the component's 220px width where it fits and shrink to share the row on phones: `flex: 0 0 auto; width: min(220px, calc((100% - var(--space-5)) / 2))`. At 390px each card is 145px. Height becomes `min-height: min(260px, 30dvh)` so short desktop windows also fit. The styleguide says "the consumer provides the width", so this override is allowed. The notch stays `--notch-sm` from `.ps-card--sm`.
- Alternative: let cards wrap onto two rows on phones. Rejected because two stacked 260px cards plus the paragraph overflow 844px.
- Alternative: keep 220px and let the row scroll on phones. Rejected because it would cut the second card on first view, which fails the acceptance check.

### 4. Extensible row: flex without wrap, scrolling only inside the row
`.projects { display: flex; gap: var(--space-5); justify-content: flex-start; overflow-x: auto; }`. Cards are never stretched, so empty space stays on the right at desktop widths. A 3rd or 4th card fits at desktop (4×220 + 3×20 = 940px, under 1200px). On a phone, extra cards overflow *the row*, which scrolls horizontally like the styleguide's carousel while the page keeps its width. No CSS change is needed.

### 5. Links and focus
`.project-link`: `color: var(--ink); font-weight: 400; text-decoration: underline; text-decoration-thickness: var(--hairline); text-underline-offset: 0.18em;` and on `:hover` only `text-underline-offset: 0.3em`. That is the "subtle underline change": no colour, size or weight change, and no transition.
Focus: `.project-link:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; border-radius: var(--radius-sm); }`, which mirrors the existing `.ps-cta:focus-visible` and the styleguide's focus-ring radius. `clip-path` on the card clips descendants too, but the link sits at the bottom-left, 20px (`--space-5` padding) from the edges and far from the top-right notch. The ring extends only 5px, so it is never clipped. The row's `overflow-x: auto` also clips, but only at the card edges, which are outside the ring. Cards get no `tabindex` and no focus styles.

### 6. Markup
```html
<header class="site-name"><h1 class="display site-name__text" data-scramble>Avaneesh</h1></header>
<main class="intro">
  <p class="body-lg intro__text">Hey, I’m Avaneesh. …</p>
  <section class="projects" aria-label="Projects">
    <article class="ps-card ps-card--sm">
      <p class="ps-card__label">Project 01</p>
      <p class="ps-card__body"><a class="project-link" href="https://neeshthecoder.github.io/gym-routine/">Gym routine</a></p>
    </article>
    …
  </section>
</main>
```
The name is a `<span>`, not a link, because the page has nowhere to go. The label is uppercased by CSS (`text-transform`), so the source reads "Project 01". Apostrophes are literal U+2019 characters, and the file is saved as UTF-8 with `<meta charset="utf-8">`. `index.html` loads `styles.css` and then `page.css`, plus `preconnect` hints to the Google Fonts origins.

### 7. Repository and hosting
- Rename `STYLEGUIDE (1).md` to `STYLEGUIDE.md` with `mv` (the file is unchanged).
- `.gitignore`: `.claude/`, `.agents/`, `.DS_Store`. `openspec/` is committed as the project's spec record. It is publicly reachable under `/openspec/`, which is acceptable for planning docs.
- `git init -b main`, commit, then `gh repo create neeshthecoder.github.io --public --source . --remote origin --push`.
- Enable Pages explicitly: `gh api -X POST repos/neeshthecoder/neeshthecoder.github.io/pages -f 'source[branch]=main' -f 'source[path]=/'`. If it is already enabled automatically (409), confirm with `GET …/pages`.
- Verify by polling `gh api …/pages/builds/latest` until `status == built`, then `curl -sI` the root, `/gym-routine/` and `/library/`.

### 8. Verification approach
Viewport checks use a headless browser driven from the scratchpad, not committed: Playwright via `npx`, or Chrome `--headless --screenshot` if Playwright is unavailable. It loads the local `index.html` at each viewport in both `colorScheme: light` and `dark`, asserts that `scrollHeight <= innerHeight` and `scrollWidth <= innerWidth`, asserts that every card's bounding box is inside the viewport, tabs to each link and screenshots the focus ring, and repeats with a temporarily duplicated third card (the edit is reverted afterwards).

### 9. Name decode effect (added after launch at the user's request)
`scramble.js`, about 50 lines and loaded with `defer`, is the page's only script. It is an enhancement: with no JS or with `prefers-reduced-motion: reduce`, the plain `h1` shows. Otherwise it waits for `document.fonts.ready` (capped at 1.2s) with the heading hidden, splits the name into `aria-hidden` spans with `aria-label` on the `h1`, and locks each span to its final glyph's width so symbols never shift the layout. Each span cycles symbols every 45ms in `--ink-soft`; letters lock left to right 250ms + 85ms × index after the start (about 0.9s in total). The plain text node is then restored. Alternative considered: CSS-only `content` keyframes. Rejected because Safari's support for animating `content` is unreliable.

## Risks / Trade-offs

- [Web-font swap changes line wrapping after load, so the paragraph could grow by a line] → Large vertical slack at all three viewports (≥100px), plus `display=swap` from the existing import. Check the fit after the fonts load (`document.fonts.ready`).
- [`dvh` unsupported in older browsers] → The `100vh` fallback is declared first. With `min-height`, the worst case is a little scroll, never clipped content.
- [Phone cards at 145px are narrower than the component's 220px] → This is an accepted trade-off to show both projects without scroll. The label "PROJECT 01" at ≥12px mono fits in 105px of inner width, and the labels are clamped down to the caption size if needed.
- [Pages first build can take a minute or two, or the user-site repo may auto-enable Pages] → Poll the build status, and treat a 409 on enable as success after confirming the source.
- [Root user site could shadow project sites if it contained `/gym-routine/` or `/library/` folders] → This repo contains neither path, so project repos keep serving their sub-paths.

## Migration Plan

1. Implement and verify locally (Decisions 1–6, 8).
2. Create the repo, push and enable Pages (Decision 7). Confirm that the three URLs return 200.
3. Rollback: disable Pages (`gh api -X DELETE repos/neeshthecoder/neeshthecoder.github.io/pages`) or delete the repo. The project sites are unaffected either way.
