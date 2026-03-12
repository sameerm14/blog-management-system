import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./SocialLogin.css";

export default function SocialLogin() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="social-login-container">
      <button
        className="social-btn google-btn"
        onClick={() => loginWithRedirect()}
      >
        Continue with Google
      </button>

      <button
        className="social-btn facebook-btn"
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
