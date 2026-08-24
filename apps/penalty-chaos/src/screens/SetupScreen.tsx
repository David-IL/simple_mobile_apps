import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "@repo/ui";
import { useSfx } from "../audio/SfxProvider";
import { tauntSfxId } from "../audio/sounds";
import { FormRow } from "../components/FormRow";
import { PlayerBadge } from "../components/PlayerBadge";
import { KeeperFigure } from "../components/art/KeeperFigure";
import { looksFor } from "../components/art/keeperLooks";
import { KEEPERS, TRAIT_IDS, difficultyOf, traitScores } from "../game/keepers";
import type { MatchMode } from "../game/match";
import type { KeeperArchetype } from "../game/types";
import { useI18n } from "../i18n";
import { displayName, sanitiseName, type KeeperNames } from "../state/keeperNames";
import { useLastMatch } from "../state/lastMatch";
import { resolveTakers, usePlayerNames } from "../state/playerNames";
import {
  recentForm,
  recentScored,
  savePercent,
  tallyFor,
  useKeeperRecord,
} from "../state/keeperRecord";
import { palette, spacing, text } from "../theme";

type Props = {
  mode: MatchMode;
  names: KeeperNames;
  onRename: (keeperId: string, name: string) => void;
  onStart: (keeper: KeeperArchetype, players: [string, string]) => void;
  onBack: () => void;
};

/** Where the roster starts before storage has said otherwise. */
const INITIAL_KEEPER_ID = KEEPERS[0]?.id ?? "sunday";

function useDifficultyScale() {
  return useMemo(() => {
    const scores = KEEPERS.map(difficultyOf);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    return (keeper: KeeperArchetype) => {
      const span = max - min || 1;
      return 1 + Math.round(((difficultyOf(keeper) - min) / span) * 4);
    };
  }, []);
}

