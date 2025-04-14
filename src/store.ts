import { DecodedUserToken } from "@audius/sdk";
import { create } from "zustand";
import { fetchFavoritesTracks } from "./Sdk";

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
    | "reposts"
    | "playlists";
  selectedGenre: string | null;
  selectedArtist: string | null;
  selectedAlbum: string | null;
  sortAsc: boolean;
};

type SourceConfig = {
  id: FilterState["selectedSource"];
  label: string;
};

type StoreState = {
  library: Track[];
  trending: Track[];
  underground: Track[];
  favorites: Track[];
  reposts: Track[];
  playlists: Track[];
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
  setTracks: (
    source:
      | "library"
      | "trending"
      | "underground"
      | "favorites"
      | "reposts"
      | "playlists",
    tracks: Track[]
  ) => void;
  getUserState: () => DecodedUserToken | null;
  setUserState: (userState: DecodedUserToken) => void;
  setSources: (sources: SourceConfig[]) => void;
  updateSources: (userState: DecodedUserToken | null) => void;
};

export const useStore = create<StoreState>((set, get) => ({
  library: [],
  trending: [],
  underground: [],
  favorites: [],
  reposts: [],
  playlists: [],
  filterState: {
    selectedSource: "library",
    selectedGenre: null,
    selectedArtist: null,
    selectedAlbum: null,
    sortAsc: true,
  },
  userState: null,
  sources: [
    { id: "library" as const, label: "📚 Library" },
    { id: "trending" as const, label: "🔥 Trending" },
    { id: "underground" as const, label: "🔊 Underground" },
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
    const sourceTracks = get()[filterState.selectedSource];

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
    const sourceTracks = get()[filterState.selectedSource];
    return [...new Set(sourceTracks.map((track) => track.genre))];
  },
  getUniqueArtists: () => {
    const { filterState } = get();
    const sourceTracks = get()[filterState.selectedSource];
    return [...new Set(sourceTracks.map((track) => track.artist))];
  },
  getUniqueAlbums: () => {
    const { filterState } = get();
    const sourceTracks = get()[filterState.selectedSource];
    return [...new Set(sourceTracks.map((track) => track.album))];
  },
  setTracks: (source, tracks) => set((_state) => ({ [source]: tracks })),
  setUserState: (userState: DecodedUserToken) => {
    set({ userState });
    // Pre-fetch favorites when user logs in
    if (userState) {
      fetchFavoritesTracks(userState.userId);
    }
    get().updateSources(userState);
  },
  getUserState: () => get().userState,
  setSources: (sources) => set({ sources }),
  updateSources: (userState) => {
    const baseSources = [
      { id: "library" as const, label: "📚 Library" },
      { id: "trending" as const, label: "🔥 Trending" },
      { id: "underground" as const, label: "🔊 Underground" },
    ];

    if (userState) {
      set({
        sources: [
          ...baseSources,
          { id: "favorites" as const, label: "💖 Favorites" },
          { id: "reposts" as const, label: "❤️ Reposts" },
          { id: "playlists" as const, label: "🎵 Playlists" },
        ],
      });
    } else {
      set({ sources: baseSources });
    }
  },
}));
