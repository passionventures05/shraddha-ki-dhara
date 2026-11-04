# Launch ceremony

What visitors see, in order:

1. **Curtains and countdown.** The emblem and "Grand Launch" sit above the gold ribbon; a copper kalash stands in front.
2. **The ribbon is cut** (automatically at launch time on the live site; by tapping on your own laptop).
3. **Ritual.** The kalash fades away. A coconut drops from between the curtains, cracks, the halves lift and tip towards the viewer, and the water splashes across the screen. After about two seconds the water dries away.
4. **The curtains open under a rain of flowers** (marigold, rose, jasmine).
5. **The deities appear one at a time**: Ganesh ji, Lakshmi ji, Saraswati Maa, Kuber ji, Durga Maa. An aarti thali circles in front of them the whole time. Gold coins slip from Durga Maa's lower right hand and flowers are showered from her raised blessing hand at the end. The thali moves in a large clockwise circle, like an aarti.
6. **The website scrolls steadily to the bottom and back to the top** at a moderate, readable pace (about 300 px/s going down, 520 px/s coming back). Touching or scrolling stops it.

It plays **once per device**. Visitors who arrive more than `lateGraceMinutes` (src/lib/launch.ts, default 60) after the launch time go straight to the website. A **Skip** button (and the Escape key) is always available during the ritual and the show. People who have "reduce motion" turned on get a quiet version: the curtains simply open.

Total length is about 48 seconds, plus the scroll tour (about a minute in total, depending on how long the page is).

## Where things are

| What | File |
|---|---|
| Launch date, heading, late-visitor window | `src/lib/launch.ts` |
| Order of events and **every timing** | `src/lib/ceremony.ts` |
| Curtains, ribbon, countdown styling | `src/styles/launch.css` |
| Kalash, coconut, deities, thali styling | `src/styles/stage.css` |
| The sequence itself | `src/components/CeremonyStage.tsx`, `LaunchCeremony.tsx` |
| Falling flowers, coins, water splashes, scroll tour | `src/lib/fall.ts` |

Deities and the emblem are in `public/ceremony/`. Test without waiting: `/?launch=2026-11-01T18:00`, `/?replay`, `/?studio` (see the top of `src/lib/launch.ts`).

## The pictures

Everything is in `public/ceremony/`:

| File | What it is |
|---|---|
| `emblem.webp` | the logo on the curtains |
| `kalash.webp` | copper kalash standing in front of the curtains |
| `nut-whole.webp` | the coconut that falls |
| `nut-left.webp`, `nut-right.webp` | the two halves (separate files) |
| `thali.webp` | the aarti thali |
| `deities/ganesh.webp`, `lakshmi`, `saraswati`, `kuber`, `durga` | the five deities (720 x 1080 px) |

To change one, replace the file with the same name (transparent WebP). Falling flowers, petals and coins are drawn in code.

**If a picture is ever missing on the live site** the ceremony does not break: a missing deity shows its name in gold instead, a missing kalash/coconut/thali is replaced by a drawn stand-in, and the browser console (F12) says `[ceremony] could not load /ceremony/...`. A test (`npm test`) also fails if any of these files is missing from the project, so a deploy that is missing them is stopped before it goes live.

To change the order or add a deity, edit `DEITIES` in `src/lib/ceremony.ts` and add its picture.

## Changing the timing

Open `src/lib/ceremony.ts`. For example `deityHold` is how long each deity stays fully visible, `waterHold` is how long the water stays after the last splash, and `tourSpeedDown` / `tourSpeedUp` set the scroll tour speed in pixels per second (lower is slower). If you change `cut`, `open` or `fade`, change the matching `--lc-*-ms` values at the top of `launch.css` too (a test fails if they drift apart).
