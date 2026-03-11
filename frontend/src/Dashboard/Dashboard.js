import React from "react";
import { useEffect, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import UserDashboard from "../UserDash/UserDashboard";
import AIChat from "../Ai/AIChat";

export default function Dashboard() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/", { replace: true });
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://blog-management-system-y5tx.onrender.com/notifications/unread-count",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) return;

      const data = await res.json();
      setUnreadCount(data.unread);
    } catch (err) {
      console.log(err);
    }
  };
  const handleCreatePost = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "https://blog-management-system-y5tx.onrender.com/subscription/check",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.status === 403) {
        navigate("/plans"); // redirect to subscription page
      } else if (res.ok) {
        navigate("/create-post"); // allowed
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchUnreadCount();
  }, []);
  return (
    <div className="dashboard">
      {/* Navbar */}

      <nav className="navbar">
        <div className="logo">BlogPlatform</div>

        <div className="nav-links">
          <span onClick={() => navigate("/dashboard")}>Home</span>
          <span onClick={() => navigate("/my-posts")}>My Posts</span>
          <span onClick={() => navigate("/getposts")}>All Posts</span>
          <span onClick={() => navigate("/plans")}>Plans</span>
          <span onClick={() => navigate("/invoices")}>My Invoices</span>
          <span
            className="notification-icon"
            onClick={() => navigate("/notifications")}
          >
            🔔
            {unreadCount > 0 && (
              <span className="notif-count">{unreadCount}</span>
            )}
          </span>
          <span onClick={() => navigate("/profile")}>Profile</span>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      {/* Welcome Section */}

      <div className="welcome-section">
        <h1>Welcome to your Dashboard</h1>

        <p>
          Create posts, interact with others, and manage your blog
          professionally.
        </p>

        <button className="create-btn" onClick={handleCreatePost}>
          Create Post
        </button>
      </div>

      <h1 style={{ textAlign: "center", margin: "2rem" }}>
        Your Activity Overview
      </h1>
      <UserDashboard />
      {/* Quick Guide Section */}

      <div className="quick-guide">
        <h2>Platform Guide</h2>

        <div className="guide-cards">
          <div className="guide-card">
            <h3>Create Posts</h3>
            <p>
              Share your ideas, knowledge, or experiences by creating posts that
              other users can read and interact with.
            </p>
          </div>

          <div className="guide-card">
            <h3>Engage With Others</h3>
            <p>
              Like posts, leave comments, and interact with the community to
              grow your network.
            </p>
          </div>

          <div className="guide-card">
            <h3>Manage Your Content</h3>
            <p>
              Visit the "My Posts" section to edit, delete, or review your
              published posts anytime.
            </p>
          </div>
        </div>
      </div>
      {/* Footer */}

      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-left">
            <h3>BlogPlatform</h3>
            <p>Share ideas, connect with people, and grow your knowledge.</p>
          </div>

          <div className="footer-links">
            <span onClick={() => navigate("/dashboard")}>Home</span>
            <span onClick={() => navigate("/getposts")}>Posts</span>
            <span onClick={() => navigate("/plans")}>Plans</span>
          </div>

          <div className="footer-right">
            <p>© 2026 BlogPlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <AIChat />
    </div>
  );
}
