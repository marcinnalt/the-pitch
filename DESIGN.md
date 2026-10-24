# Design system — StorySpark Local

## Direction

Neo-brutalist, kid-first, built for small hands and big feelings. The interface should look like a
well-loved workbook: flat colour, heavy outlines, sharp corners, hard shadows, things stuck on at a
slight angle. It is deliberately not glossy, not rounded and not corporate.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| `--ink` | `#14110F` | Text, borders, shadows |
| `--milk` | `#FFFDF3` | Page background |
| `--milk-deep` | `#F7EFDA` | Alternate sections, panels |
| `--yellow` | `#FFD22E` | Primary action, highlights, active state |
| `--yellow-soft` | `#FFEAA6` | Hover, gentle emphasis |
| `--white` | `#FFFFFF` | Cards on milk |
| `--tomato` | `#FF5A36` | Warnings, small accents |
| `--sky` | `#7CC7FF` | Illustration accent |
| `--mint` | `#8FE3AE` | Illustration accent |

Milk and yellow carry the layout; tomato, sky and mint stay inside illustrations, tags and small
accents. No gradients, no glass, no soft grey UI.

## Shape and depth

- Borders: `3px solid var(--ink)`, bold variant `4px`.
- Shadows: hard offsets only — `4px 4px 0`, `7px 7px 0`, `12px 12px 0`. No blur.
- Corners: `0` almost everywhere. Pills are not used. Circular shapes appear only inside avatar
  artwork and icon glyphs.
- Rotation: stickers and tags may tilt 1–3°. Cards stay square to the grid.
- Hover: translate up-left by 2px and grow the shadow. Active: translate down-right and remove it.

## Type

- Display: **Archivo Black** — headlines, numbers, buttons, profile names.
- Body: **Space Grotesk** — paragraphs, labels, hints.
- Display sizes use `clamp()`; headings are tight (`line-height: 1.02–1.1`) and sentence case,
  except small uppercase labels with wide tracking.

## Components

### Buttons
`.btn` is a bordered block with a hard shadow. Variants: default (white), `.btn--yellow` (primary),
`.btn--ink` (dark on yellow sections), `.btn--sm`. Arrows sit in `.btn-arrow` and mirror under RTL.

### Tags and chips
`.tag` is a small bordered label. `.tag--yellow` marks the primary fact. Choice chips use
`aria-pressed` and invert to ink when selected. No pills, no rounded capsules.

### Cards
`.lesson`, `.feature`, `.kid-card`, `.quest-card` and `.panel` share the same recipe: white or milk
surface, 3px ink border, offset shadow, square corners. Active profile cards switch to
`--yellow-soft` and gain a hard `ACTIVE` sticker.

### Forms
Inputs and selects are full-width, milk-filled, ink-bordered and square. Focus is a 3px ink outline
with a 2px offset. Labels are uppercase, tracked and small. The dropzone is a dashed ink rectangle.

### Avatars
Eight original cartoon SVGs in `assets/avatars/`: fox, frog, cat, bear, bunny, owl, whale, monster.
They are selected from a grid, never drawn by the child in the profile flow. The studio still lets a
child draw their own hero for a story.

### Quest
The quest uses a side panel (kid, hearts, stars, stop counter, four-step trail) and a large stage
card. Choices are stacked full-width buttons. The end screen lists one lesson line per stop.

### Navigation and footer
Header: brand, text links, one yellow CTA, mobile hamburger. Footer: four columns, oversized
`STORYSPARK` wordmark, short bottom line. No online/offline dots, no status badges.

## Motion

One marquee ticker on the landing page and small reveal transitions. Everything respects
`prefers-reduced-motion: reduce`. No autoplay, no parallax, no looping distraction.

## Accessibility

- Skip link, semantic landmarks, one `h1` per page.
- Visible focus rings on every interactive element.
- `aria-pressed` on chips, avatars and profile selectors.
- Live regions for story, family and quest status messages.
- RTL support for Arabic: `dir="rtl"` on `<html>`, logical spacing, mirrored arrows.
- Text contrast: ink on milk/yellow, white on ink; accent colours are not used for body copy.

## Content rules

- Short sentences. Concrete nouns. No sarcasm, no shame, no score.
- Kids are never asked for a photo, password, location or secret.
- The lesson is shown after a choice, never preached before it.
- Every story and quest ends on a calm, complete beat.
