import { AudiusSdk, Track } from "@audius/sdk";

const audiusSdkApiKey = "832c79b4c0a3da1affae305269a9eb8305858158";

const audiusSdk: AudiusSdk = window.audiusSdk({
  apiKey: audiusSdkApiKey,
});

export const initializeOAuth = (
  successCallback: (profile: any) => void,
  errorCallback: (error: any) => void
) => {
  audiusSdk.oauth?.init({
    successCallback: (profile) => {
      // Close the popup window if it exists
      if (window.opener) {
        window.close();
      } else {
        successCallback(profile);
      }
    },
    errorCallback: (error) => {
      if (window.opener) {
        window.close();
      } else {
        errorCallback(error);
      }
    },
  });
};

export const renderOAuthButton = (element: HTMLElement | null) => {
  if (element) {
    audiusSdk.oauth?.renderButton({
      element,
      scope: "read",
    });
  }
};

export const getTrendingTracks = async (): Promise<Track[]> => {
  const { data: tracks } = await audiusSdk.tracks.getTrendingTracks();
  return tracks ?? [];
};
