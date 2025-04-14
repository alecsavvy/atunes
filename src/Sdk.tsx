import { AudiusSdk, Track, DecodedUserToken } from "@audius/sdk";

const audiusSdkApiKey = "832c79b4c0a3da1affae305269a9eb8305858158";

export const audiusSdk: AudiusSdk = window.audiusSdk({
  apiKey: audiusSdkApiKey,
});

let oauthInitialized = false;

export const initializeOAuth = (
  successCallback: (profile: DecodedUserToken) => void,
  errorCallback: (error: any) => void
) => {
  if (!oauthInitialized) {
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
    oauthInitialized = true;
  }
};

export const renderOAuthButton = (element: HTMLElement | null) => {
  if (!element || !document.body.contains(element)) {
    console.warn("OAuth button container element not found or not in DOM");
    return;
  }

  try {
    // Clear any existing content in the element
    element.innerHTML = "";

    audiusSdk.oauth?.renderButton({
      element,
      scope: "read",
    });
  } catch (error) {
    console.error("Failed to render OAuth button:", error);
  }
};

export const getTrendingTracks = async (): Promise<Track[]> => {
  const { data: tracks } = await audiusSdk.tracks.getTrendingTracks();
  return tracks ?? [];
};
