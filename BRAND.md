# wobbl brand

How wobbl looks and sounds, for anyone (or any agent) building a page, a deck, a post or a screen. The tokens live in `tailwind.config.js` and `src/index.css`; the logo files are in `brand/`.

## 1. Feel

- **Calm and precise.** wobbl should feel like a measuring tool you'd trust, not a hype-y fitness app. White space, black type, thin rules.
- **The product is the hero.** Every section leans on a real product view or real numbers. If a section has neither, it probably shouldn't exist.
- **Plain and confident.** It talks like a coach who's also good with numbers: what's off, by how much, and what to do.
- **Signature motifs:** the tracked skeleton (bones between joints), the angle arc on a joint with its value, and the red ring on the joint to fix.

## 2. Color

Two colors carry meaning. Everything else is black, white and gray.

| Role | Name | Value | Use | Contrast |
| --- | --- | --- | --- | --- |
| Page | Paper | `#FFFFFF` | Page background, panels | |
| Text | Ink | `#141414` | Text, primary buttons | 18.4:1 on Paper |
| Secondary text | Muted | `#5B5B58` | Captions, labels, targets | 6.8:1 on Paper, 6.2:1 on Mist |
| Border | Rule | `#E5E5E1` | Panel borders, dividers, gridlines | |
| Strong border | Line | `#C9C9C4` | Inputs, secondary buttons, chart baselines | |
| Stage | Mist | `#F4F4F1` | Product illustrations, alternate sections | |
| Video | Screen | `#141414` | Behind live camera video | |
| **Brand** | **Cobalt** | `#2346F5` | Logo, skeleton, links, "in range" marks, focus ring | 6.4:1 on Paper |
| Brand hover | Cobalt deep | `#1A36C4` | Pressed and hover states on cobalt | |
| Brand tint | Cobalt wash | `#EEF1FE` | Selected rows, target zones in charts | |
| **The wobble** | **Signal** | `#D13A22` | Faults only: the joint to fix, a failed check, a slow rep | 4.8:1 on Paper |
| Error tint | Signal wash | `#FCEEEB` | Error message background (text on it is Ink) | |

**Cobalt means tracked or in range. Signal means something is off.** Never use Signal for decoration, emphasis or a "new" badge. Signal text goes on Paper only (it drops to 4.4:1 on Mist).

Drawing on live video needs brighter versions with a dark halo under every line:

| Name | Value | Use |
| --- | --- | --- |
| Bone | `#7D96FF` | Skeleton lines and joint rings on video (6.7:1 on Screen) |
| Fault | `#FF5A3D` | Faulted joints and bones on video (6.0:1 on Screen) |
| Halo | `rgba(0,0,0,0.45)` | 2.5px wider line drawn under each bone |

Illustrations of people use two flat grays: near limbs `#DADAD4`, far limbs `#C9C9C2`, floor `#EAEAE5`. No faces, no skin tones, no photos.

No gradients. No shadows. No third accent color.

## 3. Type

One family: **Archivo** (variable: weight 100 to 900, width 62 to 125), bundled with the site through `@fontsource-variable/archivo`. Headlines are set slightly wide (`font-stretch: 112%`), which is most of the brand's personality.

| Role | Size | Line height | Weight | Width | Tracking |
| --- | --- | --- | --- | --- | --- |
| Hero | 42 to 68px (fluid) | 1.02 | 600 | 112% | -0.03em |
| Section heading | 32 to 48px (fluid) | 1.06 | 600 | 112% | -0.025em |
| Card title | 19 to 24px | 1.3 | 600 | 100 to 112% | -0.01em |
| Lead | 19px | 1.55 | 400 | 100% | 0 |
| Body | 17px | 1.6 | 400 | 100% | 0 |
| UI | 15px | 1.4 | 500 | 100% | 0 |
| Small | 13px | 1.4 | 400 | 100% | 0 |

- Sentence case everywhere. The one exception is the name: **wobbl** is always lowercase, even at the start of a sentence.
- Numbers use tabular figures (`tabular-nums`) so measurements don't jump around.
- No all-caps labels, no monospace, no eyebrow text above every heading.

## 4. Logo

- **Mark:** a lowercase w drawn the way the tracker draws a limb, five joints joined by bones, white on a Cobalt square. `brand/wobbl-mark.svg`, also the favicon.
- **Lockup:** mark plus the wordmark (Archivo 600, width 112%, tracking -0.03em). The gap between them is a quarter of the mark's height. `brand/wobbl-lockup.svg`, and `brand/wobbl-lockup-white.svg` for dark backgrounds.
- **Wordmark alone:** `brand/wobbl-wordmark.svg`, outlined, so it renders the same without the font.
- Smallest mark: 16px. Keep clear space of half the mark's height on every side.
- Don't round the square, recolor the mark, add a shadow, or bring back the old waving mascot.

