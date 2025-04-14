import { AudiusSdk, Favorite, Track } from "@audius/sdk";

const audiusSdkApiKey = "832c79b4c0a3da1affae305269a9eb8305858158";

export const audiusSdk: AudiusSdk = window.audiusSdk({
  apiKey: audiusSdkApiKey,
});

export const getTrendingTracks = async (): Promise<Track[]> => {
  const { data: tracks } = await audiusSdk.tracks.getTrendingTracks();
  return tracks ?? [];
};

export const getFavorites = async (userId: string): Promise<Favorite[]> => {
  const { data: tracks } = await audiusSdk.users.getFavorites({
    id: userId,
  });
  return tracks ?? [];
};

export const getFavoritesTracks = async (userId: string): Promise<Track[]> => {
  const favorites = await getFavorites(userId);

  // filter favorites only to tracks by the favorite.favoriteType === "track"
  const favoriteTracks = favorites.filter(
    (favorite) => favorite.favoriteType === "track"
  );

  const tracks = await Promise.all(
    favoriteTracks.map((favorite) =>
      audiusSdk.tracks.getTrack({ trackId: favorite.favoriteItemId })
    )
  );
  return tracks
    .map((track) => track.data)
    .filter((track): track is Track => track !== undefined);
};
