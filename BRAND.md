# wobbl brand

How wobbl looks and sounds, for anyone (or any agent) building a page, a deck, a post or a screen. The tokens live in `tailwind.config.js` and `src/index.css`; the logo files are in `brand/`; the painted backdrops are `src/components/Landscape.jsx`.

## 1. Feel

- **Premium and calm.** Big serif headlines, lots of white space, soft rounded cards, and painted skies behind the product. It should feel like a tool made with care, not a hype-y fitness app.
- **The product is the hero.** Every section shows the real app or real numbers. The homepage demo runs the actual coaching engine.
- **Plain and confident.** It talks like a coach who's also good with numbers: what's off, by how much, and what to do.
- **Signature motifs:** the tracked skeleton glowing on a dark stage, a spoken cue floating on glass, the angle arc on a joint, and rolling hills that wobble like the name.

## 2. Color

The page is white and near-black. Color comes from two meaning colors and from the painted backdrops.

| Role | Name | Value | Use | Contrast |
| --- | --- | --- | --- | --- |
| Page | Paper | `#FFFFFF` | Page background, cards | |
| Text | Ink | `#16161B` | Text, dark buttons | 18.0:1 on Paper |
| Secondary text | Muted | `#62626B` | Captions, labels, targets | 6.0:1 on Paper, 5.5:1 on Mist |
| Border | Rule | `#EBEBEF` | Card borders, hairlines | |
| Strong border | Line | `#D6D6DC` | Inputs, chart baselines | |
| Band | Mist | `#F5F5F7` | Quiet bands and inner panels | |
| Dark | Night | `#0C0D12` | Camera stage, founder section | |
| **Brand** | **Cobalt** | `#2346F5` | Logo, main buttons, links, "in range" marks, focus ring | 6.4:1 on Paper |
| Brand hover | Cobalt deep | `#1A36C4` | Hover on cobalt buttons | |
| Brand tint | Cobalt wash | `#EEF1FE` | Selected rows, target zones in charts | |
| On dark | Cobalt light | `#8EA2FF` | Skeleton on the dark stage | 8.1:1 on Night |
| **The wobble** | **Signal** | `#D13A22` | Faults only: the joint to fix, a failed check, a slow rep | 4.8:1 on Paper |
| On dark | Signal bright | `#FF5A3D` | Faults drawn on video or the dark stage | |

**Cobalt means tracked or in range. Signal means something is off.** Never use Signal for decoration or a "new" badge.

### Painted backdrops

Each backdrop is a sky, a low sun, five ridges of rolling hills and film grain, drawn in code. Pick one by time of day:

| Palette | Mood | Used for |
| --- | --- | --- |
| Dusk | Deep blue to peach | Hero |
| Dawn | Lilac and pink | Camera check, closing call to action |
| Day | Clear blue | During the set |
| Ember | Plum to orange | Session report, wobbl Sport |
| Night | Navy and violet | wobbl Music |
| Sage | Soft green | wobbl Posture |

Put product cards on top of backdrops, never text straight on a busy part of one. White text only goes on the dark top of a sky.

## 3. Type

Two families, both bundled with the site:

- **Newsreader** (variable serif with optical sizes) for headlines, big numbers and the founder's letter. Weight 420, tracking -0.02em to -0.03em.
- **Instrument Sans** (variable) for body text, UI, labels and the wordmark.

| Role | Family | Size | Line height | Weight |
| --- | --- | --- | --- | --- |
| Hero | Newsreader | 44 to 88px (fluid) | 0.98 | 420 |
| Section heading | Newsreader | 36 to 60px (fluid) | 1.02 | 420 |
| Title | Newsreader | 24 to 32px | 1.12 | 420 |
| Big number | Newsreader | 80px | 1 | 420 |
| Lead | Instrument Sans | 19px | 1.55 | 400 |
| Body | Instrument Sans | 16px | 1.6 | 400 |
| UI | Instrument Sans | 14 to 15px | 1.4 | 500 |
| Small | Instrument Sans | 12 to 13px | 1.4 | 400 |

- Sentence case everywhere. **wobbl** is always lowercase, even at the start of a sentence.
- Numbers in the product use tabular figures.
- No all-caps labels, no monospace.

## 4. Logo

