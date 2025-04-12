import { useEffect, useState } from "react";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleLogin = () => {
    if (loggedIn) {
      setWallet(null);
      setLoggedIn(false);
    } else {
      setWallet("0xAbc...1234");
      setLoggedIn(true);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 text-black dark:text-white font-sans">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-200 dark:bg-zinc-700 shadow-md">
        <div className="flex items-center gap-2">
          <button className="bg-zinc-300 dark:bg-zinc-600 p-2 rounded hover:bg-zinc-400 dark:hover:bg-zinc-500">
            ⏮️
          </button>
          <button className="bg-zinc-300 dark:bg-zinc-600 p-2 rounded hover:bg-zinc-400 dark:hover:bg-zinc-500">
            ▶️
          </button>
          <button className="bg-zinc-300 dark:bg-zinc-600 p-2 rounded hover:bg-zinc-400 dark:hover:bg-zinc-500">
            ⏭️
          </button>
        </div>
        <div className="text-center text-sm text-zinc-600 dark:text-zinc-300">
          🎵
        </div>
        <div className="flex items-center gap-2">
          {wallet && (
            <span className="text-xs text-green-600 dark:text-green-400">
              {wallet}
            </span>
          )}
          <button
            onClick={toggleLogin}
            className="bg-zinc-300 dark:bg-zinc-600 px-3 py-1 rounded hover:bg-zinc-400 dark:hover:bg-zinc-500 text-xs"
          >
            {loggedIn ? "Logout" : "Connect Wallet"}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-zinc-100 dark:bg-zinc-800 border-r border-zinc-300 dark:border-zinc-700 p-4 overflow-y-auto flex flex-col">
          <div className="font-bold mb-4">Playlists</div>
          <ul className="space-y-2 text-sm mb-6">
            <li>🔥 Trending</li>
            <li>❤️ Favorites</li>
            <li>🆕 New Releases</li>
            <li>🎧 Chill Vibes</li>
          </ul>
          <div className="mt-auto pt-4 border-t border-zinc-300 dark:border-zinc-700">
            <div className="w-16 h-16 bg-zinc-300 dark:bg-zinc-600 rounded overflow-hidden flex items-center justify-center mx-auto">
              <span>🎵</span>
            </div>
            <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Now Playing...
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Filters */}
          <div className="flex border-b border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm h-48">
            {[
              {
                title: "Genres",
                items: ["All", "Electronic", "Hip-Hop", "Rock"],
              },
              {
                title: "Artists",
                items: ["All", "MGMT", "Kavinsky", "Daft Punk"],
              },
              {
                title: "Albums",
                items: ["All", "Random Access Memories", "Drive OST"],
              },
            ].map((section, idx) => (
              <div
                key={section.title}
                className={`w-1/3 ${
                  idx < 2 ? "border-r border-zinc-300 dark:border-zinc-700" : ""
                } overflow-y-auto p-2`}
              >
                <div className="font-bold mb-2">{section.title}</div>
                <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded px-2 py-1"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* TrackList */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <table className="w-full text-sm p-4">
              <thead className="text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="text-left">Title</th>
                  <th className="text-left">Artist</th>
                  <th className="text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {[
                  {
                    id: 1,
                    title: "Electric Feel",
                    artist: "MGMT",
                    duration: "3:49",
                  },
                  {
                    id: 2,
                    title: "Nightcall",
                    artist: "Kavinsky",
                    duration: "4:17",
                  },
                ].map((track) => (
                  <tr
                    key={track.id}
                    className="hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    <td>{track.title}</td>
                    <td>{track.artist}</td>
                    <td className="text-right">{track.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative h-12 bg-zinc-200 dark:bg-zinc-800 border-t border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
        2 songs, 8:06 total, 17.9 MB
        <button
          onClick={toggleTheme}
          className="absolute right-4 bottom-2 text-xs px-3 py-1 rounded bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500"
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
}
