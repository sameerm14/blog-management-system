import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEffect } from "react";

export default function AuthSync() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const sendToken = async () => {
      const token = await getAccessTokenSilently();

      const res = await axios.post(
        "https://blog-management-system-y5tx.onrender.com/auth/auth0-login",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      localStorage.setItem("token", res.data.access_token);
    };

    if (isAuthenticated) {
      sendToken();
    }
  }, [isAuthenticated]);
  return null;
}
