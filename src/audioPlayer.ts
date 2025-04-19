import { audiusSdk } from "./Sdk";
import { useStore } from "./store";

let audio: HTMLAudioElement | null = null;

export const initializeAudioPlayer = () => {
  // Subscribe to store changes
  useStore.subscribe((state) => {
    const { currentTrack, isPlaying } = state;

    if (currentTrack) {
      // Get the track stream URL from Audius
      audiusSdk.tracks
        .getTrackStreamUrl({ trackId: currentTrack.id.toString() })
        .then((streamUrl) => {
          if (streamUrl) {
            if (audio) {
              audio.pause();
              audio = null;
            }

            audio = new Audio(streamUrl);
            audio.addEventListener("ended", () => {
              useStore.getState().setCurrentTrack(null);
            });

            if (isPlaying) {
              audio.play();
            }
          }
        })
        .catch(console.error);
    } else if (audio) {
      audio.pause();
      audio = null;
    }
  });
};
