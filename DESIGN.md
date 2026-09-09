---
name: Party Games
description: A near-black violet room where the games themselves are the only colour.
colors:
  ground: "oklch(0.16 0.032 300)"
  tile: "oklch(0.21 0.035 300)"
  card: "oklch(0.22 0.03 300)"
  raised: "oklch(0.29 0.03 300)"
  ink: "oklch(0.97 0.012 300)"
  ink-muted: "oklch(0.72 0.02 300)"
  violet: "oklch(0.55 0.24 295)"
  violet-ring: "oklch(0.62 0.19 295)"
  hairline: "oklch(1 0 0 / 12%)"
  hairline-soft: "oklch(1 0 0 / 9%)"
  danger: "oklch(0.58 0.22 27)"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  row-heading:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  meta:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1.25rem"
  pill: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  section: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.violet}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "14px 24px"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px 24px"
  phone-frame:
    backgroundColor: "{colors.tile}"
    textColor: "{colors.ink}"
    rounded: "2rem"
    padding: "6px"
---

# Design System: Party Games

## Overview

**Creative North Star: "The Table After Dark"**

A living room with the lights down and one phone glowing in the middle of the
table. The ground is a near-black violet, faintly grained like paper, and it
never competes: the only saturated colour on any surface comes from the games
themselves — a Deeper card burning red, a Would You Rather choice in violet, a
pink Dare. Everything that is not a game is ink on the dark ground, hairlines,
and one violet.

The system is dark-only by use scene, not by category: people play in kitchens,
hostels and bars at night, passing a phone around. Type is Geist throughout,
pushed to 800 for the few things that need to be loud and left at 400 for
everything meant to be read.

**Key Characteristics:**
- Near-black violet ground with a fixed paper grain; no flat paint.
- Colour belongs to content (game screens, tiers, decks), never to chrome.
- One accent — violet — used for the primary action, the focus ring, and the
  wordmark, and nowhere decorative.
- Geist at two extremes: 800 tracked tight for display, 800 tracked wide and
  capped for row headings; 400 for body.
- Depth is a single, soft, offset shadow plus a hairline; the focused object
  comes forward and everything else steps back.

## Colors

One dark violet ramp for surfaces, one violet accent, white ink at two strengths.

### Primary
- **Table Violet** (`oklch(0.55 0.24 295)`): the primary button, the wordmark
  mark, selected states in games. It is the only accent on chrome.
- **Ring Violet** (`oklch(0.62 0.19 295)`): the focus ring, caret, and the
  outline on focused controls — a lighter cousin so it reads on dark surfaces.

### Neutral
- **Room Ground** (`oklch(0.16 0.032 300)`): page background, propagated to
  the canvas; carries the grain.
- **Tile** (`oklch(0.21 0.035 300)`): phone frames on the landing page.
- **Card** (`oklch(0.22 0.03 300)`): shadcn card and popover surfaces.
- **Raised** (`oklch(0.29 0.03 300)`): secondary buttons, muted surfaces.
- **Ink** (`oklch(0.97 0.012 300)`): headings and primary text.
- **Ink Muted** (`oklch(0.72 0.02 300)`): metadata, captions, secondary links.
- **Hairline** (`oklch(1 0 0 / 12%)`, soft variant 9%): borders and dividers.

### Named Rules
**The Only-Colour-Is-Content Rule.** Saturated colour appears only inside game
screens, tier badges and deck art. Chrome is ink, hairline and one violet.

**The One Violet Rule.** Violet is spent on the primary action and the focus
ring. It is never a background wash, a gradient, or a heading colour.

## Typography

**Display Font:** Geist (self-hosted, with system-ui fallback)
**Body Font:** Geist
**Mono Font:** Geist Mono (code and measurements only)

**Character:** one family doing all the work through weight and tracking:
heavy and tight when it speaks, wide and capped when it labels, plain when it
explains.

### Hierarchy
- **Display** (800, `clamp(2rem, 5vw, 4.5rem)`, 0.95, −0.035em): the page hook
  only. Two short sentences, balanced wrapping, no colour.
