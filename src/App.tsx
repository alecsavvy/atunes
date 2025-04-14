import { useEffect, useState } from "react";
import AudiusGlyph from "./assets/audius_glyph.svg";
import { useStore } from "./store";
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
  } = useStore();

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
          <button className="aqua-button">▶️</button>
          <button className="aqua-button">⏭️</button>
        </div>
        <div className="w-150 py-4 rounded-full shadow-inner border border-[#e1dba7] bg-gradient-to-b from-[#fdfae7] to-[#f4f1cd] text-sm text-zinc-700 text-center">
          <img src={AudiusGlyph} alt="Audius" className="w-6 h-6 mx-auto" />
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
              <span>🎵</span>
            </div>
            <div className="text-center text-xs text-[#5b7ca1] mt-2">
              Now Playing...
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
