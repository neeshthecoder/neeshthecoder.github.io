# Tasks

## 1. Repository files

- [x] 1.1 Rename `STYLEGUIDE (1).md` to `STYLEGUIDE.md` (contents unchanged); verify with `ls` and that `shasum` matches the original
- [x] 1.2 Add an empty `.nojekyll` and a `.gitignore` excluding `.claude/`, `.agents/` and `.DS_Store`; verify both exist at the root
- [x] 1.3 Record `shasum styles.css` as the baseline, to confirm later that it is unchanged

## 2. Markup

- [x] 2.1 Create `index.html` per design §6: `lang="en"`, charset, viewport meta, `<title>Avaneesh</title>`, a short meta description, Google Fonts preconnects, `styles.css` then `page.css`; `header.ps-header` with only the name; `main` with the intro paragraph and `section.projects[aria-label="Projects"]` holding two `article.ps-card.ps-card--sm` cards. Verify that `grep -c "<script" index.html` is 0, that `grep "'" ` finds no straight apostrophe in the paragraph, and that both hrefs are exactly `https://neeshthecoder.github.io/gym-routine/` and `https://neeshthecoder.github.io/library/#/`
- [x] 2.2 Validate the HTML (e.g. `npx --yes html-validate index.html`, or the W3C Nu checker via `curl`); verify there are no errors

## 3. Layout (page.css)

- [x] 3.1 Implement the page frame (design §1): body skeleton margins and max width, grid with `min-height: 100vh` then `100dvh`, block padding, `main` as a flex column with `space-between`; verify in a browser that cards sit at the bottom at 1440×900
- [x] 3.2 Implement fluid type and spacing (design §2): intro `ink-soft`, `max-width: 36ch` and the 16–19px clamp, the 12–18px label clamp, and the header-to-paragraph clamp between `--space-5` and `--space-20`; verify by grep that every `clamp()` bound is a type-scale size or a token
- [x] 3.3 Implement the projects row and card sizing (design §3–4): flex, `--space-5` gap, no wrap, `overflow-x: auto`, `width: min(220px, calc((100% - var(--space-5)) / 2))`, `min-height: min(260px, 30dvh)`; verify that empty space remains to the right of the cards at 1280×720
- [x] 3.4 Implement link and focus styles (design §5): ink, weight 400, hairline underline, hover changes only the underline offset, `:focus-visible` 2px ink outline with 3px offset and `--radius-sm`; verify that `page.css` contains no hex/rgb colours, no `box-shadow`, no `border-radius` other than `var(--radius-sm)`, and no `font-weight` above 400

## 4. Verification (headless browser, run from the scratchpad, not committed)

- [x] 4.1 After `document.fonts.ready`, at 1440×900, 1280×720 and 390×844 in both light and dark colour schemes, verify that `scrollHeight <= innerHeight`, that `scrollWidth <= innerWidth`, and that the header, paragraph and both cards (with links) are fully inside the viewport; save screenshots
- [x] 4.2 Press Tab from page load; verify that focus lands on "Gym routine" then "Library", that the focus ring is fully visible and unclipped in the screenshots, and that no card receives focus
- [x] 4.3 Check contrast in both themes: confirm that computed colours are label/link `--ink` on `--surface-100`, paragraph `--ink-soft` on `--paper` and name `--ink` on `--surface-200`, which are all styleguide pairings
- [x] 4.4 Temporarily duplicate a card as "Project 03"; verify at all three viewports that it matches the others with no CSS change and that the page has no scroll (on the phone only the row scrolls); then revert the duplicate
- [x] 4.5 Verify that `shasum styles.css` matches the baseline from 1.3

## 5. Docs

- [x] 5.1 Write a one-paragraph `README.md` that says what the site is and how to add a project (copy one `<article>` in `index.html` and change the label, link text and href); verify the steps by following them in 4.4

## 6. Deploy

- [x] 6.1 `git init -b main`, stage the site files, styleguide, README, `.nojekyll`, `.gitignore` and `openspec/`, and commit; verify that `git ls-files` excludes `.claude/` and `.agents/`
- [x] 6.2 `gh repo create neeshthecoder.github.io --public --source . --remote origin --push`; verify that `gh repo view neeshthecoder/neeshthecoder.github.io --json visibility` reports PUBLIC and that `main` is pushed
- [x] 6.3 Enable Pages from `main` `/` via `gh api` (treat 409 as already enabled); verify that `gh api repos/neeshthecoder/neeshthecoder.github.io/pages` shows source `main` and path `/`
- [x] 6.4 Poll `pages/builds/latest` until it is `built`; verify that `curl -sI` returns 200 for `https://neeshthecoder.github.io/`, `/gym-routine/` and `/library/`, and that the live page body contains "Avaneesh"; report the live URL