- **Mark:** a lowercase w drawn the way the tracker draws a limb, five joints joined by bones, white on a cobalt tile with rounded corners (radius 8 on 32). `brand/wobbl-mark.svg`, also the favicon.
- **Lockup:** mark plus the wordmark in Instrument Sans semibold, tracking -0.035em. `brand/wobbl-lockup.svg`, and `brand/wobbl-lockup-white.svg` for dark backgrounds.
- **Wordmark alone:** `brand/wobbl-wordmark.svg`, outlined so it renders without the font.
- Smallest mark: 16px. Clear space: half the mark's height on every side.
- Don't recolor the mark, square off the tile, add effects, or bring back the old mascot.

## 5. Components

**Buttons.** Pills, 44px tall (36px small, 48px in heroes). Main action: Cobalt with a soft blue glow. Dark: Ink. Secondary: white with a Line ring. On a backdrop: glass (white at 20%, blurred, with a white ring).

**Cards.** White, 16px radius for app panels and 24px for marketing cards, a 1px Rule border or a faint ring, and a soft two-layer shadow. Product cards that sit on a backdrop get a stronger lift shadow.

**Glass.** White at 10%, a 20% white ring and a strong blur. Used for chips and the spoken cue on the dark stage.

**Nav.** A floating pill: glass over the hero, white once you scroll.

**Status dots.** 8px circles: Cobalt in range, Signal off. Always next to a text value.

**Camera stage.** Night, with a faint blue glow at the top and a perspective floor grid. The skeleton is Cobalt light with a soft glow; faults turn Signal bright with a ring.

**Charts.** One series in Cobalt, failing marks in Signal, solid hairline gridlines, dashed lines only for targets, one y-axis. Draw in real pixels so labels stay readable on phones.

## 6. Layout

- Content width 1216px (76rem). Side padding 20px on phones, 32px from 640px up.
- Hero and section openers are centered; feature sections put the heading on the left and the product on the right, or a sticky step list beside stacked cards.
- 96px between sections on phones, 128px from 640px up.
- Corners: 999px for buttons and chips, 16px for app panels, 24px for marketing cards and backdrops, 8px for chart bars.

## 7. Voice

- Say what it measured and what to do: "Sit lower. Get your thighs down to parallel."
- Spoken cues are commands, one fix at a time, under 12 words.
- Numbers beat adjectives: "142°, target 135° or less", not "not bent enough".
- Be honest about limits: "It's only as good as what the camera can see."
- No hype words (revolutionary, seamless, unlock, empower), no exclamation marks, no em dashes.

| Do | Don't |
| --- | --- |
| The form coach that watches every rep. | Unlock your full athletic potential with AI. |
| It only talks when a mistake keeps happening. | Our cutting-edge AI provides real-time insights. |
| Your reps are slowing down. Do one or two more, then rest. | Great job! You're crushing it! |

## 8. Motion

- The homepage demo runs live; it pauses when it's off screen.
- The spoken cue fades and slides in over 300ms.
- No scroll-triggered entrances or hover lifts on every card.
- Everything respects `prefers-reduced-motion`: the demo shows one still frame instead.

## 9. Do and don't

**Do**
- Show the real product or real numbers in every section.
- Keep Signal for faults so it always means something.
- Put product cards on painted backdrops; keep the page around them white.
- Show a measurement next to its target.

**Don't**
- Draw people, faces or mascots. The skeleton is the only figure.
- Use stock photos of athletes.
- Put a number on a page that the engine wouldn't produce.
- Use more than one backdrop palette in the same card.

## 10. Quick reference for agents

```
Background #FFFFFF   Text #16161B   Secondary text #62626B
Border #EBEBEF       Band #F5F5F7   Dark stage #0C0D12
Brand (in range, main buttons, links) #2346F5, on dark #8EA2FF
Fault (only when something is off) #D13A22, on dark #FF5A3D
Headlines: Newsreader 420, tight tracking. Body: Instrument Sans 16px/1.6
Buttons: pills. Cards: 16 to 24px radius, soft shadow. Glass on dark or painted areas.
Case: sentence case, "wobbl" always lowercase.
```

Prompt to reuse: *Design a wobbl page: white background with big Newsreader serif headlines and Instrument Sans body text, near-black text, one cobalt brand color (#2346F5) for anything tracked or in range and for the main pill button, a red-orange (#D13A22) only for faults, rounded white cards with soft shadows, product UI floating on painted dusk-sky backdrops with rolling hills and film grain, glass chips on dark areas, generous whitespace, and the real product or real numbers in every section. Plain, specific copy in sentence case.*
