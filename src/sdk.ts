import { AudiusSdk, Favorite, Track } from "@audius/sdk";
import { useStore } from "./store";
import Hashids from "hashids";

const audiusSdkApiKey = "832c79b4c0a3da1affae305269a9eb8305858158";
export const NO_ALBUM = "<no album>";
const HASH_SALT = "azowernasdfoia";
const MIN_LENGTH = 5;
const hashids = new Hashids(HASH_SALT, MIN_LENGTH);

export const audiusSdk: AudiusSdk = window.audiusSdk({
  apiKey: audiusSdkApiKey,
});

const convertAudiusTrack = (track: Track, index: number, source: string) => ({
  id: track.id,
  index: index + 1,
  title: track.title,
  artist: track.user.name,
  artistId: track.user.id,
  album: track.albumBacklink?.playlistName || NO_ALBUM,
  albumId: track.albumBacklink?.playlistId
    ? hashids.encode(Number(track.albumBacklink.playlistId))
    : "",
  duration: `${Math.floor(track.duration / 60)}:${(track.duration % 60)
    .toString()
    .padStart(2, "0")}`,
  genre: track.genre,
  playCount: track.playCount,
  releaseDate: track.releaseDate
    ? new Date(track.releaseDate).toISOString().split("T")[0]
    : undefined,
  source,
  artwork: track.artwork,
});

export { convertAudiusTrack };

export const fetchTrendingTracks = async () => {
  try {
    const { data: tracks } = await audiusSdk.tracks.getTrendingTracks();
    const convertedTracks = (tracks ?? []).map((track, index) =>
      convertAudiusTrack(track, index, "trending")
    );
    useStore.getState().setTracks("trending", convertedTracks);
  } catch (error) {
    console.error("Failed to fetch trending tracks:", error);
  }
};

export const fetchUndergroundTracks = async () => {
  try {
    const { data: tracks } =
      await audiusSdk.tracks.getUndergroundTrendingTracks();
    const convertedTracks = (tracks ?? []).map((track, index) =>
      convertAudiusTrack(track, index, "underground")
    );
    useStore.getState().setTracks("underground", convertedTracks);
  } catch (error) {
    console.error("Failed to fetch underground tracks:", error);
  }
};

export const getFavorites = async (userId: string): Promise<Favorite[]> => {
  const { data: tracks } = await audiusSdk.users.getFavorites({
    id: userId,
  });
  return tracks ?? [];
};

export const fetchFavoritesTracks = async (userId: string) => {
  try {
    const favorites = await getFavorites(userId);
    console.log("favorites", favorites);

    const favoriteTracks = favorites.filter(
      (favorite) => favorite.favoriteType === "SaveType.track"
    );

    const { data: tracks } = await audiusSdk.tracks.getBulkTracks({
      id: favoriteTracks.map((favorite) => favorite.favoriteItemId),
    });

    if (!tracks) {
      return;
    }

    const convertedTracks = tracks
      .filter((track): track is Track => track !== undefined)
      .map((track, index) => convertAudiusTrack(track, index, "favorites"));

    useStore.getState().setTracks("favorites", convertedTracks);
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
  }
};

export const fetchUploads = async (userId: string) => {
  const { data: tracks } = await audiusSdk.full.users.getTracksByUser({
    id: userId,
  });
  const convertedTracks = (tracks ?? []).map((track, index) =>
    convertAudiusTrack(track, index, "uploads")
  );
  useStore.getState().setTracks("uploads", convertedTracks);
};

export const fetchPlaylists = async (userId: string) => {
  const { data: playlists } = await audiusSdk.full.users.getPlaylistsByUser({
    id: userId,
  });
  return playlists ?? [];
};

export const fetchPlaylistsTracks = async (playlistId: string) => {
  const { data: playlists } = await audiusSdk.full.playlists.getPlaylistTracks({
    playlistId: playlistId,
  });
  return playlists ?? [];
};

export const fetchPlaylistsByUser = async (userId: string) => {
  const playlists = await fetchPlaylists(userId);
  Promise.all(
    playlists.map(async (playlist) => {
      const playlistSource = `playlist-${playlist.id}`;
      const playlistTracks = await fetchPlaylistsTracks(playlist.id);
      // convert playlist tracks to tracks
      const convertedTracks = playlistTracks.map((track, index) =>
        convertAudiusTrack(track, index, playlistSource)
      );
      useStore.getState().setTracks(playlistSource, convertedTracks);
      // Add dynamic source for this playlist under the library section
      const store = useStore.getState();
      const updatedSources = store.sources.map((source) => {
        if (source.id === "library") {
          return {
            ...source,
            children: [
              ...(source.children || []),
              {
                id: playlistSource,
                label: playlist.playlistName,
                type: "dynamic" as const,
                icon: playlist.artwork ? playlist.artwork._150x150 : "🎵",
              },
            ],
          };
        }
        return source;
      });
      store.setSources(updatedSources);
    })
  );
};

export const fetchFeelingLuckyTracks = async () => {
  const { data: tracks } = await audiusSdk.full.tracks.getFeelingLuckyTracks();
  const convertedTracks = (tracks ?? []).map((track, index) =>
    convertAudiusTrack(track, index, "feelingLucky")
  );
  useStore.getState().setTracks("feelingLucky", convertedTracks);
};

export const getStreamUrl = async (trackId: string): Promise<string> => {
  try {
    const streamUrl = await audiusSdk.tracks.getTrackStreamUrl({
      trackId: trackId,
    });
    return streamUrl;
  } catch (error) {
    console.error("Failed to get stream URL:", error);
    throw error;
  }
};

export const getAlbumTracks = async (albumId: string) => {
  const { data: tracks } = await audiusSdk.full.playlists.getPlaylistTracks({
    playlistId: albumId,
  });
  return tracks ?? [];
};

export const getArtistTracks = async (userId: string) => {
  const { data: tracks } = await audiusSdk.full.users.getTracksByUser({
    id: userId,
  });
  return tracks ?? [];
};

export const getGenreTracks = async (genre: string) => {
  const { data: searchResult } = await audiusSdk.full.search.search({
    query: genre,
    kind: "tracks",
    limit: 100,
  });

  const tracks = searchResult?.tracks ?? [];
  return tracks;
};
