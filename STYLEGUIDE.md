# Personal Site — Styleguide

A quiet, editorial system for a personal website: white paper, grey cards with a clipped corner, one dark slab, and big tightly-tracked type. Inspired by the testimonial and call-to-action section of Palantir's site — its restraint, not its brand.

## Principles

- **Paper first.** The page is `paper`. Sections are separated by full-width `rule` hairlines (`hairline`, 1px), never by coloured bands or shadows.
- **Borders, not shadows.** No drop shadows anywhere except a faint one under the floating header. Depth comes from grey value: `paper` → `surface-100` → `surface-200` → `surface-inverse`.
- **Square, with one cut.** Corners are `radius-none`. The single decorative move is the **notch**: a 45° cut off a card's top-right corner (`notch-lg` / `notch-sm`). Don't add other shapes.
- **One heavy thing per screen.** `surface-inverse` is reserved for the primary CTA block. Everything else is light grey.
- **Type does the work.** Headlines are large, regular weight (400, never bold) and tightly tracked. Labels are uppercase monospace.

## Typography

Two families, both free on Google Fonts:

- `sans` — **Inter Tight**: headings, CTAs, body, buttons. Weight 400 throughout; use 500 only for very small UI if 400 looks thin.
- `mono` — **Geist Mono**: card eyebrows (`label`) and metadata (`caption`), always UPPERCASE.

Load them with:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500&family=Geist+Mono:wght@400&display=swap" rel="stylesheet">
```

Headings use negative letter-spacing (`-0.025em` to `-0.035em`); body text does not. Quotes in cards sit at the **bottom** of the card, with the label at the top and empty space between — let the card breathe.

## Colour

Neutral only. Ten tokens, no accent hue. If you want one accent later (a link colour, say), add a single token and use it for links and focus only.

| Pairing | Use |
|---|---|
| `ink` on `paper` / `surface-100` / `surface-200` | headings, labels, buttons |
| `ink-soft` on `paper` / `surface-100` | quotes and paragraphs |
| `ink-muted` on `paper` / `surface-100` | captions, dates |
| `on-inverse` on `surface-inverse` | primary CTA |

## Layout

- Content width runs edge to edge inside a `space-10` (40px) page margin, max ~1440px.
- A section is: `rule` → `space-10` → `heading-1` → `space-20` → content → `rule`.
- Cards are ~300px wide with a `space-5` gutter and scroll horizontally as a carousel; the first may be cut off by the left edge.
- CTA blocks come in a pair of equal halves (`surface-200` left, `surface-inverse` right), `space-6` apart, ~190px tall, title top-left, arrow top-right.

## Iconography

Thin 1.5px line icons only — a right arrow (→) on CTAs, a magnifier and a three-line menu in the header. Stroke in `ink` or `on-inverse`. No filled or coloured icons, no emoji.

## Voice

Plain, confident, short. Section titles are sentences in sentence case ("What people say about my work"). CTAs are verbs ("Get in touch", "See the work").

## Tokens

All tokens are CSS custom properties defined in `styles.css`.

### Colors

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--paper` | `#ffffff` | `#121314` | Page background. Everything sits on paper; sections are divided by rule hairlines, never by background bands. |
| `--surface-100` | `#f0f0f0` | `#222426` | Notch cards (testimonials, projects, notes). The quiet grey that makes a card read as an object on paper. |
| `--surface-200` | `#d4d4d4` | `#33373a` | Secondary CTA block (the light half of a CTA pair) and the header glass behind the nav. |
| `--surface-inverse` | `#1f2223` | `#f2f2f0` | Primary CTA block — the one heavy, dark slab on a page. Use once per screen. |
| `--ink` | `#1f2223` | `#f2f2f0` | Headings, labels, button text and outlines, on paper, surface-100 or surface-200. 15.9:1 on paper. |
| `--ink-soft` | `#4f5254` | `#b9bcbe` | Long-form text such as card quotes and paragraphs, on paper or surface-100 (7.0:1 on surface-100). |
| `--ink-muted` | `#6b6e70` | `#93979a` | Metadata, dates, captions — on paper or surface-100 only (4.6:1 on surface-100). |
| `--on-inverse` | `#ffffff` | `#1f2223` | Text and arrows on surface-inverse. |
| `--rule` | `#8f9293` | `#4c5053` | 1px section hairlines that run the full content width above each section title and below each section. |
| `--line` | `#1f2223` | `#f2f2f0` | 1px outlines on buttons and icon buttons (an alias-like twin of ink, kept separate so outlines can be softened later). |

### Type styles

Each style is also a class in `styles.css` (e.g. `class="heading-1"`).

| Style | Family | Size | Line height | Weight | Tracking | Usage |
|---|---|---|---|---|---|---|
| `.display` | sans | 88px | 0.95 | 400 | -0.035em | Hero name on the home page only. |
| `.heading-1` | sans | 56px | 1.05 | 400 | -0.025em | Section titles, under a rule. |
| `.cta` | sans | 48px | 1 | 400 | -0.025em | Text inside CTA blocks. |
| `.heading-2` | sans | 28px | 1.15 | 400 | -0.015em | Sub-section titles and project names on detail pages. |
| `.body-lg` | sans | 19px | 1.18 | 400 | 0 | Card quotes and intro paragraphs, in ink-soft. |
| `.body` | sans | 16px | 1.5 | 400 | 0 | Paragraphs and lists. |
| `.button` | sans | 16px | 1 | 400 | 0 | Button and nav labels, sentence or title case. |
| `.label` | mono | 18px | 1.2 | 400 | 0.01em | Card eyebrows, ALWAYS uppercase, in ink. |
| `.caption` | mono | 12px | 1.3 | 400 | 0.06em | Small metadata, uppercase, in ink-muted. |

