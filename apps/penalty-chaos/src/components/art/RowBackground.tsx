import { useCallback, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { SCENE_POSTER, SCENE_VIDEO, type RowScene } from "./rowScenes";

/**
 * A looping backdrop for the row.
 *
 * Three places the row actually happened during the tournament, drawn rather
 * than photographed — which is the whole reason they can ship. Photographs of
 * those crowds would have been someone's copyright, full of identifiable faces,
 * and in Times Square's case full of real billboards too; see the argument in
 * [viking-row.md](../../../../../docs/research/viking-row.md). These are
 * David's own illustrations, so none of that applies, and the flat cartoon
 * style sits with the rest of the app instead of fighting it.
 *
 * **The clips are silent by construction.** The audio track was stripped when
 * they were cut, and `muted` is set as well — a backing track underneath the
 * drum would wreck the one thing this celebration is actually about.
 *
 * ## The poster
 *
 * The player takes roughly a second to produce its first frame, and for that
 * second the row opened onto nothing. So each clip ships with its own first
 * frame as a small JPEG, drawn on top until `onFirstFrameRender` says the video
 * is actually up, then faded out. Because the poster *is* frame one, the
 * handover is invisible rather than a cut — and if the video somehow never
 * loads, the backdrop is a still image rather than a void.
 *
 * ## The scrim
 *
 * Not decoration. The crowd is red on dark and the RO button's ring has to stay
 * readable while it fills; a bright, busy backdrop competes with both. Dimming
 * also renders the fine billboard lettering illegible, which is a quiet second
 * benefit.
 */
export function RowBackground({ scene }: { scene: RowScene }) {
  const poster = useRef(new Animated.Value(1)).current;

  const player = useVideoPlayer(SCENE_VIDEO[scene], (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  const onFirstFrame = useCallback(() => {
    Animated.timing(poster, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [poster]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        nativeControls={false}
        contentFit="cover"
        accessible={false}
        onFirstFrameRender={onFirstFrame}
      />
      <Animated.Image
        source={SCENE_POSTER[scene]}
        style={[styles.poster, { opacity: poster }]}
        resizeMode="cover"
        fadeDuration={0}
      />
      <View style={styles.scrim} />
    </View>
  );
}

const styles = StyleSheet.create({
  poster: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(20,16,28,0.66)",
  },
});
