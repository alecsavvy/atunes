import { AudiusSdk, Favorite, Track } from "@audius/sdk";
import { useStore } from "./store";
import {
  PlaylistFullWithoutTracks,
  TrackFull,
} from "@audius/sdk/dist/sdk/api/generated/full";

const audiusSdkApiKey = "832c79b4c0a3da1affae305269a9eb8305858158";

export const audiusSdk: AudiusSdk = window.audiusSdk({
  apiKey: audiusSdkApiKey,
});

const convertAudiusTrack = (track: Track, index: number, source: string) => ({
  id: index + 1,
  title: track.title,
  artist: track.user.name,
  album: track.albumBacklink?.playlistName || "<no album>",
  duration: `${Math.floor(track.duration / 60)}:${(track.duration % 60)
    .toString()
    .padStart(2, "0")}`,
  genre: track.genre,
  source,
});

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

export const fetchPlaylists = async (
  userId: string
): Promise<PlaylistFullWithoutTracks[]> => {
  const { data: playlists } = await audiusSdk.full.users.getPlaylistsByUser({
    id: userId,
  });
  return playlists ?? [];
};

export const fetchPlaylistsTracks = async (
  playlistId: string
): Promise<TrackFull[]> => {
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
      // Add dynamic source for this playlist
      useStore.getState().addDynamicSource({
        id: playlistSource,
        label: `🎵 ${playlist.playlistName}`,
        type: "dynamic",
      });
    })
  );
};