### Spacing

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Icon-to-text nudges. |
| `--space-2` | 8px | Tight stacks: label to caption. |
| `--space-4` | 16px | Inside CTA blocks. |
| `--space-5` | 20px | Card padding and the gutter between cards. |
| `--space-6` | 24px | Gutter between the two CTA blocks. |
| `--space-10` | 40px | Page side margin; rule to section title. |
| `--space-20` | 80px | Section title to its content; between sections. |

### Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-none` | 0 | Cards, buttons, header — the default. The system is square. |
| `--radius-xs` | 2px | CTA blocks only, a barely-there softening. |
| `--radius-sm` | 4px | Focus rings. |

### Notch

| Token | Value | Usage |
|---|---|---|
| `--notch-lg` | 44px | Full-size cards (300px wide and up). |
| `--notch-sm` | 24px | Small cards and thumbnails. |

### Border

| Token | Value | Usage |
|---|---|---|
| `--hairline` | 1px | Every rule and outline. Nothing is thicker. |

## Components

Class names refer to `styles.css`.

### SiteHeader

A sticky bar floating `space-5` inside the page margin: your name in plain text on the left, the wide outline button and the joined search/menu icon buttons on the right.

Background `surface-200` (optionally slightly translucent with a backdrop blur), the system's only shadow beneath it. No logo mark — the name in `sans` at ~19px is the logo. The consumer provides the name, the button label and the menu.

```html
<header class="ps-header">
    <a class="ps-header__name" href="#">Your Name</a>
    <div class="ps-header__right">
      <button class="ps-btn ps-btn--wide">Get in touch</button>
      <span class="ps-icon-group">
        <button class="ps-icon-btn" aria-label="Search"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="7.5" r="5"/><path d="M7 11l-5 5"/></svg></button>
        <button class="ps-icon-btn" aria-label="Menu"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 5h14M2 9h14M2 13h14"/></svg></button>
      </span>
    </div>
  </header>
```

### SectionHeader

A full-width 1px `rule` hairline with a `heading-1` title `space-10` below it — how every section begins.

Leave `space-20` between the title and the section's content. Titles are sentence-case sentences, regular weight, `ink`. The consumer provides the title text.

```html
<section class="ps-section"><h2 class="ps-section__title">What people say about my work</h2></section>
```

### NotchCard

A grey, square card with its top-right corner clipped at 45° — the signature shape of the system.

Use it for testimonials, projects and short notes. Structure: an uppercase `label` (mono) pinned to the top, and the content (`body-lg` in `ink-soft`, optional `caption` in `ink-muted`) pinned to the bottom, with empty space between. Background `surface-100`, padding `space-5`, corner cut `notch-lg` (`notch-sm` on the small variant). Cards sit in a horizontal row with a `space-5` gutter; it's fine for the row to bleed off either edge.

The consumer provides the label, the text and the width (default 300px). Never add a border, shadow or radius — the cut is the only ornament. Implemented with `clip-path`, so don't put focus outlines on the card itself; put the link inside.

```html
<article class="ps-card">
    <p class="ps-card__label">Northwind Labs</p>
    <div><p class="ps-card__body">"We came in with a rough prototype. Six weeks later we had a product our customers actually asked for by name."</p><p class="ps-card__meta">Head of Product · 2026</p></div>
  </article>
  <article class="ps-card">
    <p class="ps-card__label">Side project</p>
    <p class="ps-card__body">A tiny tool that turns spreadsheets into readable reports, used by about 2,000 people a month.</p>
  </article>
  <article class="ps-card ps-card--sm">
    <p class="ps-card__label">Note</p>
    <p class="ps-card__body">Small variant, notch-sm.</p>
  </article>
```

### CtaBlock

A large, flat, clickable block with a title top-left and a line arrow top-right, used in pairs at the end of a page.

The secondary block uses `surface-200` with `ink`; the primary uses `surface-inverse` with `on-inverse` — only one primary per screen. Title in the `cta` style, padding `space-4`, corners `radius-xs`, min height ~188px, `space-6` between the pair. On hover the arrow slides 6px right; nothing else moves or changes colour. The consumer provides the title and the link.

```html
<a class="ps-cta" href="#"><h3 class="ps-cta__title">See the work</h3><svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 18h29M21 7l11 11-11 11"/></svg></a>
  <a class="ps-cta ps-cta--primary" href="#"><h3 class="ps-cta__title">Get in touch</h3><svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 18h29M21 7l11 11-11 11"/></svg></a>
```

### Button

A square, 40px-tall outline button with a 1px `line` border and a regular-weight `button` label.

There is no filled button: on hover the button inverts to `ink` with `paper` text. Icon buttons are 40×40 squares that join edge to edge (shared border) into a group, with 1.5px line icons. The header's main button is deliberately wide (`ps-btn--wide`, ~390px) — an unusual proportion that's part of the look. The consumer provides the label or icon and its `aria-label`.

```html
<button class="ps-btn ps-btn--wide">Get in touch</button>
  <button class="ps-btn">Résumé</button>
  <span class="ps-icon-group">
    <button class="ps-icon-btn" aria-label="Search"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="7.5" r="5"/><path d="M7 11l-5 5"/></svg></button>
    <button class="ps-icon-btn" aria-label="Menu"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 5h14M2 9h14M2 13h14"/></svg></button>
  </span>
```

## Page skeleton

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Name</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body style="padding: 0 var(--space-10); max-width: 1440px; margin: 0 auto;">
  <!-- SiteHeader -->
  <!-- SectionHeader + row of NotchCards -->
  <!-- CtaBlock pair -->
</body>
</html>
```
