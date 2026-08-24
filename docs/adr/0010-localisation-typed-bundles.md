# 10. Localise with typed message bundles, and keep display copy out of the domain

- **Status:** accepted
- **Date:** 2026-08-21

## Context

`penalty-chaos` is built for an 11-year-old in Norway who reads Norwegian far more comfortably
than English. The first version was English-only, and the comedy — keeper taunts, commentary
headlines, disruption briefs — *is* the product. English-only meant the primary playtester
could not evaluate the thing the app is actually for.

The first version also put that copy in the wrong place. `keepers.ts` held `name`, `blurb` and
`taunts`; `engine.ts` returned finished English sentences as `headline`. The domain layer was
carrying presentation, which only became visible once a second language existed.

## Decision

**No i18n library.** Two hand-written bundles, `src/i18n/en.ts` and `src/i18n/nb.ts`, both
typed against a `Messages` interface, behind a small React context. Norwegian Bokmål is the
default when the device reports `nb`, `nn` or the macro-language `no`.

Three properties are doing the work:

- **Missing translations are a compile error.** `Messages` types keepers, disruptions and
  headlines as `Record<KeeperId, …>`, `Record<DisruptionId, …>` and `Record<HeadlineKey, …>`.
  Add a keeper or a gag and every locale file fails to typecheck until it is translated. No
  runtime key lookups, no silent fallback to a key name on screen.
- **Interpolation is just functions.** `renameNote: (name: string) => string` rather than a
  templating syntax. Type-safe, no parser, and parameters cannot go missing.
- **The domain layer returns keys, not sentences.** `resolveShot` yields
  `headline: "saveGuessed"`; the UI resolves it. `KeeperArchetype` is now pure parameters.

Copy is **written**, not translated line by line. Rendering English football banter literally
into Norwegian is not funny, and the jokes are the product.

## Consequences

- The engine got purer as a side effect. Returning data instead of presentation is what a
  pure module should have done anyway; the second language just made the mistake visible.
- Scales to a third language by copying a file — but it does not scale to *many*. If this ever
  needs plurals, gendered agreement, date/number formatting, or translators who are not us,
  that is the point to adopt a real library rather than grow this one.
- The language toggle sits on the home screen, not in a settings screen. A child who cannot
  read the current language has to be able to find it.
- Interacts with [ADR 8](0008-no-real-person-likenesses-or-club-ip.md): the "shipped name" a
  result card must use is now per-locale. A player's custom keeper name still lives only on
  the device, and result cards still render the shipped name for the current language.
- Locale choice persists in AsyncStorage alongside the keeper names. Still no server, still
  no account.
