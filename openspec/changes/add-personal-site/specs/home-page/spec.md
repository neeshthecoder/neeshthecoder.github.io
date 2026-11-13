# Spec Delta

## Purpose

Defines what the site's root page shows and how it behaves: a single-screen introduction with links to project sites, built on the personal-site design system.

## ADDED Requirements

### Requirement: Page identity and metadata
The page SHALL declare `lang="en"`, a responsive viewport meta tag, the title "Avaneesh" and a short meta description, and SHALL use semantic landmarks: a header, a main region and a section for projects.

#### Scenario: Document head
- **WHEN** the page source is inspected
- **THEN** `<html lang="en">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<title>Avaneesh</title>` and a non-empty `<meta name="description">` are present

#### Scenario: Landmarks
- **WHEN** the page is read by assistive technology
- **THEN** it exposes a banner (header), a main region, and a projects section with an accessible name

### Requirement: Name header
The page SHALL show the name "Avaneesh" at the top inside a site header styled as the design system's header (surface-200 background, its single allowed shadow), with no button, search or menu controls.

#### Scenario: Header content
- **WHEN** the page loads
- **THEN** the header shows only the text "Avaneesh" and contains no buttons or icons

### Requirement: Intro paragraph
The page SHALL show the intro paragraph below the header with the exact supplied copy, using typographic apostrophes (’), in the ink-soft colour, at the body-lg style, limited to a reading width of about 40–48 characters.

#### Scenario: Exact copy
- **WHEN** the paragraph text is read
- **THEN** it equals: "Hey, I’m Avaneesh. Started a company called Neuro Safety Systems, am an O’Shaughnessy Fellow, attained a Chemical Engineering B.S. at Johns Hopkins University, and am always looking to improve systems of consequence. I love to break things and artistically steal. This site is my testament to that."
- **AND** it contains no straight apostrophes (')

#### Scenario: Reading width
- **WHEN** the page is viewed at 1440×900
- **THEN** the paragraph line length does not exceed about 48 characters

### Requirement: Project cards
The page SHALL show a projects row pinned to the bottom of the viewport containing one small notch card per project, each with an uppercase label at the top and a single plain text link at the bottom.

#### Scenario: Initial projects
- **WHEN** the page loads
- **THEN** a card labelled "PROJECT 01" links "Gym routine" to `https://neeshthecoder.github.io/gym-routine/`
- **AND** a card labelled "PROJECT 02" links "Library" to `https://neeshthecoder.github.io/library/#/`

#### Scenario: Card appearance
- **WHEN** a card is rendered
- **THEN** it has a surface-100 background, square corners, a 45° top-right notch, and no border or shadow

#### Scenario: Row is not stretched
- **WHEN** the page is viewed at 1280×720 or wider
- **THEN** the two cards keep their own width and visible empty space remains to the right of the second card

### Requirement: Project link styling
Project links SHALL be underlined, in the ink colour, at regular weight, with no button, arrow or icon, and no hover effect other than a subtle change to the underline.

#### Scenario: Link at rest and on hover
- **WHEN** a pointer hovers a project link
- **THEN** only the underline changes (e.g. thickness or offset); colour, weight, size and position do not

### Requirement: Keyboard focus
Each project link SHALL be reachable with the keyboard and show a visible focus ring on the link itself; the card SHALL NOT receive focus or an outline.

#### Scenario: Tabbing through links
- **WHEN** the user presses Tab from the top of the page
- **THEN** focus moves to "Gym routine" and then "Library", each showing a fully visible focus ring that is not clipped by the card's notch

### Requirement: Single-screen fit
The page SHALL fit within the viewport with no vertical or horizontal page scroll at 1440×900, 1280×720 and 390×844, without hiding overflowing content.

#### Scenario: Desktop and phone viewports
- **WHEN** the page is loaded at 1440×900, 1280×720 or 390×844
- **THEN** the document's scroll width equals the viewport width and its scroll height equals the viewport height
- **AND** the header, the whole paragraph and both cards (including their links) are fully visible

#### Scenario: No clipping as a fit strategy
- **WHEN** the page's CSS is inspected
- **THEN** fit is achieved by fluid sizing, not by `overflow: hidden` on the page that cuts off content

### Requirement: Design-system conformance
The page SHALL use only the design system's tokens, fonts (Inter Tight 400, Geist Mono 400) and type-scale sizes; page-specific styles SHALL NOT introduce new colours, shadows, radii or font sizes, and the shared stylesheet SHALL remain unmodified.

#### Scenario: No new values
- **WHEN** the page-specific stylesheet is inspected
- **THEN** every colour, spacing and radius refers to an existing token, and every font size is a type-scale size or a `clamp()` whose bounds are type-scale sizes

#### Scenario: No bold text
- **WHEN** computed styles are inspected
- **THEN** no text renders with a font weight above 400

### Requirement: Light and dark themes
The page SHALL follow the user's colour-scheme preference using the design system's light and dark tokens, keeping the styleguide's text/background pairings in both.

#### Scenario: Dark preference
- **WHEN** the browser prefers a dark colour scheme
- **THEN** the page uses the dark paper, surface and ink tokens, and each text colour sits on a background the styleguide pairs it with

### Requirement: Extensible project row
Adding a project SHALL require only copying one card element in the markup; no CSS change SHALL be needed and the page SHALL NOT gain a page-level scroll as a result.

#### Scenario: Third card added
- **WHEN** a third card is added by copying an existing card in the HTML
- **THEN** it appears in the row with the same size and gutter as the others, with no stylesheet edits
- **AND** if the row exceeds the available width, only the row scrolls horizontally, not the page

### Requirement: No scripts or build
The page SHALL work as static files with no JavaScript, framework or build step.

#### Scenario: Static delivery
- **WHEN** the repository's files are served as-is by a static host
- **THEN** the page renders completely and contains no `<script>` elements
