import type { sdk } from "@audius/sdk";

declare global {
  interface Window {
    audiusSdk: sdk;
  }
}

export {};
