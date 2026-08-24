# 9. Use react-native-svg for character art; Skia stays unclaimed

- **Status:** accepted
- **Date:** 2026-08-21

## Context

[ADR 7](0007-game-rendering-approach.md) sets the rendering ladder: layout and `Animated`,
then `react-native-reanimated`, then `@shopify/react-native-skia` when a canvas is genuinely
needed. Building `penalty-chaos` showed a gap in that ladder.

The first playable version drew the keeper as a rounded `View` with two initials on it, and
the pitch invader as an emoji. It worked, and it was the right thing to ship first. But
playtesting produced exactly the feedback the research doc predicted it would need: the
disruptions "need more comedy graphics to get the laugh effect". That is not a polish
complaint — [the research doc's riskiest assumption](../research/penalty-chaos.md) is whether
telegraphed comedic disruptions land as funny rather than unfair, and that assumption cannot
be tested while a badger is the word "badger".

So the app needs actual character art, drawn by someone who is not an illustrator, with no
asset pipeline. The options:

1. **Bitmap assets.** Needs an illustrator or stock art, plus licence review, plus
   `@2x`/`@3x` variants. No illustrator available, and stock art raises the same rights
   questions [ADR 8](0008-no-real-person-likenesses-or-club-ip.md) exists to avoid.
2. **More `View`s.** Characters as nested rounded rectangles. Possible, but limbs, ears and
   grins become a pile of absolutely-positioned views that cannot express a curve.
3. **`react-native-svg`.** Declarative primitives — `Circle`, `Rect`, `Path`, gradients —
   composed as ordinary components, sized by props, animated from outside by `Animated`.
   Confirmed included in Expo Go for SDK 57, so it costs nothing on the dev loop.
4. **Skia.** A real canvas with an off-thread render loop. Nothing here needs one.

## Decision

Adopt `react-native-svg` as the missing middle rung of ADR 7's ladder, for **character and
prop art**. Skia remains unclaimed.

The ladder now reads: layout and `Animated` → `react-native-svg` for shapes that need to be
*drawn* → `react-native-reanimated` for animation that must leave the JS thread → Skia only
when a genuine canvas is required.

The split that keeps this honest: **art components are pure and static.** `KeeperFigure`
takes a `pose` prop and draws it. It never animates itself. All movement stays in the
caller's `Animated` transforms. One deliberate exception is documented in the code — the
mascot's wiggle loop, because a badger that stops dancing is not the joke.

## Consequences

- Character art is versioned, diffable source rather than binary assets, and recolours per
  keeper for free — the roster's eight shirts are one prop.
- Bundle grew from 1.5 MB to 1.7 MB on the Android export. Acceptable.
- SVG is not free at scale: each primitive is a native view. Fine at the ceiling ADR 7 already
  set (one keeper, one ball, one wandering sprite), but a scene wanting dozens of moving
  shapes is the signal to revisit Skia — or, per ADR 7, to change the idea.
- Requires a real-device performance check that has not yet been done for the SVG version.
- Does not reopen the Skia decision. If a future app needs a particle field or a per-frame
  canvas, that is a new ADR, and ADR 7's advice to change the idea instead still stands.
