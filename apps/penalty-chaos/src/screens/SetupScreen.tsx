import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@repo/ui";
import { KeeperFigure } from "../components/art/KeeperFigure";
import { looksFor } from "../components/art/keeperLooks";
import { KEEPERS, difficultyOf } from "../game/keepers";
import type { MatchMode } from "../game/match";
import type { KeeperArchetype } from "../game/types";
import { useI18n } from "../i18n";
import { displayName, sanitiseName, type KeeperNames } from "../state/keeperNames";
import { usePlayerNames } from "../state/playerNames";
import { palette, spacing, text } from "../theme";

type Props = {
  mode: MatchMode;
  names: KeeperNames;
  onRename: (keeperId: string, name: string) => void;
  onStart: (keeper: KeeperArchetype, players: [string, string]) => void;
  onBack: () => void;
};

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
  selected,
  difficulty,
  onPress,
}: {
  keeper: KeeperArchetype;
  label: string;
  blurb: string;
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
      <View style={styles.portrait}>
        <KeeperFigure height={50} looks={looksFor(keeper.id)} pose="ready" direction={0} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{label}</Text>
        <Text style={text.muted}>{blurb}</Text>
      </View>
      <View style={styles.gloves}>
        {Array.from({ length: 5 }, (_, index) => (
          <View key={index} style={[styles.glove, index < difficulty && styles.gloveOn]} />
        ))}
      </View>
    </Pressable>
  );
}

export function SetupScreen({ mode, names, onRename, onStart, onBack }: Props) {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState(KEEPERS[0]?.id ?? "sunday");
  // Persisted, not local state: leaving this screen and coming back — which is
  // what "Different keeper" and "Give up" both do — used to wipe the names.
  const { names: players, setPlayerName, maxLength } = usePlayerNames();
  const [renameFocused, setRenameFocused] = useState(false);
  const difficultyOfKeeper = useDifficultyScale();

  const selected = KEEPERS.find((keeper) => keeper.id === selectedId) ?? KEEPERS[0];
  if (!selected) return null;

  const shippedName = t.keepers[selected.id].name;

  const start = () => {
    if (mode === "solo") {
      onStart(selected, [t.match.soloTaker, ""]);
      return;
    }
    onStart(selected, [
      sanitiseName(players[0]) || t.setup.playerOne,
      sanitiseName(players[1]) || t.setup.playerTwo,
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={text.label}>{mode === "duel" ? t.setup.modeDuel : t.setup.modeSolo}</Text>

        {/*
          Takers first in two-player mode: you sort out who is playing before you
          argue about which keeper to face, and the names are the thing the
          second player wants to change the moment the phone is handed over.
        */}
        {mode === "duel" ? (
          <>
            <Text style={text.title}>{t.setup.takers}</Text>
            <View style={styles.panel}>
              <TextInput
                style={styles.input}
                value={players[0]}
                onChangeText={(value) => setPlayerName(0, value)}
                placeholder={t.setup.playerOne}
                placeholderTextColor={palette.chalkDim}
                maxLength={maxLength}
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                value={players[1]}
                onChangeText={(value) => setPlayerName(1, value)}
                placeholder={t.setup.playerTwo}
                placeholderTextColor={palette.chalkDim}
                maxLength={maxLength}
                autoCorrect={false}
              />
            </View>
          </>
        ) : null}

        <Text style={text.title}>{t.setup.pickKeeper}</Text>

        <View style={styles.list}>
          {KEEPERS.map((keeper) => (
            <KeeperCard
              key={keeper.id}
              keeper={keeper}
              label={displayName(keeper.id, names, t.keepers[keeper.id].name)}
              blurb={t.keepers[keeper.id].blurb}
              selected={keeper.id === selected.id}
              difficulty={difficultyOfKeeper(keeper)}
              onPress={() => setSelectedId(keeper.id)}
            />
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={text.label}>{t.setup.renameLabel}</Text>
          {/*
            The placeholder disappears the moment the field is tapped.

            Watching an 11-year-old use this: the greyed-out keeper name reads as
            text that is already there, and the instinct is to backspace it away
            — which does nothing, because a placeholder is not content. Clearing
            it on focus means tapping the field gives you exactly what it looks
            like: somewhere empty to type.

            The alternative was prefilling the real name as a value so backspace
            genuinely works. Rejected: it erases the difference between "no
            custom name" and "custom name that happens to match", and it stops
            the field following a language switch.
          */}
          <View style={styles.renameRow}>
            <TextInput
              style={[styles.input, styles.renameInput]}
              value={names[selected.id] ?? ""}
              onChangeText={(value) => onRename(selected.id, value)}
              onFocus={() => setRenameFocused(true)}
              onBlur={() => setRenameFocused(false)}
              placeholder={renameFocused ? "" : shippedName}
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
          <Text style={text.muted}>{t.setup.renameNote(shippedName)}</Text>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={t.setup.start}
          onPress={start}
          color={palette.brand}
          labelColor={palette.brandInk}
        />
        {/*
          A full-width secondary button rather than a small underlined link.
          Leaving setup costs nothing — no match is in progress and the names
          are remembered — so there was never a reason to make it hard to hit.
          It was small because it had been styled as an afterthought, and that
          is not a safety measure, it is just hard to find.
        */}
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
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  list: { gap: spacing.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.nightSoft,
  },
  cardSelected: { borderColor: palette.brand, backgroundColor: palette.brandWash },
  portrait: {
    // Wide enough for the keeper's canvas, which is sized for a dive.
    width: 58,
    height: 56,
    alignItems: "center",
    justifyContent: "flex-end",
    borderRadius: 10,
    backgroundColor: "rgba(12,9,17,0.6)",
  },
  cardBody: { flex: 1, gap: 2 },
  cardName: { color: palette.chalk, fontSize: 15, fontWeight: "700" },
  gloves: { gap: 3 },
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
  renameRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
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
