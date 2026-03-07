import React, { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import Navbarl from "../Navbarlandingpage/Navbarl";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setIsError(false);
      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setIsError(true);
      setMessage(data.detail);
    }
  };
  return (
    <>
      <Navbarl />
      <div className="register-page">
        <div className="register-card">
          <h2 className="register-title">Create Account</h2>
          <p className="register-subtitle">
            Join BlogPlatform and start sharing your ideas
          </p>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
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
            <button className="register-btn">Create Account</button>
          </form>

          <p className="login-text">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>
      </div>
    </>
  );
}
