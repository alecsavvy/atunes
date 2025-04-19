import React from "react";
import { useStore, PlaybackState } from "../store";

export const QueueView: React.FC = () => {
  const {
    currentTrack,
    queue,
    currentQueueIndex,
    playbackState,
    removeFromQueue,
  } = useStore();

  if (!currentTrack && (!queue || queue.length === 0)) {
    return null;
  }

  return (
    <div className="queue-view">
      <div className="sticky top-0 z-10 bg-[#d0d0d0] text-left border-b border-[#aaa]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="w-12 px-2 py-2">#</th>
              <th className="w-16 px-2 py-2">Artwork</th>
              <th className="w-1/4 px-2 py-2">Title</th>
              <th className="w-1/4 px-2 py-2">Artist</th>
              <th className="w-1/4 px-2 py-2">Album</th>
              <th className="w-1/6 px-2 py-2">Genre</th>
              <th className="w-16 px-2 py-2 text-right">Duration</th>
              <th className="w-12 px-2 py-2">Actions</th>
            </tr>
          </thead>
        </table>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {currentTrack && (
              <tr className="bg-zinc-400/70">
                <td className="px-2 py-2 text-center">▶️</td>
                <td className="px-2 py-2">
                  <img
                    src={currentTrack.artwork?._150x150}
                    alt={currentTrack.title}
                    className="w-8 h-8 rounded"
                  />
                </td>
                <td className="px-2 py-2 truncate">{currentTrack.title}</td>
                <td className="px-2 py-2 truncate">{currentTrack.artist}</td>
                <td className="px-2 py-2 truncate">{currentTrack.album}</td>
                <td className="px-2 py-2 truncate">{currentTrack.genre}</td>
                <td className="px-2 py-2 text-right">
                  {currentTrack.duration}
                </td>
                <td className="px-2 py-2 text-center">
                  {playbackState === PlaybackState.SONG_PLAYING ? "⏸️" : "▶️"}
                </td>
              </tr>
            )}
            {queue &&
              queue.map((track, index) => (
                <tr
                  key={track.id}
                  className={`${
                    index % 2 === 0 ? "bg-zinc-100" : "bg-white"
                  } hover:bg-[#E6C7FF]/70`}
                >
                  <td className="px-2 py-2 text-center">{index + 1}</td>
                  <td className="px-2 py-2">
                    <img
                      src={track.artwork?._150x150}
                      alt={track.title}
                      className="w-8 h-8 rounded"
                    />
                  </td>
                  <td className="px-2 py-2 truncate">{track.title}</td>
                  <td className="px-2 py-2 truncate">{track.artist}</td>
                  <td className="px-2 py-2 truncate">{track.album}</td>
                  <td className="px-2 py-2 truncate">{track.genre}</td>
                  <td className="px-2 py-2 text-right">{track.duration}</td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => removeFromQueue(index)}
                      className="text-zinc-600 hover:text-zinc-800"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
