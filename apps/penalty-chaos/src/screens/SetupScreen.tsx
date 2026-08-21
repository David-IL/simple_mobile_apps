import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@repo/ui";
import { KEEPERS, difficultyOf } from "../game/keepers";
import type { MatchMode } from "../game/match";
import type { KeeperArchetype } from "../game/types";
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
  selected,
  difficulty,
  onPress,
}: {
  keeper: KeeperArchetype;
  label: string;
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
      <View style={[styles.badge, { backgroundColor: keeper.shirt }]}>
        <Text style={styles.badgeText}>{keeper.monogram}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{label}</Text>
        <Text style={text.muted}>{keeper.blurb}</Text>
      </View>
      <View style={styles.gloves}>
        {Array.from({ length: 5 }, (_, index) => (
          <View
            key={index}
            style={[styles.glove, index < difficulty && styles.gloveOn]}
          />
        ))}
      </View>
    </Pressable>
  );
}

export function SetupScreen({ mode, names, onRename, onStart, onBack }: Props) {
  const [selectedId, setSelectedId] = useState(KEEPERS[0]?.id ?? "");
  const [playerOne, setPlayerOne] = useState("Player 1");
  const [playerTwo, setPlayerTwo] = useState("Player 2");
  const difficultyOfKeeper = useDifficultyScale();

  const selected = KEEPERS.find((keeper) => keeper.id === selectedId) ?? KEEPERS[0];
  if (!selected) return null;

  const start = () => {
    if (mode === "solo") {
      onStart(selected, ["You", ""]);
      return;
    }
    onStart(selected, [
      sanitiseName(playerOne) || "Player 1",
      sanitiseName(playerTwo) || "Player 2",
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={text.label}>{mode === "duel" ? "Two players" : "Solo shootout"}</Text>
        <Text style={text.title}>Pick your keeper</Text>

        <View style={styles.list}>
          {KEEPERS.map((keeper) => (
            <KeeperCard
              key={keeper.id}
              keeper={keeper}
              label={displayName(keeper, names)}
              selected={keeper.id === selected.id}
              difficulty={difficultyOfKeeper(keeper)}
              onPress={() => setSelectedId(keeper.id)}
            />
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={text.label}>Call him something else</Text>
          <TextInput
            style={styles.input}
            value={names[selected.id] ?? ""}
            onChangeText={(value) => onRename(selected.id, value)}
            placeholder={selected.name}
            placeholderTextColor={palette.chalkDim}
            maxLength={18}
            autoCorrect={false}
          />
          <Text style={text.muted}>
            Stays on this phone. Nothing leaves the device, and result cards always use{" "}
            {selected.name}.
          </Text>
        </View>

        {mode === "duel" ? (
          <View style={styles.panel}>
            <Text style={text.label}>Takers</Text>
            <TextInput
              style={styles.input}
              value={playerOne}
              onChangeText={setPlayerOne}
              maxLength={14}
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              value={playerTwo}
              onChangeText={setPlayerTwo}
              maxLength={14}
              autoCorrect={false}
            />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Take the penalties" onPress={start} />
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backLabel}>Back</Text>
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
  badge: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: palette.chalk, fontWeight: "800", fontSize: 14 },
  cardBody: { flex: 1, gap: 2 },
  cardName: { color: palette.chalk, fontSize: 15, fontWeight: "700" },
  gloves: { gap: 3 },
  glove: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.line,
  },
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
