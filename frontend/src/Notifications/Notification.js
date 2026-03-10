import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Notification.css";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://blog-management-system-y5tx.onrender.com/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `https://blog-management-system-y5tx.onrender.com/notifications/${id}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.log(err);
    }
  };
  function formatTime(date) {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);

    if (diff < 60) return "Just now";

    if (diff < 3600) {
      const m = Math.floor(diff / 60);
      return m + (m === 1 ? " minute ago" : " minutes ago");
    }

    if (diff < 86400) {
      const h = Math.floor(diff / 3600);
      return h + (h === 1 ? " hour ago" : " hours ago");
    }

    return new Date(date).toLocaleDateString("en-IN");
  }
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <div className="notification-page">
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

        <div className="notifications-container">
          {notifications.length === 0 ? (
            <p className="no-notifications">
              You don’t have any notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-card ${n.is_read ? "read" : "unread"}`}
                onClick={() => markAsRead(n.id)}
              >
                <p>{n.message}</p>
                <small>{formatTime(n.created_at)}</small>
              </div>
            ))
          )}
        </div>

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
      </div>
    </>
  );
}
