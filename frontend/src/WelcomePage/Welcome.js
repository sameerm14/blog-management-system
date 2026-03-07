import React from "react";
import "./Welcome.css";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="landing">
      <nav className="navbar">
        <h2 className="logo">BlogPlatform</h2>

        <div>
          <button className="nav-btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button
            className="nav-btn register"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </nav>

      <section className="hero">
        <h1>Create. Share. Grow.</h1>

        <p>
          A modern blogging platform where creators can publish posts, engage
          audiences and grow their community.
        </p>

        <div className="hero-buttons">
          <button className="primary" onClick={() => navigate("/login")}>
            Start Writing
          </button>
          <button className="secondary" onClick={() => navigate("/login")}>
            Explore Blogs
          </button>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Write Blogs</h3>
          <p>Create posts with images and rich content.</p>
        </div>

        <div className="feature-card">
          <h3>Engage Users</h3>
          <p>Readers can like and comment on posts.</p>
        </div>

        <div className="feature-card">
          <h3>Subscription Plans</h3>
          <p>Upgrade plans to unlock premium features.</p>
        </div>
      </section>

      <footer className="footer">
        <p>© 2026 BlogPlatform</p>
      </footer>
    </div>
  );
}
