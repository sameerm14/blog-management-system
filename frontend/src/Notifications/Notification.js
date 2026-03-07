import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Notification.css";

export default function Notification() {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };
  const fetchInteractions = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://blog-management-system-y5tx.onrender.com/dashboard/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch interactions");
      const data = await res.json();
      setInteractions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions();
  }, []);

  if (loading) return <p>Loading interactions...</p>;
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
            <span onClick={() => navigate("/notifications")}>
              Notifications
            </span>
            <span onClick={() => navigate("/profile")}>Profile</span>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </nav>
        <div className="notifications-container">
          {interactions.length === 0 ? (
            <p className="no-notifications">
              You don’t have any notifications yet. When someone likes or
              comments on your posts, they will appear here.
            </p>
          ) : (
            interactions.map((post) => (
              <div key={post.post_id} className="notification-card">
                <h3>{post.post_title}</h3>
                <p>
                  Likes: {post.likes.length}
                  {post.likes.length > 0 &&
                    ` - ${post.likes.map((l) => l.user_name).join(", ")}`}
                </p>
                {post.comments.length > 0 && (
                  <div>
                    <strong>Comments:</strong>
                    <ul>
                      {post.comments.map((c, idx) => (
                        <li key={idx}>
                          <strong>{`by ${c.user_name}`}:</strong> {c.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
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
      </div>
    </>
  );
}
