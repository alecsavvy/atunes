import { DecodedUserToken } from "@audius/sdk";
import { create } from "zustand";
import {
  fetchFavoritesTracks,
  fetchPlaylistsByUser,
  fetchUploads,
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
  album: string;
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
    | "feeling-lucky"
    | "library"
    | "favorites"
    | "uploads"
    | "playlists"
    | "recents"
    | "searches"
    | "played-tracks"
    | string;
  selectedGenre: string | null;
  selectedArtist: string | null;
  selectedAlbum: string | null;
  sortAsc: boolean;
};

type SourceConfig = {
  id: FilterState["selectedSource"] | string;
  label: string;
  type: "static" | "dynamic";
  children?: readonly SourceConfig[];
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
  currentTrack: Track | null;
  playbackState: PlaybackState;
  currentTime: number;
  duration: number;
  volume: number;
  [key: string]:
    | Track[]
    | FilterState
    | DecodedUserToken
    | null
    | readonly SourceConfig[]
    | number
    | boolean
    | Track
    | PlaybackState
    | ((...args: any[]) => any);
  filterState: FilterState;
  userState: DecodedUserToken | null;
  sources: readonly SourceConfig[];
  setSelectedSource: (source: FilterState["selectedSource"]) => void;
  setSelectedGenre: (genre: string | null) => void;
  setSelectedArtist: (artist: string | null) => void;
  setSelectedAlbum: (album: string | null) => void;
  toggleSort: () => void;
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
};

export const useStore = create<StoreState>((set, get) => ({
  library: [],
  trending: [],
  underground: [],
  favorites: [],
  playlists: [],
  uploads: [],
  searches: [],
  playedTracks: [],
  feelingLucky: [],
  currentTrack: null,
  playbackState: PlaybackState.NO_SONG_SELECTED,
  currentTime: 0,
  duration: 0,
  volume: 1.0,
  filterState: {
    selectedSource: "trending",
    selectedGenre: null,
    selectedArtist: null,
    selectedAlbum: null,
    sortAsc: true,
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
          id: "feeling-lucky" as const,
          label: "🎲 Feeling Lucky",
          type: "static" as const,
        },
      ],
    },
    {
      id: "library" as const,
      label: "📚 Library",
      type: "static" as const,
      children: [
        {
          id: "favorites" as const,
          label: "💖 Favorites",
          type: "static" as const,
        },
        {
          id: "uploads" as const,
          label: "💿 Uploads",
          type: "static" as const,
        },
      ],
    },
    {
      id: "recents" as const,
      label: "⏱️ Recents",
      type: "static" as const,
      children: [
        {
          id: "searches" as const,
          label: "🔎 Searches",
          type: "static" as const,
        },
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
  toggleSort: () =>
    set((state) => ({
      filterState: {
        ...state.filterState,
        sortAsc: !state.filterState.sortAsc,
      },
    })),
  getFilteredTracks: () => {
    const { filterState } = get();
    const sourceMap: Record<string, string> = {
      "played-tracks": "playedTracks",
      searches: "searches",
      "feeling-lucky": "feelingLucky",
    };
    const sourceKey =
      sourceMap[filterState.selectedSource] || filterState.selectedSource;
    const sourceTracks = (get()[sourceKey] || []) as Track[];

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

    // If feeling lucky, shuffle the tracks
    if (filterState.selectedSource === "feeling-lucky") {
      filtered = [...filtered].sort(() => Math.random() - 0.5);
    }

    return filtered.sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return filterState.sortAsc ? comparison : -comparison;
    });
  },
  getUniqueGenres: () => {
    const { filterState } = get();
    const sourceMap: Record<string, string> = {
      "played-tracks": "playedTracks",
      searches: "searches",
      "feeling-lucky": "feelingLucky",
    };
    const sourceKey =
      sourceMap[filterState.selectedSource] || filterState.selectedSource;
    const sourceTracks = (get()[sourceKey] || []) as Track[];
    return [...new Set(sourceTracks.map((track) => track.genre))];
  },
  getUniqueArtists: () => {
    const { filterState } = get();
    const sourceMap: Record<string, string> = {
      "played-tracks": "playedTracks",
      searches: "searches",
      "feeling-lucky": "feelingLucky",
    };
    const sourceKey =
      sourceMap[filterState.selectedSource] || filterState.selectedSource;
    const sourceTracks = (get()[sourceKey] || []) as Track[];
    return [...new Set(sourceTracks.map((track) => track.artist))];
  },
  getUniqueAlbums: () => {
    const { filterState } = get();
    const sourceMap: Record<string, string> = {
      "played-tracks": "playedTracks",
      searches: "searches",
      "feeling-lucky": "feelingLucky",
    };
    const sourceKey =
      sourceMap[filterState.selectedSource] || filterState.selectedSource;
    const sourceTracks = (get()[sourceKey] || []) as Track[];
    return [...new Set(sourceTracks.map((track) => track.album))];
  },
  setTracks: (source, tracks) => set((_state) => ({ [source]: tracks })),
  setUserState: (userState: DecodedUserToken) => {
    set({ userState });
    // Pre-fetch favorites when user logs in
    if (userState) {
      fetchFavoritesTracks(userState.userId);
      fetchPlaylistsByUser(userState.userId);
      fetchUploads(userState.userId);
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
            id: "feeling-lucky" as const,
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
                id: "uploads" as const,
                label: "💿 Uploads",
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
            id: "searches" as const,
            label: "🔎 Searches",
            type: "static" as const,
          },
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
      set((state) => ({
        currentTrack: track,
        playbackState: PlaybackState.SONG_PAUSED,
        playedTracks: [
          track,
          ...state.playedTracks.filter((t) => t.id !== track.id),
        ].slice(0, 100), // Keep last 100 played tracks
        feelingLucky: [...state.trending, ...state.underground]
          .sort(() => Math.random() - 0.5)
          .slice(0, 50), // Mix of trending and underground tracks
      }));
    } else {
      set({
        currentTrack: null,
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
}));
