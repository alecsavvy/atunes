import { AudiusSdk, Track } from "@audius/sdk";

const audiusSdkApiKey = "832c79b4c0a3da1affae305269a9eb8305858158";

export const audiusSdk: AudiusSdk = window.audiusSdk({
  apiKey: audiusSdkApiKey,
});

export const getTrendingTracks = async (): Promise<Track[]> => {
  const { data: tracks } = await audiusSdk.tracks.getTrendingTracks();
  return tracks ?? [];
};
