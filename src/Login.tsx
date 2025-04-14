import { useRef, useEffect } from "react";
import { useStore } from "./store";
import { audiusSdk } from "./Sdk";

export default function Login() {
  const buttonDivRef = useRef<HTMLDivElement>(null);
  const { setUserState, getUserState } = useStore();

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

    // Only render the button if we're not logged in
    if (!getUserState()) {
      audiusSdk.oauth?.renderButton({
        element: buttonDivRef.current!,
        scope: "read",
        buttonOptions: {
          customText: "Login",
        },
      });
    }
  }

  useEffect(() => {
    loadOauth();
  }, []);

  const userState = getUserState();

  if (!userState) {
    return <div ref={buttonDivRef} />;
  }

  return (
    <div className="flex items-center gap-2">
      <img
        src={userState.profilePicture?.["_480x480"] || ""}
        alt="Profile"
        className="w-8 h-8 rounded-full"
      />
      <p className="text-sm">{userState.handle}</p>
    </div>
  );
}