- **Row heading** (800, 14–16px, +0.08em, uppercase): names an index or a
  list. Sits alone above its content; nothing above it.
- **Title** (700, 16px): a game or deck name under a phone frame or on a card.
- **Body** (400, 16–18px, 1.625): explanatory copy, max ~60ch.
- **Meta** (400, 11–12px): players, minutes, language, counts.

### Named Rules
**The Heading Stands Alone Rule.** No label, kicker or eyebrow above a heading.
The all-caps row heading *is* the label; put metadata beneath, never above.

## Layout

A 72rem (`max-w-6xl`) column with 1rem gutters at phone widths and 1.5rem from
`sm`. The landing page is a sequence of full-width sections divided by hairlines,
each 4–6rem tall in padding; two-column sections split roughly 1:1.15 from
`lg`. Phone frames sit three abreast from `sm` and scroll horizontally with
snap below it (58vw each). Body copy keeps an lg measure.

## Elevation & Depth

Hybrid: tonal layering at rest, one soft shadow that deepens on focus. Every
shadow has offset and blur; there are no hard zero-blur shadows and no glass.

### Shadow Vocabulary
- **Rest** (`0 10px 30px -12px oklch(0 0 0 / 70%)`): tiles and cards on the
  ground.
- **Forward** (`0 30px 60px -24px oklch(0 0 0 / 80%)`):
  phone frames on the landing page.

### Named Rules
**The One Thing Forward Rule.** Depth is spent on the object being shown —
a phone frame, a card in play — and never on chrome around it.

## Shapes

Soft rectangles throughout. Phone frames use 2rem corners, cards 1.25rem; buttons,
inputs and list items 0.75rem; small chips 0.5rem; icon buttons are pills.
Borders are 1px hairlines, never coloured, never thicker than 1px on one side.
The wordmark mark is a 10px square with a 3px violet halo.

## Components

### Buttons
- **Shape:** softly rounded (0.75rem)
- **Primary:** Table Violet ground, white text, 14px × 24px padding, 600 weight
- **Secondary:** Raised ground, Ink text; used for the second of two choices
- **Hover / Focus:** primary darkens slightly; focus is a 2px Ring Violet
  outline offset 3px, never a box-shadow glow
- **Text link:** Ink Muted, underline on hover with 4px offset, turns Ink

### Phone frames (landing)
- **Shape:** 9:18 portrait, 2rem corners, 6px inset bezel, pill notch
- **Background:** Tile, hairline border, Rest shadow deepened to
  `0 30px 60px -24px oklch(0 0 0 / 80%)`
- **Content:** the game's live screen, captioned beneath in Meta
- **Motion:** rise on load (700ms, staggered 90ms by depth); hero frames
  drift apart on scroll via `animation-timeline: scroll(root)` where
  supported; on phones the row scrolls horizontally with snap

### Cards / Containers
- **Corner Style:** 0.75rem–1.25rem
- **Background:** Card; **Border:** hairline; **Padding:** 1rem–1.5rem

### Inputs / Fields
- Hairline stroke at 15% white, Card ground, 0.75rem radius; focus swaps the
  stroke for the Ring Violet outline. Caret and selection are violet.

### Navigation
- Sticky 56px header, ground at 70% with blur (functional, not decorative),
  hairline bottom border; wordmark is the square mark plus "Party Games" at
  700; account actions are a text link and one primary button.

## Do's and Don'ts

### Do:
- **Do** let game screens supply the colour; keep chrome to ink, hairline and
  Table Violet.
- **Do** show the product in phone frames rather than describing it.
- **Do** theme the browser: violet selection, caret, accent-colour, scrollbar
  and focus ring are part of the surface.
- **Do** honour `prefers-reduced-motion`: transitions collapse, scene loops
  stop, the drawn doodle renders complete.

### Don't:
- **Don't** use gradient text, glass as decoration, or zero-blur offset shadows.
- **Don't** put an emoji or a Unicode glyph in the chrome; icons are drawn SVG.
- **Don't** add a label above a heading.
- **Don't** invent evidence — no counts, quotes, logos or press the product
  cannot show.
