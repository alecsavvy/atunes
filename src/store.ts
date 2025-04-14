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
  source:
    | "library"
    | "trending"
    | "underground"
    | "favorites"
    | "reposts"
    | "playlists";
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

type StoreState = {
  tracks: Track[];
  filterState: FilterState;
  userState: DecodedUserToken | null;
  favorites: Track[];
  setSelectedSource: (source: FilterState["selectedSource"]) => void;
  setSelectedGenre: (genre: string | null) => void;
  setSelectedArtist: (artist: string | null) => void;
  setSelectedAlbum: (album: string | null) => void;
  toggleSort: () => void;
  getFilteredTracks: () => Track[];
  getUniqueGenres: () => string[];
  getUniqueArtists: () => string[];
  getUniqueAlbums: () => string[];
  setTracks: (tracks: Track[]) => void;
  getUserState: () => DecodedUserToken | null;
  setUserState: (userState: DecodedUserToken) => void;
  setFavorites: (tracks: Track[]) => void;
};

export const useStore = create<StoreState>((set, get) => ({
  tracks: [],
  favorites: [],
  filterState: {
    selectedSource: "library",
    selectedGenre: null,
    selectedArtist: null,
    selectedAlbum: null,
    sortAsc: true,
  },
  userState: null,
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
    const { tracks, filterState, favorites } = get();
    let filtered =
      filterState.selectedSource === "favorites"
        ? favorites
        : tracks.filter((track) => track.source === filterState.selectedSource);

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
    const { tracks, filterState, favorites } = get();
    const sourceTracks =
      filterState.selectedSource === "favorites" ? favorites : tracks;
    return [
      ...new Set(
        sourceTracks
          .filter((track) => track.source === filterState.selectedSource)
          .map((track) => track.genre)
      ),
    ];
  },
  getUniqueArtists: () => {
    const { tracks, filterState, favorites } = get();
    const sourceTracks =
      filterState.selectedSource === "favorites" ? favorites : tracks;
    return [
      ...new Set(
        sourceTracks
          .filter((track) => track.source === filterState.selectedSource)
          .map((track) => track.artist)
      ),
    ];
  },
  getUniqueAlbums: () => {
    const { tracks, filterState, favorites } = get();
    const sourceTracks =
      filterState.selectedSource === "favorites" ? favorites : tracks;
    return [
      ...new Set(
        sourceTracks
          .filter((track) => track.source === filterState.selectedSource)
          .map((track) => track.album)
      ),
    ];
  },
  setTracks: (tracks) => set({ tracks }),
  setUserState: (userState: DecodedUserToken) => {
    set({ userState });
    // Pre-fetch favorites when user logs in
    if (userState) {
      fetchFavoritesTracks(userState.userId);
    }
  },
  getUserState: () => get().userState,
  setFavorites: (tracks) => set({ favorites: tracks }),
}));
