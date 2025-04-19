import { DecodedUserToken } from "@audius/sdk";
import { create } from "zustand";
import {
  fetchFavoritesTracks,
  fetchPlaylistsByUser,
  fetchUploads,
} from "./Sdk";

export enum PlaybackState {
  NO_SONG_SELECTED = "NO_SONG_SELECTED",
  SONG_PLAYING = "SONG_PLAYING",
  SONG_PAUSED = "SONG_PAUSED",
}

export type Track = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  genre: string;
};

type FilterState = {
  selectedSource:
    | "library"
    | "trending"
    | "underground"
    | "favorites"
    | "playlists"
    | "uploads"
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
};

type StoreState = {
  library: Track[];
  trending: Track[];
  underground: Track[];
  favorites: Track[];
  playlists: Track[];
  uploads: Track[];
  currentTrack: Track | null;
  playbackState: PlaybackState;
  currentTime: number;
  duration: number;
  [key: string]:
    | Track[]
    | FilterState
    | DecodedUserToken
    | null
    | SourceConfig[]
    | number
    | boolean
    | Track
    | PlaybackState
    | ((...args: any[]) => any);
  filterState: FilterState;
  userState: DecodedUserToken | null;
  sources: SourceConfig[];
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
};

export const useStore = create<StoreState>((set, get) => ({
  library: [],
  trending: [],
  underground: [],
  favorites: [],
  playlists: [],
  uploads: [],
  currentTrack: null,
  playbackState: PlaybackState.NO_SONG_SELECTED,
  currentTime: 0,
  duration: 0,
  filterState: {
    selectedSource: "library",
    selectedGenre: null,
    selectedArtist: null,
    selectedAlbum: null,
    sortAsc: true,
  },
  userState: null,
  sources: [
    { id: "library" as const, label: "📚 Library", type: "static" as const },
    { id: "trending" as const, label: "🔥 Trending", type: "static" as const },
    {
      id: "underground" as const,
      label: "🔊 Underground",
      type: "static" as const,
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
    const sourceTracks = get()[filterState.selectedSource] as Track[];

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

    return filtered.sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return filterState.sortAsc ? comparison : -comparison;
    });
  },
  getUniqueGenres: () => {
    const { filterState } = get();
    const sourceTracks = get()[filterState.selectedSource] as Track[];
    return [...new Set(sourceTracks.map((track) => track.genre))];
  },
  getUniqueArtists: () => {
    const { filterState } = get();
    const sourceTracks = get()[filterState.selectedSource] as Track[];
    return [...new Set(sourceTracks.map((track) => track.artist))];
  },
  getUniqueAlbums: () => {
    const { filterState } = get();
    const sourceTracks = get()[filterState.selectedSource] as Track[];
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
      { id: "library" as const, label: "📚 Library", type: "static" as const },
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
    ];

    if (userState) {
      set({
        sources: [
          ...baseSources,
          {
            id: "uploads" as const,
            label: "💿 Uploads",
            type: "static" as const,
          },
          {
            id: "favorites" as const,
            label: "💖 Favorites",
            type: "static" as const,
          },
        ],
      });
    } else {
      set({ sources: baseSources });
    }
  },
  addDynamicSource: (source) =>
    set((state) => ({
      sources: [...state.sources, source],
    })),
  removeDynamicSource: (sourceId) =>
    set((state) => ({
      sources: state.sources.filter((source) => source.id !== sourceId),
    })),
  setCurrentTrack: (track) =>
    set({
      currentTrack: track,
      playbackState: track
        ? PlaybackState.SONG_PAUSED
        : PlaybackState.NO_SONG_SELECTED,
    }),
  setPlaybackState: (state) => set({ playbackState: state }),
  setCurrentTime: (currentTime) =>
    set((state) => ({
      currentTime:
        typeof currentTime === "function"
          ? currentTime(state.currentTime)
          : currentTime,
    })),
  setDuration: (duration) => set({ duration }),
}));
