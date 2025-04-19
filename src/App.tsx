import { useEffect, useState, useCallback, useRef } from "react";
import AudiusGlyph from "./assets/audius_glyph.svg";
import { useStore, PlaybackState, Track } from "./store";
import {
  fetchFeelingLuckyTracks,
  fetchTrendingTracks,
  fetchUndergroundTracks,
  getStreamUrl,
} from "./sdk";
import Login from "./Login";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { QueueView } from "./components/QueueView";

interface ContextMenuProps {
  track: Track;
  position: { x: number; y: number };
  onClose: () => void;
  setAudioSource: (source: string | null) => void;
  setCurrentTime: (time: number) => void;
}

const ContextMenu = ({
  track,
  position,
  onClose,
  setAudioSource,
  setCurrentTime,
}: ContextMenuProps) => {
  const {
    setSelectedArtist,
    setSelectedGenre,
    setCurrentTrack,
    setPlaybackState,
    addToQueue,
  } = useStore();
  const [, setIsHovered] = useState(false);

  const handleViewArtist = () => {
    setSelectedArtist(track.artist);
    onClose();
  };

  const handleViewGenre = () => {
    setSelectedGenre(track.genre);
    onClose();
  };

  const handlePlay = () => {
    setCurrentTrack(track);
    setAudioSource(null); // Reset audio source to trigger new URL fetch
    setCurrentTime(0);
    setPlaybackState(PlaybackState.SONG_PLAYING);
    onClose();
  };

  const handleAddToQueue = () => {
    addToQueue(track);
    onClose();
  };

  return (
    <div
      className="fixed z-50 p-6"
      style={{ top: position.y - 24, left: position.x - 24 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        onClose();
      }}
    >
      <div
        className="bg-white dark:bg-zinc-800 shadow-lg rounded-md py-2 border border-zinc-200 dark:border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-4 py-2 hover:bg-[#E6C7FF] dark:hover:bg-zinc-700 cursor-pointer text-zinc-800 dark:text-zinc-200"
          onClick={handlePlay}
        >
          Play
        </div>
        <div
          className="px-4 py-2 hover:bg-[#E6C7FF] dark:hover:bg-zinc-700 cursor-pointer text-zinc-800 dark:text-zinc-200"
          onClick={handleAddToQueue}
        >
          Add to Queue
        </div>
        <div
          className="px-4 py-2 hover:bg-[#E6C7FF] dark:hover:bg-zinc-700 cursor-pointer text-zinc-800 dark:text-zinc-200"
          onClick={handleViewArtist}
        >
          View Artist: {track.artist}
        </div>
        <div
          className="px-4 py-2 hover:bg-[#E6C7FF] dark:hover:bg-zinc-700 cursor-pointer text-zinc-800 dark:text-zinc-200"
          onClick={handleViewGenre}
        >
          View Genre: {track.genre}
        </div>
        <div className="px-4 py-2 hover:bg-[#E6C7FF] dark:hover:bg-zinc-700 cursor-pointer text-zinc-800 dark:text-zinc-200">
          Add to Playlist
        </div>
        <div className="px-4 py-2 hover:bg-[#E6C7FF] dark:hover:bg-zinc-700 cursor-pointer text-zinc-800 dark:text-zinc-200">
          Share
        </div>
      </div>
    </div>
  );
};

