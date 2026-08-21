# Images

| File | Used for | Source | Licence |
| --- | --- | --- | --- |
| `app-banner-vertical-en.jpg` | Home screen, full-screen background | *fill in* | *fill in* |
| `app-banner-no.jpg` | **Unused by the app.** Landscape; keep for the 1024×500 Play feature graphic | *fill in* | *fill in* |
| `app-banner-en.jpg` | **Unused by the app.** Same | *fill in* | *fill in* |
| `icon.png`, `splash-icon.png`, `android-icon-*` | Expo defaults, not yet replaced | Expo | — |

## Outstanding: no Norwegian vertical

`app-banner-vertical-no.jpg` does not exist yet, so **both languages currently
show the English artwork**. That is a deliberate preview state and must not
ship — a Norwegian player seeing an English title is exactly the failure the
typed locale map is meant to prevent, and here the type cannot help because both
entries point at a real file. One line in `HomeScreen.tsx` fixes it once the art
exists.

The landscape pair is kept rather than deleted: Play wants a 1024×500 feature
graphic, which is landscape, and cropping the vertical art to that ratio would
destroy the composition.

## The banners

**All were resized on the way in.** The landscape pair went from 2816×1536
(~3.2 MB each) to 1280×698 (~215 KB); the vertical from 1536×2752 (3.4 MB) to
1080×1935 (~450 KB).
A phone hero is about 400dp wide, so at 3× density 1200px is the most any screen
will ask for — the originals were roughly seven times that, and 6.5 MB of title
art on a 1.8 MB JavaScript bundle is not a trade worth making. Masters are *not*
in the repo; keep them somewhere outside it, because once a 3 MB file is
committed it is in git history for good.

**The wordmark is baked into the image**, which is a real trade-off worth
remembering rather than rediscovering:

- The title no longer comes from `src/i18n`. A third language needs a third
  picture, not a third string.
- Mitigated by typing the map as `Record<Locale, …>` in `HomeScreen.tsx`: add a
  locale and the build fails until the artwork exists, which preserves the
  compile-time guarantee [ADR 10](../../../docs/adr/0010-localisation-typed-bundles.md)
  exists for.
- The `accessibilityLabel` still comes from `src/i18n`, because a picture of a
  word is not a word.

**Provenance is not recorded.** If these were generated or commissioned, write
down how and under what terms. And per
[ADR 8](../../../docs/adr/0008-no-real-person-likenesses-or-club-ip.md): the art
must not depict a real player, a real club crest, or a real kit. The taker's
red-and-white stripes are generic enough, and the Norwegian flags in the crowd
are a national flag rather than a brand — but if any element was prompted from
or traced off a specific club or person, that needs checking.
