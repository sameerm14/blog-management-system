import React, { useState, useEffect } from "react";
import "./Plans.css";
import { useNavigate } from "react-router-dom";
import AIChat from "../Ai/AIChat";

export default function Plans() {
  const navigate = useNavigate();
  const [message, setMessage] = useState(""); // for notification
  const [showMessage, setShowMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const handleLogout = () => {
    // 1. Remove token
    localStorage.removeItem("token");

    // 2. Redirect to landing page
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
  const subscribe = async (plan) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://blog-management-system-y5tx.onrender.com/subscribe/${plan}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(
          `🎉 Congrats! Your ${plan} plan is activated. You can now explore more.`,
        );
        setShowMessage(true);

        // Hide message after 3 seconds and redirect
        setTimeout(() => {
          setShowMessage(false);
          navigate("/dashboard", { replace: true });
        }, 5000);
      } else {
        setMessage(` ${data.detail || "Subscription failed."}`);
        setShowMessage(true);
      }
    } catch (err) {
      console.log(err);
      setMessage("❌ Something went wrong!");
      setShowMessage(true);
    }
  };
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="logo" onClick={() => navigate("/dashboard")}>
          BlogPlatform
        </div>

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

      <div className="plans-page">
        {showMessage && <div className="notification">{message}</div>}
        <h1 className="title">Choose Your Plan</h1>

        {/* Notification */}

        <div className="plans-container">
          {/* BASIC */}
          <div className="plan-card">
            <h2>Basic</h2>
            <h3 className="price">₹300</h3>
            <ul>
              <li>1 Post</li>
              <li>1 Image per Post</li>
              <li>5 Likes</li>
              <li>5 Comments</li>
            </ul>
            <button onClick={() => subscribe("Basic")}>Subscribe</button>
          </div>

          {/* PREMIUM */}
          <div className="plan-card popular">
            <div className="badge">POPULAR</div>
            <h2>Premium</h2>
            <h3 className="price">₹749</h3>
            <ul>
              <li>2 Posts</li>
              <li>2 Images per Post</li>
              <li>20 Likes</li>
              <li>20 Comments</li>
            </ul>
            <button onClick={() => subscribe("Premium")}>Subscribe</button>
          </div>

          {/* PRO */}
          <div className="plan-card">
            <h2>Pro</h2>
            <h3 className="price">₹1299</h3>
            <ul>
              <li>Unlimited Posts</li>
              <li>Unlimited Images</li>
              <li>Unlimited Likes</li>
              <li>Unlimited Comments</li>
            </ul>
            <button onClick={() => subscribe("Pro")}>Subscribe</button>
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
            <span onClick={() => navigate("/profile")}>Profile</span>
          </div>

          <div className="footer-right">
            <p>© 2026 BlogPlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <AIChat />
    </>
  );
}
