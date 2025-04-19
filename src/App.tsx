import { useEffect, useState, useCallback, useRef } from "react";
import AudiusGlyph from "./assets/audius_glyph.svg";
import { useStore, PlaybackState, Track } from "./store";
import {
  fetchTrendingTracks,
  fetchUndergroundTracks,
  getStreamUrl,
} from "./sdk";
import Login from "./Login";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

interface ContextMenuProps {
  track: Track;
  position: { x: number; y: number };
  onClose: () => void;
}

const ContextMenu = ({ track, position, onClose }: ContextMenuProps) => {
  const { setSelectedArtist, setSelectedGenre } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleViewArtist = () => {
    setSelectedArtist(track.artist);
    onClose();
  };

  const handleViewGenre = () => {
    setSelectedGenre(track.genre);
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
          className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-zinc-700 cursor-pointer text-zinc-800 dark:text-zinc-200"
          onClick={handleViewArtist}
        >
          View Artist: {track.artist}
        </div>
        <div
          className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-zinc-700 cursor-pointer text-zinc-800 dark:text-zinc-200"
          onClick={handleViewGenre}
        >
          View Genre: {track.genre}
        </div>
        <div className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-zinc-700 cursor-pointer text-zinc-800 dark:text-zinc-200">
          Add to Playlist
        </div>
        <div className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-zinc-700 cursor-pointer text-zinc-800 dark:text-zinc-200">
          Share
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [contextMenu, setContextMenu] = useState<{
    track: Track;
    position: { x: number; y: number };
  } | null>(null);

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
  } = useStore();

  const [localVolume, setLocalVolume] = useState(volume);

  const audioPlayerRef = useRef<AudioPlayer>(null);

  const [audioSource, setAudioSource] = useState<string | null>(null);

  // Update local volume when store volume changes (e.g. from other components)
  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

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

  const handleTrackClick = (track: Track) => {
    setCurrentTrack(track);
    setAudioSource(null); // Reset audio source to trigger new URL fetch
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
    if (playbackState === PlaybackState.NO_SONG_SELECTED) return;

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
  };

  // Fetch trending tracks on startup
  useEffect(() => {
    fetchTrendingTracks();
    fetchUndergroundTracks();
  }, []);

  // Fetch tracks when source changes
  useEffect(() => {}, [filterState.selectedSource]);

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

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

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
          setCurrentTrack(null);
          setPlaybackState(PlaybackState.NO_SONG_SELECTED);
          setCurrentTime(0);
          setDuration(0);
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
            <div className="flex items-center gap-2">
              <button className="aqua-button">⏮️</button>
              <button className="aqua-button" onClick={togglePlayback}>
                {playbackState === PlaybackState.SONG_PLAYING ? "⏸️" : "▶️"}
              </button>
              <button className="aqua-button">⏭️</button>
            </div>
            <div className="flex items-center gap-2 w-full px-2">
              <span className="text-xs">🔈</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={localVolume}
                onChange={(e) => debouncedSetVolume(parseFloat(e.target.value))}
                className="w-24 h-1 bg-[#e1dba7] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7fa6d9]"
              />
              <span className="text-xs">🔊</span>
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
                <div
                  className="flex-1 h-4 bg-transparent cursor-pointer flex items-center"
                  onClick={handleScrubberClick}
                >
                  <div className="w-full h-1 bg-[#e1dba7] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7fa6d9] rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
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
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-[#7fa6d9] p-4 overflow-y-auto flex flex-col brushed-metal">
          <div className="font-bold mb-4">Source</div>
          <ul className="space-y-2 text-sm mb-6">
            {sources.map((source) => (
              <li
                key={source.id}
                className={`cursor-pointer hover:bg-[#cce6ff] ${
                  filterState.selectedSource === source.id ? "bg-[#cce6ff]" : ""
                }`}
                onClick={() => setSelectedSource(source.id)}
              >
                {source.label}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-4 border-t border-[#aac6e6]">
            <div className="w-16 h-16 bg-[#c5d8ef] rounded overflow-hidden flex items-center justify-center mx-auto shadow-inner border border-[#8caacc]">
              {playbackState === PlaybackState.NO_SONG_SELECTED ? (
                <span>🎵</span>
              ) : (
                <span className="text-2xl">
                  {playbackState === PlaybackState.SONG_PLAYING ? "⏸️" : "▶️"}
                </span>
              )}
            </div>
            <div className="text-center text-xs text-[#5b7ca1] mt-2">
              {playbackState === PlaybackState.NO_SONG_SELECTED
                ? "Now Playing..."
                : currentTrack?.artist}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
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
                } overflow-y-auto`}
              >
                <div className="filter-title bg-gradient-to-b from-[#f2f2f2] to-[#cfcfcf] border-b border-[#999] box-shadow-[inset_0_-1px_0_#aaa] px-4 py-2 font-bold">
                  {section.title}
                </div>
                <ul className="flex flex-col">
                  <li
                    className={`cursor-pointer px-4 py-2 hover:bg-blue-200/70 ${
                      !section.selected ? "bg-blue-200/70" : ""
                    }`}
                    onClick={() => section.setSelected(null)}
                  >
                    All ({section.items.length} {section.title})
                  </li>
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className={`cursor-pointer px-4 py-2 hover:bg-blue-200/70 ${
                        section.selected === item ? "bg-blue-200/70" : ""
                      }`}
                      onClick={() => section.setSelected(item)}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Track list */}
          <div className="flex-1 overflow-auto brushed-metal">
            <table className="w-full text-sm table-fixed border-collapse">
              <thead className="bg-[#d0d0d0] text-left border-b border-[#aaa]">
                <tr>
                  <th className="px-4 py-2 cursor-pointer" onClick={toggleSort}>
                    Title {filterState.sortAsc ? "↑" : "↓"}
                  </th>
                  <th className="px-4 py-2">Artist</th>
                  <th className="px-4 py-2">Album</th>
                  <th className="px-4 py-2 text-right">Time</th>
                  <th className="px-4 py-2 text-right">Genre</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredTracks().map((track, i) => (
                  <tr
                    key={track.id}
                    className={`${
                      i % 2 === 0 ? "bg-white/40" : "bg-white/20"
                    } hover:bg-blue-200/70 cursor-pointer`}
                    onDoubleClick={() => handleTrackClick(track)}
                    onContextMenu={(e) => handleContextMenu(e, track)}
                  >
                    <td className="px-4 py-2">{track.title}</td>
                    <td className="px-4 py-2">{track.artist}</td>
                    <td className="px-4 py-2">{track.album}</td>
                    <td className="px-4 py-2 text-right">{track.duration}</td>
                    <td className="px-4 py-2 text-right">{track.genre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative h-12 border-t border-[#999] flex items-center justify-center text-xs text-zinc-600 brushed-metal">
        <div className="absolute left-4 flex gap-2">
          <button className="aqua-button px-2 text-xs">🔁 Loop</button>
          <button className="aqua-button px-2 text-xs">🔀 Shuffle</button>
        </div>
        {getUserState() && `${getUserState()?.handle} - `}
        {getFilteredTracks().length} songs,{" "}
        {getFilteredTracks().reduce((acc, track) => {
          const [minutes, seconds] = track.duration.split(":").map(Number);
          return acc + minutes * 60 + seconds;
        }, 0)}{" "}
        seconds total
        <button
          onClick={toggleTheme}
          className="absolute right-4 bottom-2 text-xs px-3 py-1 rounded-full aqua-button"
        >
          {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {contextMenu && (
        <ContextMenu
          track={contextMenu.track}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
