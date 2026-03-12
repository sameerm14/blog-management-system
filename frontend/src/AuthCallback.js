import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthCallback() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          const res = await axios.post(
            "https://blog-management-system-y5tx.onrender.com/auth/auth0-login",
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          );

          localStorage.setItem("token", res.data.access_token);
          navigate("/dashboard", { replace: true });
        } catch (err) {
          console.log("AuthCallback error:", err);
          navigate("/", { replace: true });
        }
      } else {
        navigate("/", { replace: true });
      }
    };

    handleAuth();
  }, [isAuthenticated, getAccessTokenSilently, navigate]);

  return <p>Logging in with Facebook...</p>;
}
