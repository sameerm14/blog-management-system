import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import Navbarl from "../Navbarlandingpage/Navbarl";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      "http://blog-management-system-y5tx.onrender.com/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.access_token);
      setIsError(false);
      setMessage("Login successful! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } else {
      setIsError(true);
      setMessage(data.detail);
    }
  };

  return (
    <>
      <Navbarl />
      <div className="login-page">
        <div className="login-card">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Login to continue to BlogPlatform</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {message && (
              <div className={`form-message ${isError ? "error" : "success"}`}>
                {message}
              </div>
            )}
            <button className="login-btn">Login</button>
          </form>

          <p className="register-text">
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")}>Register</span>
          </p>
        </div>
      </div>
    </>
  );
}