## 5. Components

**Buttons.** Square, flat, no shadow. Primary: Ink fill, white text, 48px tall (40px small). Secondary: white fill, 1px Line border, border turns Ink on hover. Labels say what happens: "Try wobbl free", "Turn on camera and start", "Download CSV".

**Links.** Cobalt, underlined at 30% opacity, full underline on hover.

**Panels.** White, 1px Rule border, square corners, no shadow. A panel bar is 48px tall with a bottom rule, holding the panel's title on the left and context on the right.

**Segmented control.** A ruled box of square tabs; the selected tab is Ink with white text.

**Status marks.** An 8px square: Cobalt for in range, Signal for off. Always next to a text value, never color alone.

**Inputs.** 48px tall, 1px Line border, border turns Ink on focus.

**Focus.** 2px Cobalt outline, 2px offset, on everything focusable.

**Camera stage.** Live video sits on Screen. Product illustrations sit on Mist, with a wall and a floor.

**Tracking overlay.** Bones 3px with round caps, joints as white dots with a 2.5px colored ring, a 15px ring around a faulted joint, and the drill's main angle drawn as a filled arc with its value in a solid tag (white text on Signal when off, dark text on Bone when in range).

**Charts.** One series in Cobalt; marks that failed in Signal. Solid hairline gridlines in Rule, dashed lines only for targets. One y-axis, never two. Draw charts in real pixels so labels stay readable on phones. Every chart gets hover values or a table next to it.

## 6. Layout

- Content width 1200px (75rem), 12 columns, 40px gutters, 20px side padding on phones and 32px from 640px up.
- Text is left-aligned. Headings sit in the left 4 to 6 columns with the lead paragraph or the product view beside them.
- Sections are separated by a 1px Rule and 96px of padding (128px from 640px up).
- Spacing comes from a 4px base: 4, 8, 12, 16, 20, 24, 32, 40, 56, 64, 96, 128.
- Corner radius is 0 everywhere. The only round things are joints.
- No depth. Hierarchy comes from type size, space and 1px rules.

## 7. Voice

- Say what it measured and what to do: "Bend your front knee more. Knee over your toes."
- Spoken cues are commands, one fix at a time, under 12 words.
- Numbers beat adjectives: "142°, target 135° or less", not "not bent enough".
- Be honest about limits: "It's only as good as what the camera can see."
- No hype words (revolutionary, seamless, unlock, empower), no exclamation marks, no em dashes.

| Do | Don't |
| --- | --- |
| Your form, measured on every rep. | Unlock your full athletic potential with AI. |
| It waits for a pattern before it talks. | Our cutting-edge AI provides real-time insights. |
| Your reps are slowing down. Do one or two more, then rest. | Great job! You're crushing it! |

## 8. Motion

Almost none. The product view crossfades between tabs in 250ms. No scroll-triggered entrances, no hover lifts. Everything respects `prefers-reduced-motion`.

## 9. Do and don't

**Do**
- Lead with a product view or real numbers.
- Keep Signal for faults so it always means something.
- Use one family, and let width and size do the hierarchy.
- Show the measurement next to its target.

**Don't**
- Add shadows, gradients or rounded corners.
- Use stock photos of athletes, or draw faces.
- Put a number on a page that the engine wouldn't produce.
- Use Signal or Cobalt as background fills for large areas (the logo square is the exception).

## 10. Quick reference for agents

```
Background #FFFFFF   Text #141414   Secondary text #5B5B58
Border #E5E5E1       Strong border #C9C9C4   Stage #F4F4F1
Brand (in range, links, skeleton) #2346F5
Fault (only when something is off) #D13A22
Font: Archivo, headlines at font-stretch 112% weight 600, body 17px/1.6
Buttons: square, Ink fill or white with #C9C9C4 border, 48px tall, no shadow
Corners: 0. Shadows: none. Case: sentence case, "wobbl" always lowercase.
```

Prompt to reuse: *Design a wobbl page: white background, Archivo everywhere with headlines set 112% wide at weight 600, near-black text, one cobalt brand color (#2346F5) for anything tracked or in range, a red-orange (#D13A22) only for faults, square flat buttons and panels with 1px light gray borders, no shadows or gradients, generous whitespace, left-aligned text, and a real product view or real numbers in every section. Plain, specific copy in sentence case.*
