import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { HomeScreen } from "./src/screens/HomeScreen";
import { MatchScreen } from "./src/screens/MatchScreen";
import { ResultScreen } from "./src/screens/ResultScreen";
import { SetupScreen } from "./src/screens/SetupScreen";
import { newMatch, type MatchMode, type MatchState } from "./src/game/match";
import type { KeeperArchetype } from "./src/game/types";
import { SfxProvider, useSfx } from "./src/audio/SfxProvider";
import { I18nProvider, useI18n } from "./src/i18n";
import { displayName, useKeeperNames } from "./src/state/keeperNames";
import { palette } from "./src/theme";

/**
 * Four screens and no deep links, so a discriminated union beats pulling in a
 * navigation library. Revisit if this ever grows a fifth screen or a back stack.
 */
type Screen =
  | { kind: "home" }
  | { kind: "setup"; mode: MatchMode }
  | { kind: "match"; keeper: KeeperArchetype; state: MatchState }
  | { kind: "result"; keeper: KeeperArchetype; state: MatchState };

function Game() {
  const { t } = useI18n();
  const { names, rename } = useKeeperNames();
  const { setMusicActive, setAmbienceActive } = useSfx();
  const [screen, setScreen] = useState<Screen>({ kind: "home" });

  // Music plays in the menus and stops the moment a shootout starts; stadium
  // ambience does the exact opposite. The result screen counts as a menu — it is
  // where you sit and decide to go again.
  useEffect(() => {
    const inMatch = screen.kind === "match";
    setMusicActive(!inMatch);
    setAmbienceActive(inMatch);
  }, [screen.kind, setMusicActive, setAmbienceActive]);

  const startMatch = useCallback(
    (mode: MatchMode, keeper: KeeperArchetype, players: [string, string]) => {
      setScreen({ kind: "match", keeper, state: newMatch(mode, players) });
    },
    [],
  );

  const playAgain = useCallback(() => {
    setScreen((current) => {
      if (current.kind !== "result") return current;
      const { mode, names: players } = current.state;
      return { kind: "match", keeper: current.keeper, state: newMatch(mode, players) };
    });
  }, []);

  return (
    <View style={styles.root}>
      {screen.kind === "home" ? (
        <HomeScreen onPick={(mode) => setScreen({ kind: "setup", mode })} />
      ) : null}

      {screen.kind === "setup" ? (
        <SetupScreen
          mode={screen.mode}
          names={names}
          onRename={rename}
          onStart={(keeper, players) => startMatch(screen.mode, keeper, players)}
          onBack={() => setScreen({ kind: "home" })}
        />
      ) : null}

      {screen.kind === "match" ? (
        <MatchScreen
          keeper={screen.keeper}
          keeperName={displayName(screen.keeper.id, names, t.keepers[screen.keeper.id].name)}
          initialState={screen.state}
          onFinish={(final) => setScreen({ kind: "result", keeper: screen.keeper, state: final })}
          // Abandoning a shootout almost always means "again, but different"
          // rather than "I am done with this app", so this returns to setup
          // rather than all the way to the menu. Setup still has a Back button
          // for actually leaving.
          onQuit={() => setScreen({ kind: "setup", mode: screen.state.mode })}
        />
      ) : null}

      {screen.kind === "result" ? (
        <ResultScreen
          state={screen.state}
          keeper={screen.keeper}
          onPlayAgain={playAgain}
          onChangeKeeper={() => setScreen({ kind: "setup", mode: screen.state.mode })}
        />
      ) : null}
    </View>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <SfxProvider>
        <SafeAreaProvider>
          <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
            <StatusBar style="light" />
            <Game />
          </SafeAreaView>
        </SafeAreaProvider>
      </SfxProvider>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.night },
});
