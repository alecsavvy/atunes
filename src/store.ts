import { create } from "zustand";

export type Track = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  genre: string;
  source: "library" | "trending" | "reposts" | "newReleases" | "chillVibes";
};

type FilterState = {
  selectedSource:
    | "library"
    | "trending"
    | "reposts"
    | "newReleases"
    | "chillVibes";
  selectedGenre: string | null;
  selectedArtist: string | null;
  selectedAlbum: string | null;
  sortAsc: boolean;
};

type StoreState = {
  tracks: Track[];
  filterState: FilterState;
  setSelectedSource: (source: FilterState["selectedSource"]) => void;
  setSelectedGenre: (genre: string | null) => void;
  setSelectedArtist: (artist: string | null) => void;
  setSelectedAlbum: (album: string | null) => void;
  toggleSort: () => void;
  getFilteredTracks: () => Track[];
  getUniqueGenres: () => string[];
  getUniqueArtists: () => string[];
  getUniqueAlbums: () => string[];
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
      source: "newReleases",
    },
    {
      id: 4,
      title: "Genesis",
      artist: "Grimes",
      album: "Visions",
      duration: "3:20",
      genre: "Electronic",
      source: "chillVibes",
    },
  ],
  filterState: {
    selectedSource: "library",
    selectedGenre: null,
    selectedArtist: null,
    selectedAlbum: null,
    sortAsc: true,
  },
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
    const { tracks, filterState } = get();
    let filtered = tracks.filter(
      (track) => track.source === filterState.selectedSource
    );

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
    const { tracks, filterState } = get();
    return [
      ...new Set(
        tracks
          .filter((track) => track.source === filterState.selectedSource)
          .map((track) => track.genre)
      ),
    ];
  },
  getUniqueArtists: () => {
    const { tracks, filterState } = get();
    return [
      ...new Set(
        tracks
          .filter((track) => track.source === filterState.selectedSource)
          .map((track) => track.artist)
      ),
    ];
  },
  getUniqueAlbums: () => {
    const { tracks, filterState } = get();
    return [
      ...new Set(
        tracks
          .filter((track) => track.source === filterState.selectedSource)
          .map((track) => track.album)
      ),
    ];
  },
}));
