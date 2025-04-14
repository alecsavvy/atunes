import { DecodedUserToken } from "@audius/sdk";
import { create } from "zustand";
import { getFavoritesTracks } from "./Sdk";

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
  tracks: [
    {
      id: 1,
      title: "Electric Feel",
      artist: "MGMT",
      album: "Oracular Spectacular",
      duration: "3:49",
      genre: "Indie",
      source: "library",
    },
    {
      id: 2,
      title: "Nightcall",
      artist: "Kavinsky",
      album: "Nightcall",
      duration: "4:17",
      genre: "Synthwave",
      source: "trending",
    },
    {
      id: 3,
      title: "Midnight City",
      artist: "M83",
      album: "Hurry Up, We're Dreaming",
      duration: "4:03",
      genre: "Electronic",
      source: "underground",
    },
  ],
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
      getFavoritesTracks(userState.userId).then((tracks) => {
        const convertedTracks = tracks.map((track, index) => ({
          id: index + 1,
          title: track.title,
          artist: track.user.name,
          album: track.albumBacklink?.playlistName || "no album",
          duration: `${Math.floor(track.duration / 60)}:${(track.duration % 60)
            .toString()
            .padStart(2, "0")}`,
          genre: track.genre,
          source: "favorites" as const,
        }));
        set({ favorites: convertedTracks });
      });
    }
  },
  getUserState: () => get().userState,
  setFavorites: (tracks) => set({ favorites: tracks }),
}));
