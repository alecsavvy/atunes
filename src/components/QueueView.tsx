import React from "react";
import { useStore, PlaybackState } from "../store";

export const QueueView: React.FC = () => {
  const {
    currentTrack,
    queue,
    currentQueueIndex,
    playbackState,
    removeFromQueue,
    skipToTrack,
  } = useStore();

  // Reorder queue based on currentQueueIndex
  const orderedQueue = React.useMemo(() => {
    if (currentQueueIndex === -1 || queue.length === 0) return queue;

    // Create a new array starting from the current index
    const rotatedQueue = [...queue];
    const itemsToMove = rotatedQueue.splice(0, currentQueueIndex);
    return [...rotatedQueue, ...itemsToMove];
  }, [queue, currentQueueIndex]);

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-[#d0d0d0] text-left border-b border-[#aaa] shadow-inner brushed-metal">
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-sm font-bold text-zinc-800">Queue</h2>
          <button
            onClick={() => removeFromQueue(currentQueueIndex)}
            className="text-xs text-zinc-600 hover:text-zinc-800 cursor-pointer"
          >
            Clear Queue
          </button>
        </div>
      </div>
      {currentTrack && (
        <div className="p-4 border-b border-[#aaa] bg-zinc-400/70">
          <h3 className="text-xs font-medium text-zinc-600 mb-2">
            Now Playing
          </h3>
          <div className="flex items-center gap-4">
            <img
              src={currentTrack.artwork?._150x150}
              alt={currentTrack.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-zinc-800 truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-zinc-600 truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>
        </div>
      )}
      {orderedQueue.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#d0d0d0] z-10">
              <tr className="border-b border-[#aaa]">
                <th className="w-12 px-2 py-2 text-left text-xs font-medium text-zinc-600">
                  #
                </th>
                <th className="w-16 px-2 py-2 text-left text-xs font-medium text-zinc-600">
                  Artwork
                </th>
                <th className="w-[200px] px-2 py-2 text-left text-xs font-medium text-zinc-600">
                  Title
                </th>
                <th className="w-[150px] px-2 py-2 text-left text-xs font-medium text-zinc-600">
                  Artist
                </th>
                <th className="w-[150px] px-2 py-2 text-left text-xs font-medium text-zinc-600">
                  Album
                </th>
                <th className="w-[100px] px-2 py-2 text-left text-xs font-medium text-zinc-600">
                  Genre
                </th>
                <th className="w-16 px-2 py-2 text-left text-xs font-medium text-zinc-600">
                  Duration
                </th>
                <th className="w-12 px-2 py-2 text-left text-xs font-medium text-zinc-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orderedQueue.map((track, index) => (
                <tr
                  key={track.id}
                  className={`${
                    index % 2 === 0 ? "bg-zinc-100" : "bg-white"
                  } hover:bg-[#E6C7FF]/70`}
                >
                  <td className="px-2 py-2 text-zinc-800">{index + 1}</td>
                  <td className="px-2 py-2">
                    <img
                      src={track.artwork?._150x150}
                      alt={track.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  </td>
                  <td className="px-2 py-2 text-zinc-800 truncate max-w-[200px]">
                    {track.title}
                  </td>
                  <td className="px-2 py-2 text-zinc-600 truncate max-w-[150px]">
                    {track.artist}
                  </td>
                  <td className="px-2 py-2 text-zinc-600 truncate max-w-[150px]">
                    {track.album}
                  </td>
                  <td className="px-2 py-2 text-zinc-600 truncate max-w-[100px]">
                    {track.genre}
                  </td>
                  <td className="px-2 py-2 text-zinc-600">{track.duration}</td>
                  <td className="px-2 py-2">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => skipToTrack(index)}
                        className="w-full px-2 py-1 text-xs text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-[#E6C7FF] hover:border-[#C273FF] rounded cursor-pointer transition-colors"
                      >
                        Play Next
                      </button>
                      <button
                        onClick={() => removeFromQueue(index)}
                        className="w-full px-2 py-1 text-xs text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-red-300 hover:border-red-400 rounded cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4 text-zinc-300">🎵</div>
            <h3 className="text-sm font-medium text-zinc-800 mb-2">
              Queue is Empty
            </h3>
            <p className="text-xs text-zinc-600">
              Add tracks to your queue by right-clicking on any track and
              selecting "Add to Queue"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
