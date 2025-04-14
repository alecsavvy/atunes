import { useEffect } from "react";
import { useStore } from "./store";
import { audiusSdk } from "./Sdk";

export default function Login() {
  const { setUserState } = useStore();

  async function loadOauth() {
    audiusSdk.oauth?.init({
      successCallback: (profile) => {
        console.log("Profile received:", profile);
        setUserState(profile);
      },
      errorCallback: (error) => {
        console.error("OAuth error:", error);
      },
    });
  }

  useEffect(() => {
    loadOauth();
  }, []);

  return (
    <button
      onClick={() => audiusSdk.oauth?.login({ scope: "read" })}
      className="cursor-pointer px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
    >
      Login with Audius
    </button>
  );
}
