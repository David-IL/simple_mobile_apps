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
        <KeeperFigure width={38} height={58} looks={looksFor(keeper.id)} pose="ready" direction={0} />
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
  const [playerOne, setPlayerOne] = useState("");
  const [playerTwo, setPlayerTwo] = useState("");
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
      sanitiseName(playerOne) || t.setup.playerOne,
      sanitiseName(playerTwo) || t.setup.playerTwo,
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={text.label}>{mode === "duel" ? t.setup.modeDuel : t.setup.modeSolo}</Text>
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
          <TextInput
            style={styles.input}
            value={names[selected.id] ?? ""}
            onChangeText={(value) => onRename(selected.id, value)}
            placeholder={shippedName}
            placeholderTextColor={palette.chalkDim}
            maxLength={18}
            autoCorrect={false}
          />
          <Text style={text.muted}>{t.setup.renameNote(shippedName)}</Text>
        </View>

        {mode === "duel" ? (
          <View style={styles.panel}>
            <Text style={text.label}>{t.setup.takers}</Text>
            <TextInput
              style={styles.input}
              value={playerOne}
              onChangeText={setPlayerOne}
              placeholder={t.setup.playerOne}
              placeholderTextColor={palette.chalkDim}
              maxLength={14}
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              value={playerTwo}
              onChangeText={setPlayerTwo}
              placeholder={t.setup.playerTwo}
              placeholderTextColor={palette.chalkDim}
              maxLength={14}
              autoCorrect={false}
            />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button label={t.setup.start} onPress={start} />
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backLabel}>{t.setup.back}</Text>
        </Pressable>
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
  cardSelected: { borderColor: palette.accent, backgroundColor: "#16233a" },
  portrait: {
    width: 46,
    height: 60,
    alignItems: "center",
    justifyContent: "flex-end",
    borderRadius: 10,
    backgroundColor: "rgba(15,23,42,0.6)",
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
  back: { alignSelf: "center", padding: spacing.sm },
  backLabel: { color: palette.chalkDim, fontSize: 13, textDecorationLine: "underline" },
});
