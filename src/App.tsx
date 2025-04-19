import { useEffect, useState } from "react";
import AudiusGlyph from "./assets/audius_glyph.svg";
import { useStore, PlaybackState, Track } from "./store";
import { fetchTrendingTracks, fetchUndergroundTracks } from "./Sdk";
import Login from "./Login";

export default function App() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
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
  } = useStore();

  // Simulate playback progress
  useEffect(() => {
    if (playbackState === PlaybackState.SONG_PLAYING) {
      const interval = setInterval(() => {
        setCurrentTime((prev: number) => {
          if (prev >= duration) {
            setPlaybackState(PlaybackState.SONG_PAUSED);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [playbackState, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const parseDuration = (duration: string) => {
    const [minutes, seconds] = duration.split(":").map(Number);
    return minutes * 60 + seconds;
  };

  const handleTrackClick = (track: Track) => {
    setCurrentTrack(track);
    setDuration(parseDuration(track.duration));
    setCurrentTime(0);
    setPlaybackState(PlaybackState.SONG_PAUSED);
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playbackState === PlaybackState.NO_SONG_SELECTED) return;

    const scrubber = e.currentTarget;
    const rect = scrubber.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    const newTime = Math.floor(duration * percentage);

    setCurrentTime(newTime);
  };

  const togglePlayback = () => {
    if (playbackState === PlaybackState.NO_SONG_SELECTED) {
      // Initialize mock track when first playing
      setCurrentTrack({
        id: 1,
        title: "Sample Track",
        artist: "Sample Artist",
        album: "Sample Album",
        duration: "3:45",
        genre: "Pop",
      });
      setDuration(225); // 3:45 in seconds
      setCurrentTime(0);
      setPlaybackState(PlaybackState.SONG_PLAYING);
    } else if (playbackState === PlaybackState.SONG_PLAYING) {
      setPlaybackState(PlaybackState.SONG_PAUSED);
    } else if (playbackState === PlaybackState.SONG_PAUSED) {
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

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const fontClass = 'font-["Lucida_Grande","Tahoma",sans-serif]';

  return (
    <div
      className={`${fontClass} h-screen flex flex-col ${isDark ? "dark" : ""}`}
    >
      {/* Top bar */}
      <div className="relative flex items-center justify-between px-4 py-4 border-b border-[#999] shadow-inner brushed-metal">
        <div className="flex items-center gap-2">
          <button className="aqua-button">⏮️</button>
          <button className="aqua-button" onClick={togglePlayback}>
            {playbackState === PlaybackState.SONG_PLAYING ? "⏸️" : "▶️"}
          </button>
          <button className="aqua-button">⏭️</button>
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
    </div>
  );
}
