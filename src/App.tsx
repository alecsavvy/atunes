import { useEffect, useState } from "react";
import AudiusGlyph from "./assets/audius_glyph.svg";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [sortAsc, setSortAsc] = useState(true);

  const toggleLogin = () => {
    setLoggedIn(!loggedIn);
    setWallet(loggedIn ? null : "0xAbc...1234");
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const tracks = [
    {
      id: 1,
      title: "Electric Feel",
      artist: "MGMT",
      album: "Oracular Spectacular",
      duration: "3:49",
      genre: "Indie",
    },
    {
      id: 2,
      title: "Nightcall",
      artist: "Kavinsky",
      album: "Nightcall",
      duration: "4:17",
      genre: "Synthwave",
    },
  ];

  const options = [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
    "Option 5",
    "Option 6",
    "Option 7",
    "Option 8",
    "Option 9",
    "Option 10",
  ];

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
          {wallet && <span className="text-xs text-green-700">{wallet}</span>}
          <button onClick={toggleLogin} className="aqua-button text-xs px-3">
            {loggedIn ? "Logout" : "Connect Wallet"}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-[#7fa6d9] p-4 overflow-y-auto flex flex-col brushed-metal">
          <div className="font-bold mb-4">Source</div>
          <ul className="space-y-2 text-sm mb-6">
            <li className="cursor-pointer hover:bg-[#cce6ff]">📚 Library</li>
            <li className="cursor-pointer hover:bg-[#cce6ff]">🔥 Trending</li>
            <li className="cursor-pointer hover:bg-[#cce6ff]">❤️ Reposts</li>
            <li className="cursor-pointer hover:bg-[#cce6ff]">
              🆕 New Releases
            </li>
            <li className="cursor-pointer hover:bg-[#cce6ff]">
              🎧 Chill Vibes
            </li>
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
            {["Genres", "Artists", "Albums"].map((title, idx) => (
              <div
                key={title}
                className={`w-1/3 ${
                  idx < 2 ? "border-r border-[#bbb]" : ""
                } overflow-y-auto`}
              >
                <div className="bg-gradient-to-b from-[#f2f2f2] to-[#cfcfcf] border-b border-[#999] box-shadow-[inset_0_-1px_0_#aaa] px-4 py-2 font-bold">
                  {title}
                </div>
                <ul className="flex flex-col">
                  {[`All (${options.length} ${title})`, ...options].map(
                    (item) => (
                      <li
                        key={item}
                        className="cursor-pointer px-4 py-2 hover:bg-blue-200/70"
                      >
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>

          {/* Track list */}
          <div className="flex-1 overflow-auto brushed-metal">
            <table className="w-full text-sm table-fixed border-collapse">
              <thead className="bg-[#d0d0d0] text-left border-b border-[#aaa]">
                <tr>
                  <th
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => setSortAsc(!sortAsc)}
                  >
                    Title {sortAsc ? "↑" : "↓"}
                  </th>
                  <th className="px-4 py-2">Artist</th>
                  <th className="px-4 py-2">Album</th>
                  <th className="px-4 py-2 text-right">Time</th>
                  <th className="px-4 py-2 text-right">Genre</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track, i) => (
                  <tr
                    key={track.id}
                    className={`$${
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
        2 songs, 8:06 total, 17.9 MB
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
