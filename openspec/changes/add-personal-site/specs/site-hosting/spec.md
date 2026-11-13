# Spec Delta

## Purpose

Defines how the personal site is published: as the GitHub Pages user site at the root of `neeshthecoder.github.io`, alongside existing project sites.

## ADDED Requirements

### Requirement: Root-domain publishing
The site SHALL be published from a public GitHub repository named exactly `neeshthecoder.github.io`, with Pages building from the `main` branch root folder, and SHALL be served at `https://neeshthecoder.github.io/`.

#### Scenario: Live root URL
- **WHEN** a browser requests `https://neeshthecoder.github.io/`
- **THEN** it receives the home page with HTTP 200

#### Scenario: Pages source
- **WHEN** the repository's Pages settings are queried
- **THEN** the source is branch `main`, path `/`

### Requirement: Existing project sites unaffected
Publishing the root site SHALL NOT change the URLs or availability of the existing project sites.

#### Scenario: Project sites still resolve
- **WHEN** `https://neeshthecoder.github.io/gym-routine/` and `https://neeshthecoder.github.io/library/` are requested after deployment
- **THEN** each returns HTTP 200 with its own project content

### Requirement: Files served as-is
The site SHALL be served without Jekyll processing, and the public repository SHALL contain only the site files, the styleguide, the README and the project's OpenSpec records, not local tooling directories.

#### Scenario: Jekyll disabled
- **WHEN** the repository root is listed
- **THEN** a `.nojekyll` file is present

#### Scenario: Tooling excluded
- **WHEN** the repository contents are listed
- **THEN** `.claude/` and `.agents/` are absent