const ScrollingText = ({
  text,
  isPlaying,
}: {
  text: string;
  isPlaying: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const textWidth = textRef.current.offsetWidth;
    setShouldScroll(textWidth > containerWidth);
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden whitespace-nowrap w-[75%] mx-auto"
    >
      <div
        ref={textRef}
        className={`inline-block ${
          shouldScroll && isPlaying ? "animate-scroll" : ""
        }`}
      >
        {shouldScroll && isPlaying ? (
          <>
            {text}
            <span className="mx-4">•</span>
            {text}
            <span className="mx-4">•</span>
            {text}
            <span className="mx-4">•</span>
            {text}
            <span className="mx-4">•</span>
            {text}
          </>
        ) : (
          text
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [contextMenu, setContextMenu] = useState<{
    track: Track;
    position: { x: number; y: number };
  } | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(
    new Set(["discover"])
  );

  const {
    filterState,
    setSelectedSource,
    setSelectedGenre,
    setSelectedArtist,
    setSelectedAlbum,
    toggleSort,
    getFilteredTracks,
    getUniqueGenres,
    getUniqueArtists,
    getUniqueAlbums,
    getUserState,
    sources,
    currentTrack,
    playbackState,
    currentTime,
    duration,
    setCurrentTrack,
    setPlaybackState,
    setCurrentTime,
    setDuration,
    volume,
    setVolume,
    showQueue,
    toggleQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    queue,
    currentQueueIndex,
    toggleLoop,
    toggleShuffle,
    loop,
    shuffle,
    isDark,
    toggleTheme,
  } = useStore();

  const [localVolume, setLocalVolume] = useState(0.7);

  const audioPlayerRef = useRef<AudioPlayer>(null);

  const [audioSource, setAudioSource] = useState<string | null>(null);

  // Debounced volume update
  const debouncedSetVolume = useCallback(
    (newVolume: number) => {
      setLocalVolume(newVolume);
      const timeoutId = setTimeout(() => {
        setVolume(newVolume);
      }, 100); // 100ms debounce
      return () => clearTimeout(timeoutId);
    },
    [setVolume]
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const shuffleQueue = (tracks: Track[], startFromTrack?: Track) => {
    if (!tracks.length) return tracks;

    // If we have a startFromTrack, find its index and split the array
    if (startFromTrack) {
      const startIndex = tracks.findIndex((t) => t.id === startFromTrack.id);
      if (startIndex !== -1) {
        // Split the array into two parts: before and after the start track
        const beforeStart = tracks.slice(0, startIndex);
        const afterStart = tracks.slice(startIndex + 1);

        // Shuffle both parts
        const shuffledBefore = [...beforeStart].sort(() => Math.random() - 0.5);
        const shuffledAfter = [...afterStart].sort(() => Math.random() - 0.5);

        // Combine them with the start track in the middle
        return [startFromTrack, ...shuffledAfter, ...shuffledBefore];
      }
    }

    // If no start track or not found, just shuffle the whole array
    return [...tracks].sort(() => Math.random() - 0.5);
  };

  const handleTrackClick = (track: Track) => {
    // Only clear queue if we're starting a new playback sequence
    if (playbackState === PlaybackState.NO_SONG_SELECTED) {
      clearQueue();
    }

    // Get all tracks from the current source
    const allTracks = getFilteredTracks();

    // Find the index of the clicked track
    const trackIndex = allTracks.findIndex((t) => t.id === track.id);

    // Get tracks after the clicked track
    const tracksAfter = allTracks.slice(trackIndex + 1);
    // Get tracks before the clicked track
    const tracksBefore = allTracks.slice(0, trackIndex);

    // Combine all tracks in order: clicked track, tracks after, tracks before
    const queueTracks = [track, ...tracksAfter, ...tracksBefore];

    // If shuffle is on, shuffle the queue starting from the clicked track
    const finalQueueTracks = shuffle
      ? shuffleQueue(queueTracks, track)
      : queueTracks;

    // Add all tracks to the queue
    finalQueueTracks.forEach((t) => addToQueue(t));

    // Set the clicked track as current and start playing
    setCurrentTrack(track);
    setAudioSource(null);
    setCurrentTime(0);
    setPlaybackState(PlaybackState.SONG_PLAYING);
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playbackState === PlaybackState.NO_SONG_SELECTED) return;

    const scrubber = e.currentTarget;
    const rect = scrubber.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    const newTime = Math.floor(duration * percentage);

    setCurrentTime(newTime);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.audio.current.currentTime = newTime;
    }
  };

  const togglePlayback = () => {
    if (playbackState === PlaybackState.NO_SONG_SELECTED && queue.length === 0)
      return;

    if (playbackState === PlaybackState.NO_SONG_SELECTED && queue.length > 0) {
      // Start playing the first track in the queue
      const nextTrack = queue[0];
      setCurrentTrack(nextTrack);
      setAudioSource(null); // Reset audio source to trigger new URL fetch
      setCurrentTime(0);
      setPlaybackState(PlaybackState.SONG_PLAYING);
      removeFromQueue(0); // Remove the track that just started playing
    } else {
      if (playbackState === PlaybackState.SONG_PLAYING) {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.audio.current.pause();
        }
        setPlaybackState(PlaybackState.SONG_PAUSED);
      } else {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.audio.current.play();
        }
        setPlaybackState(PlaybackState.SONG_PLAYING);
      }
    }
  };

  // Fetch trending tracks on startup
  useEffect(() => {
    fetchTrendingTracks();
    fetchUndergroundTracks();
    fetchFeelingLuckyTracks();
  }, []);

  // Fetch tracks when source changes
  useEffect(() => {
    setSelectedGenre(null);
    setSelectedArtist(null);
    setSelectedAlbum(null);
  }, [
    filterState.selectedSource,
    setSelectedGenre,
    setSelectedArtist,
    setSelectedAlbum,
  ]);

  useEffect(() => {
    if (currentTrack && !audioSource) {
      getStreamUrl(currentTrack.id)
        .then((streamUrl) => {
          setAudioSource(streamUrl);
          if (audioPlayerRef.current) {
            audioPlayerRef.current.audio.current.src = streamUrl;
            if (playbackState === PlaybackState.SONG_PLAYING) {
              audioPlayerRef.current.audio.current.play();
            }
          }
        })
        .catch((error) => {
          console.error("Failed to get stream URL:", error);
        });
    }
  }, [currentTrack, playbackState, audioSource]);

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.audio.current.volume = volume;
    }
  }, [volume]);

  const fontClass = 'font-["Lucida_Grande","Tahoma",sans-serif]';

  const handleContextMenu = (e: React.MouseEvent, track: Track) => {
    e.preventDefault();
    setContextMenu({
      track,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleSourceDoubleClick = (sourceId: string) => {
    setExpandedSources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId);
      } else {
        newSet.add(sourceId);
      }
      return newSet;
    });
  };

  // Update expanded sources when user logs in
  useEffect(() => {
    const userState = getUserState();
    if (userState) {
      setExpandedSources((prev) => {
        const newSet = new Set(prev);
        newSet.add("library");
        return newSet;
      });
    } else {
      // When logged out, collapse library
      setExpandedSources((prev) => {
        const newSet = new Set(prev);
        newSet.delete("library");
        return newSet;
      });
    }
  }, [getUserState, getUserState()]);

  return (
    <div
      className={`${fontClass} h-screen flex flex-col ${isDark ? "dark" : ""}`}
      onClick={() => setContextMenu(null)}
    >
      {/* Hidden audio player */}
      <AudioPlayer
        ref={audioPlayerRef}
        style={{ display: "none" }}
        onPlay={() => {
          if (audioPlayerRef.current) {
            setCurrentTime(audioPlayerRef.current.audio.current.currentTime);
          }
          setPlaybackState(PlaybackState.SONG_PLAYING);
        }}
        onPause={() => {
          if (audioPlayerRef.current) {
            setCurrentTime(audioPlayerRef.current.audio.current.currentTime);
          }
          setPlaybackState(PlaybackState.SONG_PAUSED);
        }}
        onEnded={() => {
          const { loop, queue } = useStore.getState();

          if (queue[0]) {
            // If we have a next track in queue, play it
            if (loop && currentTrack) {
              // If loop is enabled, add current track back to queue
              addToQueue(currentTrack);
            }
            setCurrentTrack(queue[0]);
            setAudioSource(null);
            setCurrentTime(0);
            setPlaybackState(PlaybackState.SONG_PLAYING);
            removeFromQueue(0);
          } else if (loop && currentTrack) {
            // If no next track but loop is enabled, add current track back and play it
            addToQueue(currentTrack);
            setCurrentTrack(currentTrack);
            setAudioSource(null);
            setCurrentTime(0);
            setPlaybackState(PlaybackState.SONG_PLAYING);
            removeFromQueue(0);
          } else {
            // No more tracks and loop is disabled
            setCurrentTrack(null);
            setPlaybackState(PlaybackState.NO_SONG_SELECTED);
            setCurrentTime(0);
            setDuration(0);
          }
        }}
        onListen={(e: Event) => {
          const audio = e.target as HTMLAudioElement;
          setCurrentTime(audio.currentTime);
        }}
        onLoadedMetaData={(e: Event) => {
          const audio = e.target as HTMLAudioElement;
          setDuration(audio.duration);
        }}
        onSeeked={(e: Event) => {
          const audio = e.target as HTMLAudioElement;
          setCurrentTime(audio.currentTime);
        }}
      />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-4 py-4 border-b border-[#999] shadow-inner brushed-metal">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3">
              {/* ===== PREVIOUS TRACK BUTTON =====
               * Adds current track to beginning of queue and plays previous track
               * Located on the left side of the play/pause button
               */}
              <button
                className="w-8 h-8 rounded-full bg-gradient-to-b from-[#fdfae7] to-[#f4f1cd] border border-[#e1dba7] shadow-inner flex items-center justify-center hover:from-[#f4f1cd] hover:to-[#fdfae7] transition-all active:shadow-none active:translate-y-0.5 active:from-[#e1dba7] active:to-[#d4d0b8]"
                onClick={() => {
                  if (currentTrack) {
                    if (queue.length > 0) {
                      if (loop) {
                        // In loop mode, move to the previous track in queue
                        const newIndex =
                          currentQueueIndex === -1
                            ? queue.length - 1
                            : (currentQueueIndex - 1 + queue.length) %
                              queue.length;
                        setCurrentTrack(queue[newIndex]);
                        setAudioSource(null);
                        setCurrentTime(0);
                        setPlaybackState(PlaybackState.SONG_PLAYING);
                      } else {
                        // In non-loop mode, remove the track from queue
                        const prevTrack = queue[queue.length - 1];
                        setCurrentTrack(prevTrack);
                        setAudioSource(null);
                        setCurrentTime(0);
                        setPlaybackState(PlaybackState.SONG_PLAYING);
                        removeFromQueue(queue.length - 1);
                      }
                    } else if (loop) {
                      // If queue is empty and loop is on, wrap to the end
                      const allTracks = getFilteredTracks();
                      const currentIndex = allTracks.findIndex(
                        (t) => t.id === currentTrack.id
                      );
                      if (currentIndex > 0) {
                        setCurrentTrack(allTracks[currentIndex - 1]);
                        setAudioSource(null);
                        setCurrentTime(0);
                        setPlaybackState(PlaybackState.SONG_PLAYING);
                      }
                    }
                  }
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className={
                    (playbackState === PlaybackState.NO_SONG_SELECTED &&
                      queue.length === 0) ||
                    !loop
                      ? "text-zinc-400"
                      : "text-zinc-800"
                  }
                >
                  <path d="M16 4L8 12L16 20V4Z" fill="currentColor" />
                  <path d="M8 4L0 12L8 20V4Z" fill="currentColor" />
                </svg>
              </button>
              {/* ===== PLAY/PAUSE BUTTON =====
               * Toggles between play triangle and pause bars based on playback state
               * Located in the top bar between previous and next track buttons
               */}
              <button
                className="w-10 h-10 rounded-full bg-gradient-to-b from-[#fdfae7] to-[#f4f1cd] border border-[#e1dba7] shadow-inner flex items-center justify-center hover:from-[#f4f1cd] hover:to-[#fdfae7] transition-all active:shadow-none active:translate-y-0.5 active:from-[#e1dba7] active:to-[#d4d0b8]"
                onClick={togglePlayback}
              >
                {playbackState === PlaybackState.SONG_PLAYING ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-zinc-800"
                  >
                    <path d="M6 4H10V20H6V4Z" fill="currentColor" />
                    <path d="M14 4H18V20H14V4Z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className={
                      playbackState === PlaybackState.NO_SONG_SELECTED &&
                      queue.length === 0
                        ? "text-zinc-400"
                        : "text-zinc-800"
                    }
                  >
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                  </svg>
                )}
              </button>
              {/* ===== NEXT TRACK BUTTON =====
               * Adds current track to end of queue (if loop enabled) and plays next track
               * Located on the right side of the play/pause button
               */}
              <button
                className="w-8 h-8 rounded-full bg-gradient-to-b from-[#fdfae7] to-[#f4f1cd] border border-[#e1dba7] shadow-inner flex items-center justify-center hover:from-[#f4f1cd] hover:to-[#fdfae7] transition-all active:shadow-none active:translate-y-0.5 active:from-[#e1dba7] active:to-[#d4d0b8]"
                onClick={() => {
                  if (currentTrack) {
                    if (queue.length > 0) {
                      if (loop) {
                        // In loop mode, move to the next track in queue
                        const newIndex =
                          currentQueueIndex === -1
                            ? 0
                            : (currentQueueIndex + 1) % queue.length;
                        setCurrentTrack(queue[newIndex]);
                        setAudioSource(null);
                        setCurrentTime(0);
                        setPlaybackState(PlaybackState.SONG_PLAYING);
                      } else {
                        // In non-loop mode, remove the track from queue
                        setCurrentTrack(queue[0]);
                        setAudioSource(null);
                        setCurrentTime(0);
                        setPlaybackState(PlaybackState.SONG_PLAYING);
                        removeFromQueue(0);
                      }
                    } else if (loop) {
                      // If queue is empty and loop is on, wrap to the beginning
                      const allTracks = getFilteredTracks();
                      const currentIndex = allTracks.findIndex(
                        (t) => t.id === currentTrack.id
                      );
                      if (currentIndex < allTracks.length - 1) {
                        setCurrentTrack(allTracks[currentIndex + 1]);
                        setAudioSource(null);
                        setCurrentTime(0);
                        setPlaybackState(PlaybackState.SONG_PLAYING);
                      }
                    }
                  }
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className={
                    playbackState === PlaybackState.NO_SONG_SELECTED &&
                    queue.length === 0
                      ? "text-zinc-400"
                      : "text-zinc-800"
                  }
                >
                  <path d="M8 4L16 12L8 20V4Z" fill="currentColor" />
                  <path d="M16 4L24 12L16 20V4Z" fill="currentColor" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 w-full px-2 mt-1">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className={isDark ? "text-zinc-400" : "text-zinc-800"}
              >
                <path
                  d="M3 9v6h4l5 5V4L7 9H3zm11-.17v6.34L11.13 13H7v-2h4.13L14 8.83z"
                  fill="currentColor"
                />
              </svg>
              <div className="w-28 -my-4 cursor-pointer">
                <Slider
                  value={localVolume}
                  onChange={(value) => debouncedSetVolume(value as number)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="volume-slider"
                  styles={{
                    track: {
                      backgroundColor: isDark ? "#444" : "#c0b8a0",
                      height: 2,
                    },
                    rail: {
                      backgroundColor: isDark ? "#2a2a2a" : "#fdfae7",
                      height: 2,
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
                    },
                    handle: {
                      height: 12,
                      width: 12,
                      marginTop: -5,
                      backgroundColor: isDark ? "#444" : "#f8f8f8",
                      border: isDark ? "1px solid #555" : "1px solid #a0a0a0",
                      boxShadow:
                        "0 2px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)",
                    },
                  }}
                />
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className={isDark ? "text-zinc-400" : "text-zinc-800"}
              >
                <path
                  d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="relative min-w-[50%] h-[60px] rounded-full shadow-inner border border-[#e1dba7] bg-gradient-to-b from-[#fdfae7] to-[#f4f1cd] text-sm text-zinc-700 flex items-center justify-center">
          {playbackState === PlaybackState.NO_SONG_SELECTED ? (
            <img src={AudiusGlyph} alt="Audius" className="w-6 h-6" />
          ) : (
            <div className="w-full h-full flex flex-col justify-center px-6">
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="text-xs font-medium truncate">
                    {currentTrack?.title || "No track playing"}
                  </div>
                  <div className="text-[10px] text-zinc-600 truncate">
                    {currentTrack?.artist || "No artist"}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-2 left-6 right-6 flex items-center gap-2">
                <span className="text-xs text-zinc-600">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 h-4 flex items-center relative">
                  <div
                    className="w-full h-1 bg-[#e1dba7] rounded-full overflow-hidden cursor-pointer"
                    onClick={handleScrubberClick}
                  >
                    <div
                      className="h-full bg-[#E6C7FF] rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <div
                    className="absolute h-1.5 w-1.5 rounded-full bg-[#4a1a7a]"
                    style={{
                      left: `calc(${
                        (currentTime / duration) * 100
                      }% - 0.375rem)`,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                </div>
                <span className="text-xs text-zinc-600">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getUserState() ? (
            <img
              src={getUserState()?.profilePicture?.["_480x480"] || ""}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-black"
            />
          ) : (
            <Login />
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-64 border-r border-[#C273FF] p-4 overflow-y-auto flex flex-col brushed-metal">
          <div className="font-bold mb-4">Source</div>
          <ul className="space-y-4 text-sm mb-6">
            {sources.map((source) => (
              <li key={source.id} className="space-y-1">
                <div
                  className={`cursor-pointer hover:bg-[#E6C7FF] px-2 py-1 rounded ${
                    filterState.selectedSource === source.id
                      ? "bg-[#E6C7FF] dark:text-black"
                      : ""
                  }`}
                  onClick={() => setSelectedSource(source.id)}
                  onDoubleClick={() => handleSourceDoubleClick(source.id)}
                >
                  {typeof source.icon === "string" &&
                  source.icon.startsWith("http") ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={source.icon}
                        alt=""
                        className="w-4 h-4 rounded"
                      />
                      {source.label}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {source.children && (
                        <span className="text-xs">
                          {expandedSources.has(source.id) ? "▼" : "▶"}
                        </span>
                      )}
                      {source.label}
                    </div>
                  )}
                </div>
                {source.children && expandedSources.has(source.id) && (
                  <ul className="ml-4 space-y-1">
                    {source.children.map((child) => (
                      <li
                        key={child.id}
                        className={`cursor-pointer hover:bg-[#E6C7FF] px-2 py-1 rounded ${
                          filterState.selectedSource === child.id
                            ? "bg-[#E6C7FF] dark:text-black"
                            : ""
                        }`}
                        onClick={() => setSelectedSource(child.id)}
                      >
                        {typeof child.icon === "string" &&
                        child.icon.startsWith("http") ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={child.icon}
                              alt=""
                              className="w-4 h-4 rounded"
                            />
                            {child.label}
                          </div>
                        ) : (
                          child.label
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-4 border-t border-[#C273FF]">
            <div
              className={`${
                currentTrack?.artwork?._1000x1000 ? "w-48 h-48" : "w-16 h-16"
              } rounded overflow-hidden flex items-center justify-center mx-auto shadow-inner border border-[#C273FF] bg-[#E6C7FF]`}
            >
              {playbackState === PlaybackState.NO_SONG_SELECTED ? (
                <span
                  className={`${
                    currentTrack?.artwork?._1000x1000 ? "text-4xl" : "text-xl"
                  }`}
                >
                  🎵
                </span>
              ) : currentTrack?.artwork?._1000x1000 ? (
                <img
                  src={currentTrack.artwork._1000x1000}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className={`${
                    currentTrack?.artwork?._1000x1000 ? "text-4xl" : "text-xl"
                  }`}
                >
                  {playbackState === PlaybackState.SONG_PLAYING ? "⏸️" : "▶️"}
                </span>
              )}
            </div>
            <div className="text-center text-xs text-[#4a1a7a] mt-2 w-full">
              {playbackState === PlaybackState.NO_SONG_SELECTED ? (
                "No track selected"
              ) : (
                <ScrollingText
                  text={`${currentTrack?.title} - ${currentTrack?.artist} - ${currentTrack?.album}`}
                  isPlaying={playbackState === PlaybackState.SONG_PLAYING}
                />
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0">
          {showQueue ? (
            <div className="flex-1 overflow-y-auto">
              <QueueView />
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex border-b border-[#999] text-sm h-48 brushed-metal">
                {[
                  {
                    title: "Genres",
                    items: getUniqueGenres(),
                    selected: filterState.selectedGenre,
                    setSelected: setSelectedGenre,
                  },
                  {
                    title: "Artists",
                    items: getUniqueArtists(),
                    selected: filterState.selectedArtist,
                    setSelected: setSelectedArtist,
                  },
                  {
                    title: "Albums",
                    items: getUniqueAlbums(),
                    selected: filterState.selectedAlbum,
                    setSelected: setSelectedAlbum,
                  },
                ].map((section, idx) => (
                  <div
                    key={section.title}
                    className={`w-1/3 ${
                      idx < 2 ? "border-r border-[#bbb]" : ""
                    } flex flex-col`}
                  >
                    <div className="filter-title bg-gradient-to-b from-[#f2f2f2] to-[#cfcfcf] border-b border-[#999] box-shadow-[inset_0_-1px_0_#aaa] px-4 py-2 font-bold">
                      {section.title}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <ul className="flex flex-col">
                        <li
                          className={`cursor-pointer px-4 py-2 hover:bg-[#E6C7FF]/70 ${
                            !section.selected ? "bg-[#E6C7FF]/70" : ""
                          }`}
                          onClick={() => section.setSelected(null)}
                        >
                          All ({section.items.length} {section.title})
                        </li>
                        {section.items.map((item) => (
                          <li
                            key={item}
                            className={`cursor-pointer px-4 py-2 hover:bg-[#E6C7FF]/70 ${
                              section.selected === item ? "bg-[#E6C7FF]/70" : ""
                            }`}
                            onClick={() => section.setSelected(item)}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Track list */}
              <div className="flex-1 flex flex-col brushed-metal min-h-0">
                <div className="sticky top-0 z-10 bg-[#d0d0d0] text-left border-b border-[#aaa]">
                  <table className="w-full text-sm table-fixed border-collapse">
                    <thead>
                      <tr>
                        <th
                          className="px-4 py-2 cursor-pointer"
                          onClick={toggleSort}
                        >
                          Title {filterState.sortAsc ? "↑" : "↓"}
                        </th>
                        <th className="px-4 py-2">Artist</th>
                        <th className="px-4 py-2">Album</th>
                        <th className="px-4 py-2">Genre</th>
                        <th className="px-4 py-2 text-right">Release Date</th>
                        <th className="px-4 py-2 text-right">Duration</th>
                        <th className="px-4 py-2 text-right">Plays</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-sm table-fixed border-collapse">
                    <tbody>
                      {getFilteredTracks().map((track, i) => (
                        <tr
                          key={track.id}
                          className={`${
                            currentTrack?.id === track.id
                              ? isDark
                                ? "bg-zinc-600/70"
                                : "bg-zinc-400/70"
                              : i % 2 === 0
                              ? isDark
                                ? "bg-zinc-800"
                                : "bg-zinc-100"
                              : isDark
                              ? "bg-zinc-900"
                              : "bg-white"
                          } hover:bg-[#E6C7FF]/70 cursor-pointer`}
                          onDoubleClick={() => handleTrackClick(track)}
                          onContextMenu={(e) => handleContextMenu(e, track)}
                        >
                          <td className="px-4 py-2">{track.title}</td>
                          <td className="px-4 py-2">{track.artist}</td>
                          <td className="px-4 py-2">{track.album}</td>
                          <td className="px-4 py-2">{track.genre}</td>
                          <td className="px-4 py-2 text-right">
                            {track.releaseDate || "-"}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {track.duration}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {track.playCount?.toLocaleString() || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative h-12 border-t border-[#999] flex items-center justify-center text-xs text-zinc-600 brushed-metal">
        <div className="absolute left-4 flex items-center gap-2">
          <button
            onClick={toggleLoop}
            className={`w-8 h-8 rounded-full bg-gradient-to-b from-[#fdfae7] to-[#f4f1cd] border border-[#e1dba7] shadow-inner flex items-center justify-center hover:from-[#f4f1cd] hover:to-[#fdfae7] transition-all active:shadow-none active:translate-y-0.5 active:from-[#e1dba7] active:to-[#d4d0b8] ${
              loop ? "bg-[#E6C7FF] dark:bg-[#4a1a7a]" : ""
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className={`${loop ? "text-zinc-800" : "text-zinc-400"}`}
            >
              <path
                d="M17 17H7V14L3 18L7 22V19H19V13H17V17Z"
                fill="currentColor"
              />
              <path d="M7 7H17V10L21 6L17 2V5H5V11H7V7Z" fill="currentColor" />
            </svg>
          </button>
          <button
            onClick={toggleShuffle}
            className={`w-8 h-8 rounded-full bg-gradient-to-b from-[#fdfae7] to-[#f4f1cd] border border-[#e1dba7] shadow-inner flex items-center justify-center hover:from-[#f4f1cd] hover:to-[#fdfae7] transition-all active:shadow-none active:translate-y-0.5 active:from-[#e1dba7] active:to-[#d4d0b8] ${
              shuffle ? "bg-[#E6C7FF] dark:bg-[#4a1a7a]" : ""
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className={`${shuffle ? "text-zinc-800" : "text-zinc-400"}`}
            >
              <path
                d="M18 4L22 8L18 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 20L2 16L6 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 8H22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 16H22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={toggleQueue}
            className={`w-8 h-8 rounded-full bg-gradient-to-b from-[#fdfae7] to-[#f4f1cd] border border-[#e1dba7] shadow-inner flex items-center justify-center hover:from-[#f4f1cd] hover:to-[#fdfae7] transition-all active:shadow-none active:translate-y-0.5 active:from-[#e1dba7] active:to-[#d4d0b8] ${
              showQueue ? "bg-[#E6C7FF] dark:bg-[#4a1a7a]" : ""
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-zinc-800"
            >
              <path
                d="M4 6H20M4 12H20M4 18H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="absolute left-[50%] -translate-x-[50%]">
          {getUserState() && `${getUserState()?.handle} - `}
          {getFilteredTracks().length} songs,{" "}
          {getFilteredTracks().reduce((acc, track) => {
            const [minutes, seconds] = track.duration.split(":").map(Number);
            return acc + minutes * 60 + seconds;
          }, 0)}{" "}
          seconds total
        </div>
        <button
          onClick={toggleTheme}
          className="absolute right-4 w-8 h-8 rounded-full bg-gradient-to-b from-[#fdfae7] to-[#f4f1cd] border border-[#e1dba7] shadow-inner flex items-center justify-center hover:from-[#f4f1cd] hover:to-[#fdfae7] transition-all active:shadow-none active:translate-y-0.5 active:from-[#e1dba7] active:to-[#d4d0b8]"
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>

      {contextMenu && (
        <ContextMenu
          track={contextMenu.track}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          setAudioSource={setAudioSource}
          setCurrentTime={setCurrentTime}
        />
      )}
    </div>
  );
}
