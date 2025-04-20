import { DecodedUserToken } from "@audius/sdk";
import { create } from "zustand";
import {
  fetchFavoritesTracks,
  fetchPlaylistsByUser,
  fetchUploads,
  fetchBestNewReleases,
  fetchReposts,
  fetchMostLovedTracks,
} from "./sdk";

export enum PlaybackState {
  NO_SONG_SELECTED = "NO_SONG_SELECTED",
  SONG_PLAYING = "SONG_PLAYING",
  SONG_PAUSED = "SONG_PAUSED",
}

export type Track = {
  id: string;
  index: number;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: string;
  genre: string;
  playCount?: number;
  releaseDate?: string;
  artwork?: {
    _150x150?: string;
    _480x480?: string;
    _1000x1000?: string;
  };
};

type FilterState = {
  selectedSource:
    | "discover"
    | "trending"
    | "underground"
    | "feelingLucky"
    | "library"
    | "favorites"
    | "uploads"
    | "playlists"
    | "recents"
    | "searches"
    | "played-tracks"
    | "mostLovedTracks"
    | "bestNewReleases"
    | "feed"
    | string;
  selectedGenre: string | null;
  selectedArtist: string | null;
  selectedAlbum: string | null;
  sortBy:
    | "title"
    | "artist"
    | "album"
    | "genre"
    | "releaseDate"
    | "duration"
    | "playCount"
    | null;
  sortAsc: boolean | null;
};

type SourceConfig = {
  id: FilterState["selectedSource"] | string;
  label: string;
  type: "static" | "dynamic";
  children?: readonly SourceConfig[];
  icon?: string;
};

type StoreState = {
  library: Track[];
  trending: Track[];
  underground: Track[];
  favorites: Track[];
  playlists: Track[];
  uploads: Track[];
  searches: Track[];
  playedTracks: Track[];
  feelingLucky: Track[];
  mostLovedTracks: Track[];
  bestNewReleases: Track[];
  feed: Track[];
  currentTrack: Track | null;
  queue: Track[];
  currentQueueIndex: number;
  playbackState: PlaybackState;
  currentTime: number;
  duration: number;
  volume: number;
  showQueue: boolean;
  loop: boolean;
  shuffle: boolean;
  isDark: boolean;
  filterState: FilterState;
  userState: DecodedUserToken | null;
  sources: readonly SourceConfig[];
  setSelectedSource: (source: FilterState["selectedSource"]) => void;
  setSelectedGenre: (genre: string | null) => void;
  setSelectedArtist: (artist: string | null) => void;
  setSelectedAlbum: (album: string | null) => void;
  toggleSort: (column: FilterState["sortBy"]) => void;
  getFilteredTracks: () => Track[];
  getUniqueGenres: () => string[];
  getUniqueArtists: () => string[];
  getUniqueAlbums: () => string[];
  setTracks: (source: string, tracks: Track[]) => void;
  getUserState: () => DecodedUserToken | null;
  setUserState: (userState: DecodedUserToken) => void;
  setSources: (sources: SourceConfig[]) => void;
  updateSources: (userState: DecodedUserToken | null) => void;
  addDynamicSource: (source: SourceConfig) => void;
  removeDynamicSource: (sourceId: string) => void;
  setCurrentTrack: (track: Track | null) => void;
  setPlaybackState: (state: PlaybackState) => void;
  setCurrentTime: (currentTime: number | ((prev: number) => number)) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleQueue: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  nextTrack: () => void;
  skipToTrack: (index: number) => void;
  previousTrack: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  toggleTheme: () => void;
  [key: string]: any;
};

