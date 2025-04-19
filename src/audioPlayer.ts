import { audiusSdk } from "./Sdk";
import { useStore, PlaybackState } from "./store";

let audio: HTMLAudioElement | null = null;
let unsubscribe: (() => void)[] = [];
let currentTrackId: string | null = null;

export const initializeAudioPlayer = () => {
  // Clean up any existing subscriptions
  unsubscribe.forEach((fn) => fn());
  unsubscribe = [];

  // Subscribe to track changes
  const trackUnsubscribe = useStore.subscribe((state) => {
    const currentTrack = state.currentTrack;
    if (currentTrack) {
      // Only fetch new stream URL if the track ID has changed
      if (currentTrackId !== currentTrack.id.toString()) {
        currentTrackId = currentTrack.id.toString();

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

              // Handle time updates
              audio.addEventListener("timeupdate", () => {
                if (audio) {
                  useStore.getState().setCurrentTime(audio.currentTime);
                }
              });

              // Handle track end
              audio.addEventListener("ended", () => {
                useStore.getState().setCurrentTrack(null);
              });

              // Set initial duration
              audio.addEventListener("loadedmetadata", () => {
                if (audio) {
                  useStore.getState().setDuration(audio.duration);
                }
              });

              // Handle errors
              audio.addEventListener("error", (e) => {
                console.error("Audio error:", e);
                useStore.getState().setCurrentTrack(null);
              });
            }
          })
          .catch(console.error);
      }
    } else if (audio) {
      currentTrackId = null;
      audio.pause();
      audio = null;
    }
  });

  // Subscribe to playback state changes
  const playbackUnsubscribe = useStore.subscribe((state) => {
    if (audio) {
      if (state.playbackState === PlaybackState.SONG_PLAYING) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
    }
  });

  // Subscribe to current time changes (for seeking)
  const seekUnsubscribe = useStore.subscribe((state) => {
    if (audio && state.currentTime !== audio.currentTime) {
      audio.currentTime = state.currentTime;
    }
  });

  unsubscribe = [trackUnsubscribe, playbackUnsubscribe, seekUnsubscribe];
};
