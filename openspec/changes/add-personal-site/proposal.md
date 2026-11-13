# Proposal

## Why

Avaneesh has two project sites already live under `neeshthecoder.github.io` (`/gym-routine/` and `/library/`) but nothing at the root URL to introduce himself or link to them. A deliberately small, one-screen home page built on the existing personal-site design system (`STYLEGUIDE.md` + `styles.css`) fills that gap without adding a build step or ongoing maintenance.

## What Changes

- Add a static, single-screen home page (`index.html`) that shows, top to bottom: a stripped-down site header with the name "Avaneesh", a short intro paragraph (exact copy supplied, typographic apostrophes), and a bottom-pinned row of small notch cards linking to the existing projects ("Gym routine", "Library").
- Add `page.css` holding page-specific layout only, loaded after `styles.css` and using only existing tokens and type-scale sizes. `styles.css` is not modified.
- The page fits the viewport (100dvh, fluid `clamp()` sizing bound to the type scale) with no vertical or horizontal page scroll at 1440×900, 1280×720 and 390×844, in light and dark mode.
- The projects row is extensible: adding a project means copying one `<article>`; no CSS changes.
- Rename the provided `STYLEGUIDE (1).md` to `STYLEGUIDE.md` and keep it in the repo for reference; add `README.md` (one paragraph) and `.nojekyll`.
- Publish the site from a new public GitHub repository `neeshthecoder/neeshthecoder.github.io` (Pages: `main` branch, root folder) so it serves at `https://neeshthecoder.github.io/` while the existing project sites keep working at their sub-paths.
- No JavaScript, no framework, no build step.

## Capabilities

### New Capabilities
- `home-page`: Content, layout, viewport-fit, theming, accessibility and extensibility requirements for the site's root page.
- `site-hosting`: How the site is published and served (GitHub Pages user site at the root domain, coexisting with existing project sites).

### Modified Capabilities
<!-- None: there are no existing specs in openspec/specs/. -->

## Impact

- New files at the project root: `index.html`, `page.css`, `README.md`, `.nojekyll`, `.gitignore`; `STYLEGUIDE (1).md` renamed to `STYLEGUIDE.md`. `styles.css` unchanged.
- External: a new public GitHub repo `neeshthecoder.github.io` with Pages enabled. The existing `gym-routine` and `library` project repos are not touched; GitHub serves project sites under the user-site domain, so their URLs stay the same.
- Runtime dependency on Google Fonts (Inter Tight, Geist Mono), already imported by `styles.css`.
- Local tooling directories (`.claude/`, `.agents/`) are kept out of the public repo.
