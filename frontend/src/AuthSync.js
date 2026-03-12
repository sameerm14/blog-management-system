import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthSync() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    const sendToken = async () => {
      try {
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
        navigate("/dashboard");
      } catch (err) {
        console.log("AuthSync error:", err);
      }
    };

    if (isAuthenticated && !localStorage.getItem("token")) {
      sendToken();
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently, navigate]);

  return null;
}
