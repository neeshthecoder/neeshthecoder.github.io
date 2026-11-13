# Spec Delta

## Purpose

Defines what the site's root page shows and how it behaves: a single-screen introduction with links to project sites, built on the personal-site design system.

## ADDED Requirements

### Requirement: Flow animation panel
On viewports 820px wide or wider, the page SHALL show an animated field of monospace characters in a panel to the right of the existing content. The panel SHALL be decorative only: hidden from assistive technology, not focusable, and drawn in colours from the design system so it follows light and dark mode.

#### Scenario: Panel on desktop
- **WHEN** the page loads at 1440×900 or 1280×720 with scripts enabled
- **THEN** a flowing character animation is visible to the right of the name, intro and project cards

#### Scenario: Assistive technology
- **WHEN** the page is read by a screen reader or navigated by keyboard
- **THEN** the panel is not announced and receives no focus

#### Scenario: Reduced motion
- **WHEN** the browser prefers reduced motion
- **THEN** the panel shows a still frame and does not animate

#### Scenario: No scripts
- **WHEN** JavaScript is disabled
- **THEN** the panel area is blank and the rest of the page shows and works as before

### Requirement: Two-column layout on wide screens
At 820px wide or wider the page SHALL be a two-column grid inside the existing outer margin: the left column holds the name, intro paragraph and project cards, and a slightly wider right column (about 1.15 times the left) holds the flow panel at the full available height.

#### Scenario: Column arrangement
- **WHEN** the page is viewed at 1440×900
- **THEN** the name, intro and project cards sit in the left column, the flow panel fills the right column from the top margin to the bottom margin, and the right column is wider than the left

#### Scenario: Left column unchanged
- **WHEN** the page is viewed at 1440×900 or 1280×720
- **THEN** the name, intro copy, card labels, card links and their styling are the same as before the panel was added

### Requirement: Single column on narrow screens
Below 820px wide the page SHALL use the single-column layout and SHALL NOT show the flow panel.

#### Scenario: Phone
- **WHEN** the page is viewed at 390×844
- **THEN** no flow panel is visible and the name, intro and project cards appear exactly as before this change

#### Scenario: Breakpoint
- **WHEN** the viewport is resized from 819px to 820px wide
- **THEN** the flow panel appears, and it disappears again at 819px

### Requirement: Fits one viewport with the panel
Adding the flow panel SHALL NOT make the page scroll at the reference viewport sizes.

#### Scenario: Reference sizes
- **WHEN** the page is viewed at 1440×900, 1280×720 or 390×844
- **THEN** the document is no taller and no wider than the viewport

#### Scenario: Window resize
- **WHEN** the window is resized while the animation runs
- **THEN** the panel resizes with its column and never grows the page beyond the viewport
