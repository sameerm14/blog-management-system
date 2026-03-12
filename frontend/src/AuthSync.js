import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthSync() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
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
      navigate("/dashboard");
    };

    if (isAuthenticated) {
      sendToken();
    }
  }, [isAuthenticated, getAccessTokenSilently, navigate]);
  return null;
}