export const useStore = create<StoreState>((set, get) => {
  // Check system preference
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  // Set initial state
  if (systemPrefersDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  // Listen for system preference changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (e.matches) {
        document.documentElement.classList.add("dark");
        set({ isDark: true });
      } else {
        document.documentElement.classList.remove("dark");
        set({ isDark: false });
      }
    });

  return {
    library: [],
    trending: [],
    underground: [],
    favorites: [],
    playlists: [],
    uploads: [],
    searches: [],
    playedTracks: [],
    feelingLucky: [],
    mostLovedTracks: [],
    bestNewReleases: [],
    feed: [],
    currentTrack: null,
    queue: [],
    currentQueueIndex: -1,
    playbackState: PlaybackState.NO_SONG_SELECTED,
    currentTime: 0,
    duration: 0,
    volume: 1.0,
    showQueue: false,
    loop: true,
    shuffle: false,
    isDark: systemPrefersDark,
    filterState: {
      selectedSource: "trending",
      selectedGenre: null,
      selectedArtist: null,
      selectedAlbum: null,
      sortBy: null,
      sortAsc: null,
    },
    userState: null,
    sources: [
      {
        id: "discover" as const,
        label: "🔍 Discover",
        type: "static" as const,
        children: [
          {
            id: "trending" as const,
            label: "🔥 Trending",
            type: "static" as const,
          },
          {
            id: "underground" as const,
            label: "🔊 Underground",
            type: "static" as const,
          },
          {
            id: "feelingLucky" as const,
            label: "🎲 Feeling Lucky",
            type: "static" as const,
          },
        ],
      },
      {
        id: "library" as const,
        label: "📚 Library",
        type: "static" as const,
        children: [],
      },
      {
        id: "recents" as const,
        label: "⏱️ Recents",
        type: "static" as const,
        children: [
          {
            id: "played-tracks" as const,
            label: "🎵 Played Tracks",
            type: "static" as const,
          },
        ],
      },
    ],
    setSelectedSource: (source) =>
      set((state) => ({
        filterState: { ...state.filterState, selectedSource: source },
        showQueue: false,
        queue: [],
        currentQueueIndex: -1,
      })),
    setSelectedGenre: (genre) =>
      set((state) => ({
        filterState: { ...state.filterState, selectedGenre: genre },
      })),
    setSelectedArtist: (artist) =>
      set((state) => ({
        filterState: { ...state.filterState, selectedArtist: artist },
      })),
    setSelectedAlbum: (album) =>
      set((state) => ({
        filterState: { ...state.filterState, selectedAlbum: album },
      })),
    toggleSort: (column: FilterState["sortBy"]) =>
      set((state) => {
        // If clicking a different column, start with ascending
        if (state.filterState.sortBy !== column) {
          return {
            filterState: {
              ...state.filterState,
              sortBy: column,
              sortAsc: true,
            },
          };
        }

        // If currently ascending, switch to descending
        if (state.filterState.sortAsc === true) {
          return {
            filterState: {
              ...state.filterState,
              sortAsc: false,
            },
          };
        }

        // If currently descending, remove sort
        return {
          filterState: {
            ...state.filterState,
            sortBy: null,
            sortAsc: null,
          },
        };
      }),
    getFilteredTracks: () => {
      const { filterState } = get();
      const sourceMap: Record<string, string> = {
        "played-tracks": "playedTracks",
        searches: "searches",
        feelingLucky: "feelingLucky",
      };
      const sourceKey =
        sourceMap[filterState.selectedSource] || filterState.selectedSource;

      let sourceTracks: Track[] = [];

      // Handle aggregation for discover and library sources
      if (filterState.selectedSource === "discover") {
        // Combine tracks and deduplicate by id
        const allTracks = [
          ...(get().trending || []),
          ...(get().underground || []),
          ...(get().feelingLucky || []),
        ];
        sourceTracks = allTracks.filter(
          (track, index, self) =>
            index === self.findIndex((t) => t.id === track.id)
        );
      } else if (filterState.selectedSource === "library") {
        // Combine tracks and deduplicate by id
        const allTracks = [
          ...(get().favorites || []),
          ...(get().mostLovedTracks || []),
          ...(get().bestNewReleases || []),
          ...(get().uploads || []),
          ...(get().reposts || []),
        ];
        sourceTracks = allTracks.filter(
          (track, index, self) =>
            index === self.findIndex((t) => t.id === track.id)
        );
      } else {
        sourceTracks = (get()[sourceKey] || []) as Track[];
      }

      let filtered = sourceTracks;

      if (filterState.selectedGenre) {
        filtered = filtered.filter(
          (track) => track.genre === filterState.selectedGenre
        );
      }
      if (filterState.selectedArtist) {
        filtered = filtered.filter(
          (track) => track.artist === filterState.selectedArtist
        );
      }
      if (filterState.selectedAlbum) {
        filtered = filtered.filter(
          (track) => track.album === filterState.selectedAlbum
        );
      }

      // For played tracks, maintain the order of most recent first
      if (filterState.selectedSource === "played-tracks") {
        return filtered;
      }

      // For other sources, apply the normal sorting
      if (filterState.sortBy === null) {
        // Return to original order by sorting by index
        return filtered.sort((a, b) => a.index - b.index);
      }

      return filtered.sort((a, b) => {
        let comparison = 0;
        switch (filterState.sortBy) {
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
          case "artist":
            comparison = a.artist.localeCompare(b.artist);
            break;
          case "album":
            comparison = a.album.localeCompare(b.album);
            break;
          case "genre":
            comparison = a.genre.localeCompare(b.genre);
            break;
          case "releaseDate":
            // Convert dates to timestamps for proper chronological sorting
            const aDate = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
            const bDate = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
            comparison = aDate - bDate;
            break;
          case "duration":
            const [aMins, aSecs] = a.duration.split(":").map(Number);
            const [bMins, bSecs] = b.duration.split(":").map(Number);
            comparison = aMins * 60 + aSecs - (bMins * 60 + bSecs);
            break;
          case "playCount":
            comparison = (a.playCount || 0) - (b.playCount || 0);
            break;
        }
        return filterState.sortAsc ? comparison : -comparison;
      });
    },
    getUniqueGenres: () => {
      const { filterState } = get();
      const sourceMap: Record<string, string> = {
        "played-tracks": "playedTracks",
        searches: "searches",
        feelingLucky: "feelingLucky",
      };
      const sourceKey =
        sourceMap[filterState.selectedSource] || filterState.selectedSource;

      let sourceTracks: Track[] = [];

      if (filterState.selectedSource === "discover") {
        sourceTracks = [
          ...(get().trending || []),
          ...(get().underground || []),
          ...(get().feelingLucky || []),
        ];
      } else if (filterState.selectedSource === "library") {
        sourceTracks = [
          ...(get().favorites || []),
          ...(get().mostLovedTracks || []),
          ...(get().bestNewReleases || []),
          ...(get().uploads || []),
          ...(get().reposts || []),
        ];
      } else {
        sourceTracks = (get()[sourceKey] || []) as Track[];
      }

      return [...new Set(sourceTracks.map((track) => track.genre))].filter(
        (genre) => genre && genre.trim() !== ""
      );
    },
    getUniqueArtists: () => {
      const { filterState } = get();
      const sourceMap: Record<string, string> = {
        "played-tracks": "playedTracks",
        searches: "searches",
        feelingLucky: "feelingLucky",
      };
      const sourceKey =
        sourceMap[filterState.selectedSource] || filterState.selectedSource;

      let sourceTracks: Track[] = [];

      if (filterState.selectedSource === "discover") {
        sourceTracks = [
          ...(get().trending || []),
          ...(get().underground || []),
          ...(get().feelingLucky || []),
        ];
      } else if (filterState.selectedSource === "library") {
        sourceTracks = [
          ...(get().favorites || []),
          ...(get().mostLovedTracks || []),
          ...(get().bestNewReleases || []),
          ...(get().uploads || []),
          ...(get().reposts || []),
        ];
      } else {
        sourceTracks = (get()[sourceKey] || []) as Track[];
      }

      return [...new Set(sourceTracks.map((track) => track.artist))].filter(
        (artist) => artist && artist.trim() !== ""
      );
    },
    getUniqueAlbums: () => {
      const { filterState } = get();
      const sourceMap: Record<string, string> = {
        "played-tracks": "playedTracks",
        searches: "searches",
        feelingLucky: "feelingLucky",
      };
      const sourceKey =
        sourceMap[filterState.selectedSource] || filterState.selectedSource;

      let sourceTracks: Track[] = [];

      if (filterState.selectedSource === "discover") {
        sourceTracks = [
          ...(get().trending || []),
          ...(get().underground || []),
          ...(get().feelingLucky || []),
        ];
      } else if (filterState.selectedSource === "library") {
        sourceTracks = [
          ...(get().favorites || []),
          ...(get().mostLovedTracks || []),
          ...(get().bestNewReleases || []),
          ...(get().uploads || []),
          ...(get().reposts || []),
        ];
      } else {
        sourceTracks = (get()[sourceKey] || []) as Track[];
      }

      return [...new Set(sourceTracks.map((track) => track.album))].filter(
        (album) => album && album.trim() !== ""
      );
    },
    setTracks: (source, tracks) => {
      // Clear any existing tracks for this source before setting new ones
      set((_) => ({
        [source]: [],
      }));
      // Then set the new tracks
      set((_) => ({
        [source]: tracks,
      }));
    },
    setUserState: (userState: DecodedUserToken) => {
      set({ userState });
      // Pre-fetch favorites when user logs in
      if (userState) {
        fetchFavoritesTracks(userState.userId);
        fetchPlaylistsByUser(userState.userId);
        fetchUploads(userState.userId);
        fetchBestNewReleases(userState.userId);
        fetchReposts(userState.userId);
        fetchMostLovedTracks(userState.userId);
      }
      get().updateSources(userState);
    },
    getUserState: () => get().userState,
    setSources: (sources) => set({ sources }),
    updateSources: (userState) => {
      const baseSources = [
        {
          id: "discover" as const,
          label: "🔍 Discover",
          type: "static" as const,
          children: [
            {
              id: "trending" as const,
              label: "🔥 Trending",
              type: "static" as const,
            },
            {
              id: "underground" as const,
              label: "🔊 Underground",
              type: "static" as const,
            },
            {
              id: "feelingLucky" as const,
              label: "🎲 Feeling Lucky",
              type: "static" as const,
            },
          ],
        },
        {
          id: "library" as const,
          label: "📚 Library",
          type: "static" as const,
          children: userState
            ? [
                {
                  id: "favorites" as const,
                  label: "💖 Favorites",
                  type: "static" as const,
                },
                {
                  id: "mostLovedTracks" as const,
                  label: "❤️ Most Loved",
                  type: "static" as const,
                },
                {
                  id: "bestNewReleases" as const,
                  label: "✨ Best New Releases",
                  type: "static" as const,
                },
                {
                  id: "uploads" as const,
                  label: "💿 Uploads",
                  type: "static" as const,
                },
                {
                  id: "reposts" as const,
                  label: "🔄 Reposts",
                  type: "static" as const,
                },
              ]
            : [],
        },
        {
          id: "recents" as const,
          label: "⏱️ Recents",
          type: "static" as const,
          children: [
            {
              id: "played-tracks" as const,
              label: "🎵 Played Tracks",
              type: "static" as const,
            },
          ],
        },
      ] as const;

      set({ sources: baseSources });
    },
    addDynamicSource: (source) =>
      set((state) => ({
        sources: [...state.sources, source],
      })),
    removeDynamicSource: (sourceId) =>
      set((state) => ({
        sources: state.sources.filter((source) => source.id !== sourceId),
      })),
    setCurrentTrack: (track) => {
      if (track) {
        set((state) => {
          // Find the index of the track in the queue
          const trackIndex = state.queue.findIndex((t) => t.id === track.id);
          return {
            currentTrack: track,
            currentQueueIndex: trackIndex,
            playbackState: PlaybackState.SONG_PAUSED,
            playedTracks: [
              track,
              ...state.playedTracks.filter((t) => t.id !== track.id),
            ].slice(0, 100),
            feelingLucky: [...state.trending, ...state.underground]
              .sort(() => Math.random() - 0.5)
              .slice(0, 50),
          };
        });
      } else {
        set({
          currentTrack: null,
          currentQueueIndex: -1,
          playbackState: PlaybackState.NO_SONG_SELECTED,
        });
      }
    },
    setPlaybackState: (state) => set({ playbackState: state }),
    setCurrentTime: (currentTime) =>
      set((state) => ({
        currentTime:
          typeof currentTime === "function"
            ? currentTime(state.currentTime)
            : currentTime,
      })),
    setDuration: (duration) => set({ duration }),
    setVolume: (volume) => set({ volume }),
    toggleQueue: () => set((state) => ({ showQueue: !state.showQueue })),
    addToQueue: (track) =>
      set((state) => {
        // Check if the track is already in the queue
        const isAlreadyInQueue = state.queue.some((t) => t.id === track.id);
        if (isAlreadyInQueue) {
          return state;
        }
        return { queue: [...state.queue, track] };
      }),
    removeFromQueue: (index) =>
      set((state) => ({
        queue: state.queue.filter((_, i) => i !== index),
        currentQueueIndex:
          state.currentQueueIndex > index
            ? state.currentQueueIndex - 1
            : state.currentQueueIndex,
      })),
    clearQueue: () => set({ queue: [], currentQueueIndex: -1 }),
    nextTrack: () => {
      const state = get();
      if (state.currentQueueIndex < state.queue.length - 1) {
        const nextTrack = state.queue[state.currentQueueIndex + 1];
        set({
          currentTrack: nextTrack,
          currentQueueIndex: state.currentQueueIndex + 1,
          playbackState: PlaybackState.SONG_PLAYING,
        });
      } else {
        set({
          currentTrack: null,
          currentQueueIndex: -1,
          playbackState: PlaybackState.NO_SONG_SELECTED,
        });
      }
    },
    skipToTrack: (index: number) => {
      const state = get();
      if (index >= 0 && index < state.queue.length) {
        // Keep only the tracks from the skipped track onwards
        const newQueue = state.queue.slice(index);
        set({
          queue: newQueue,
          currentQueueIndex: 0, // The skipped track is now at index 0
        });
      }
    },
    previousTrack: () => {
      const state = get();
      if (state.currentQueueIndex > 0) {
        const prevTrack = state.queue[state.currentQueueIndex - 1];
        set({
          currentTrack: prevTrack,
          currentQueueIndex: state.currentQueueIndex - 1,
          playbackState: PlaybackState.SONG_PLAYING,
        });
      }
    },
    toggleLoop: () => set((state) => ({ loop: !state.loop })),
    toggleShuffle: () =>
      set((state) => {
        const newShuffleState = !state.shuffle;
        // Only reshuffle when turning shuffle ON
        if (newShuffleState && state.queue.length > 0) {
          // If we have a queue, reshuffle it starting from the current track
          const currentTrackIndex = state.currentQueueIndex;
          const currentTrack = state.currentTrack;

          if (currentTrackIndex !== -1 && currentTrack) {
            // Split the queue into two parts: before and after the current track
            const beforeCurrent = state.queue.slice(0, currentTrackIndex);
            const afterCurrent = state.queue.slice(currentTrackIndex + 1);

            // Shuffle both parts
            const shuffledBefore = [...beforeCurrent].sort(
              () => Math.random() - 0.5
            );
            const shuffledAfter = [...afterCurrent].sort(
              () => Math.random() - 0.5
            );

            // Combine them with the current track in the middle
            const newQueue = [
              currentTrack,
              ...shuffledAfter,
              ...shuffledBefore,
            ];

            return {
              shuffle: newShuffleState,
              queue: newQueue,
              currentQueueIndex: 0, // Current track is now at index 0
            };
          }
        }
        // When turning shuffle OFF, just update the state
        return { shuffle: newShuffleState };
      }),
    toggleTheme: () => {
      set((state) => {
        const newIsDark = !state.isDark;
        if (newIsDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        return { isDark: newIsDark };
      });
    },
  };
});