function KeeperCard({
  keeper,
  label,
  blurb,
  record,
  selected,
  difficulty,
  onPress,
}: {
  keeper: KeeperArchetype;
  label: string;
  blurb: string;
  /** Null until they have actually met. */
  record: string | null;
  selected: boolean;
  difficulty: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.cardPortrait}>
        <KeeperFigure height={44} looks={looksFor(keeper.id)} pose="ready" direction={0} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{label}</Text>
        <Text style={text.muted} numberOfLines={2}>
          {blurb}
        </Text>
      </View>
      <View style={styles.cardRight}>
        {record ? <Text style={styles.cardRecord}>{record}</Text> : null}
        <View style={styles.gloves}>
          {Array.from({ length: 5 }, (_, index) => (
            <View key={index} style={[styles.glove, index < difficulty && styles.gloveOn]} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

export function SetupScreen({ mode, names, onRename, onStart, onBack }: Props) {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState(INITIAL_KEEPER_ID);
  const { last, loaded: lastLoaded } = useLastMatch();
  // Persisted, not local state: leaving this screen and coming back — which is
  // what "Different keeper" and "Give up" both do — used to wipe the names.
  const { names: players, setPlayerName, maxLength } = usePlayerNames();
  const { record } = useKeeperRecord();
  const [renameFocused, setRenameFocused] = useState(false);
  const difficultyOfKeeper = useDifficultyScale();
  const { play } = useSfx();

  const bob = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;

  // A slow idle so the pane feels like it contains someone rather than a
  // diagram. Deliberately not a pose change: poses mean things in a match, and
  // a keeper leaning here would imply a tell that does not exist yet.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  /**
   * A punch and the keeper's own laugh on selection.
   *
   * The sound is doing more than decoration: hearing the same laugh mid-match
   * is what makes a keeper recognisable as *him* rather than as a generic
   * opponent, which is the hook playtesting actually found.
   *
   * Skipped on first render. Arriving at the screen should not fire a laugh
   * nobody asked for — this is feedback for a choice, and on mount no choice
   * has been made.
   */
  const hasSelected = useRef(false);

  /**
   * Open on the last opponent rather than on the first keeper in the roster.
   *
   * This screen used to start at `KEEPERS[0]` every time, which is the easiest
   * keeper — so arriving here always meant scrolling past the rivalry you were
   * actually in. Storage resolves a beat after mount, hence an effect rather
   * than a lazy initial value.
   *
   * `hasSelected` is reset alongside it so the seed does not fire the selection
   * laugh: that sound is feedback for a choice, and nobody chose this one.
   */
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !lastLoaded) return;
    seeded.current = true;
    // This runs once, immediately after mount, so the selection is still the
    // roster default — comparing against that constant rather than against
    // live state keeps the effect out of the business of tracking selections.
    if (!last || last.keeperId === INITIAL_KEEPER_ID) return;
    hasSelected.current = false;
    setSelectedId(last.keeperId);
  }, [lastLoaded, last]);

  useEffect(() => {
    pop.setValue(0.86);
    Animated.spring(pop, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();

    if (!hasSelected.current) {
      hasSelected.current = true;
      return;
    }
    play(tauntSfxId(selectedId));
  }, [selectedId, pop, play]);

  const selected = KEEPERS.find((keeper) => keeper.id === selectedId) ?? KEEPERS[0];
  if (!selected) return null;

  const shippedName = t.keepers[selected.id].name;
  const selectedTally = tallyFor(record, selected.id);
  const selectedSave = savePercent(selectedTally);
  /**
   * The dots actually available, which is not the same as the shots faced.
   *
   * `parseRecord` migrates records written before form existed by keeping the
   * career counters and starting `recent` empty. Sizing the form line off
   * `faced` therefore told a player with forty shots behind him that he had
   * scored "0 of your last 5" — a number that is not merely stale but wrong,
   * and wrong on the one line this screen now leads with. The form guide is
   * held back until there is form to guide with.
   */
  const selectedForm = recentForm(selectedTally);
  const selectedTraits = traitScores(selected);

  const start = () => {
    onStart(
      selected,
      resolveTakers(mode, players, {
        solo: t.match.soloTaker,
        playerOne: t.setup.playerOne,
        playerTwo: t.setup.playerTwo,
      }),
    );
  };

  return (
    <View style={styles.screen}>
      {/*
        The selected keeper stays pinned at the top while the roster scrolls
        underneath.

        It used to sit below eight cards, so choosing a keeper produced no
        visible response at all and the stats had to be scrolled to and
        discovered. A modal would also have fixed that, but it taxes the thing
        the player is actually doing: comparing keepers. He flicks between them
        to see who saves what, and making every comparison cost an open and a
        dismiss is worse than the problem. Pinned costs nothing per comparison.
      */}
      <View style={styles.detail}>
        <View style={styles.detailTop}>
          <Animated.View
            style={[
              styles.detailPortrait,
              {
                transform: [
                  { scale: pop },
                  { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [2, -4] }) },
                ],
              },
            ]}
          >
            <KeeperFigure height={104} looks={looksFor(selected.id)} pose="ready" direction={0} />
          </Animated.View>

          <View style={styles.detailCopy}>
            <Text style={styles.detailName} numberOfLines={1}>
              {displayName(selected.id, names, shippedName)}
            </Text>
            {/*
              Form leads, career follows. A lifetime save percentage stops
              moving once enough shots are in; the last five change every match,
              and that is the number the player is already keeping in his head.
            */}
            {selectedTally.faced === 0 || selectedSave === null ? (
              <Text style={styles.detailSave}>{t.setup.neverFaced}</Text>
            ) : selectedForm.length === 0 ? (
              // A migrated record: career is all there is, so career leads
              // rather than an empty form guide pretending to be five losses.
              <>
                <Text style={styles.detailSave}>{t.setup.savePercent(selectedSave)}</Text>
                <Text style={text.muted}>
                  {t.setup.record(selectedTally.conceded, selectedTally.faced)}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.detailForm}>
                  <FormRow tally={selectedTally} dot={10} />
                  <Text style={styles.detailSave}>
                    {t.form.recent(recentScored(selectedTally), selectedForm.length)}
                  </Text>
                </View>
                <Text style={text.muted}>
                  {`${t.setup.savePercent(selectedSave)} · ${t.setup.record(
                    selectedTally.conceded,
                    selectedTally.faced,
                  )}`}
                </Text>
              </>
            )}
          </View>
        </View>

        {TRAIT_IDS.map((trait) => (
          <View key={trait} style={styles.traitRow}>
            <Text style={styles.traitLabel}>{t.setup.traits[trait]}</Text>
            <View style={styles.traitBar}>
              {Array.from({ length: 10 }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.traitPip,
                    index < Math.round(selectedTraits[trait] * 10) && styles.traitPipOn,
                  ]}
                />
              ))}
            </View>
          </View>
        ))}

        {/*
          The placeholder disappears the moment the field is tapped. Watching an
          11-year-old use this: the greyed-out keeper name reads as text that is
          already there, and the instinct is to backspace it away — which does
          nothing, because a placeholder is not content.
        */}
        <View style={styles.renameRow}>
          <TextInput
            style={[styles.input, styles.renameInput]}
            value={names[selected.id] ?? ""}
            onChangeText={(value) => onRename(selected.id, value)}
            onFocus={() => setRenameFocused(true)}
            onBlur={() => setRenameFocused(false)}
            placeholder={renameFocused ? "" : t.setup.renameLabel}
            placeholderTextColor={palette.chalkDim}
            maxLength={18}
            autoCorrect={false}
          />
          {/* Renaming needs an obvious way back, or a mistake is permanent. */}
          {names[selected.id] ? (
            <Pressable
              onPress={() => onRename(selected.id, "")}
              accessibilityRole="button"
              accessibilityLabel={t.setup.clearName}
              style={styles.clearName}
              hitSlop={8}
            >
              <Text style={styles.clearNameLabel}>×</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/*
          Takers stay above the roster: you sort out who is playing before you
          argue about which keeper to face. Solo gets the same field, singular
          — his own name, remembered the same way the duel takers' names are,
          rather than a fixed "You" nobody can change.
        */}
        <Text style={text.label}>{mode === "duel" ? t.setup.takers : t.setup.yourName}</Text>
        <View style={styles.panel}>
          <View style={styles.takerRow}>
            <PlayerBadge
              name={sanitiseName(players[0]) || (mode === "duel" ? t.setup.playerOne : t.match.soloTaker)}
              player={0}
            />
            <TextInput
              style={[styles.input, styles.takerInput]}
              value={players[0]}
              onChangeText={(value) => setPlayerName(0, value)}
              placeholder={mode === "duel" ? t.setup.playerOne : t.match.soloTaker}
              placeholderTextColor={palette.chalkDim}
              maxLength={maxLength}
              autoCorrect={false}
            />
          </View>
          {mode === "duel" ? (
            <View style={styles.takerRow}>
              <PlayerBadge name={sanitiseName(players[1]) || t.setup.playerTwo} player={1} />
              <TextInput
                style={[styles.input, styles.takerInput]}
                value={players[1]}
                onChangeText={(value) => setPlayerName(1, value)}
                placeholder={t.setup.playerTwo}
                placeholderTextColor={palette.chalkDim}
                maxLength={maxLength}
                autoCorrect={false}
              />
            </View>
          ) : null}
        </View>

        <Text style={text.label}>{t.setup.pickKeeper}</Text>

        <View style={styles.list}>
          {KEEPERS.map((keeper) => (
            <KeeperCard
              key={keeper.id}
              keeper={keeper}
              label={displayName(keeper.id, names, t.keepers[keeper.id].name)}
              blurb={t.keepers[keeper.id].blurb}
              record={(() => {
                const percent = savePercent(tallyFor(record, keeper.id));
                return percent === null ? null : t.setup.savePercent(percent);
              })()}
              selected={keeper.id === selected.id}
              difficulty={difficultyOfKeeper(keeper)}
              onPress={() => setSelectedId(keeper.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={t.setup.start}
          onPress={start}
          color={palette.brand}
          labelColor={palette.brandInk}
        />
        <Button
          label={t.setup.back}
          onPress={onBack}
          color={palette.line}
          labelColor={palette.chalk}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.night },

  detail: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
    backgroundColor: palette.nightSoft,
    // A hard edge plus a shadow, so the pane reads as a fixed layer sitting
    // above the list rather than as the first item in it. On Android elevation
    // also lifts it in the draw order, so the shadow falls across the roster.
    borderBottomWidth: 2,
    borderBottomColor: "#4c3d61",
    elevation: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 2,
  },
  detailTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  detailPortrait: { width: 116, alignItems: "center" },
  detailForm: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  detailCopy: { flex: 1, gap: 1 },
  detailName: { color: palette.chalk, fontSize: 20, fontWeight: "800" },
  detailSave: { color: palette.brand, fontSize: 22, fontWeight: "800" },

  traitRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  traitLabel: { ...text.muted, width: 92 },
  traitBar: { flexDirection: "row", gap: 3, flex: 1 },
  traitPip: { flex: 1, height: 7, borderRadius: 2, backgroundColor: palette.line },
  traitPipOn: { backgroundColor: palette.brand },

  renameRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs },
  renameInput: { flex: 1 },
  clearName: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.line,
  },
  clearNameLabel: { color: palette.chalkDim, fontSize: 20, lineHeight: 22 },

  scroll: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  list: { gap: spacing.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.nightSoft,
  },
  cardSelected: { borderColor: palette.brand, backgroundColor: palette.brandWash },
  cardPortrait: {
    width: 52,
    height: 48,
    alignItems: "center",
    justifyContent: "flex-end",
    borderRadius: 10,
    backgroundColor: "rgba(12,9,17,0.6)",
  },
  cardBody: { flex: 1, gap: 2 },
  cardName: { color: palette.chalk, fontSize: 15, fontWeight: "700" },
  cardRight: { alignItems: "flex-end", gap: spacing.xs },
  cardRecord: { color: palette.brand, fontSize: 12, fontWeight: "700" },
  gloves: { flexDirection: "row", gap: 3 },
  glove: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.line },
  gloveOn: { backgroundColor: palette.save },

  panel: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: palette.nightSoft,
    borderWidth: 1,
    borderColor: palette.line,
  },
  takerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  takerInput: { flex: 1 },
  input: {
    backgroundColor: palette.night,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    color: palette.chalk,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    backgroundColor: palette.nightSoft,
  },
});
