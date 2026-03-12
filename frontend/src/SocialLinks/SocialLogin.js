import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function SocialLogin() {
  const { loginWithRedirect } = useAuth0();
  return (
    <div>
      <button onClick={() => loginWithRedirect()}>Continue with Google</button>

      <button
        onClick={() =>
          loginWithRedirect({
            authorizationParams: {
              connection: "facebook",
            },
          })
        }
      >
        Continue with Facebook
      </button>
    </div>
  );
}
