import React, { useEffect, useState } from "react";
import "./Myposts.css";
import { useNavigate } from "react-router-dom";
import AIChat from "../Ai/AIChat";
import { useAuth0 } from "@auth0/auth0-react";

export default function Myposts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const { logout } = useAuth0();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
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

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "https://blog-management-system-y5tx.onrender.com/posts/mine",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch your posts");

        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
    fetchUnreadCount();
  }, []);

  const handleDelete = async (postId) => {
    const token = localStorage.getItem("token");

    await fetch(
      `https://blog-management-system-y5tx.onrender.com/posts/${postId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handlePublish = async (postId) => {
    const token = localStorage.getItem("token");

    await fetch(
      `https://blog-management-system-y5tx.onrender.com/posts/${postId}/publish`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    // Refresh page after publishing
    window.location.reload();
  };

  if (loading) return <p>Loading your posts...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <nav className="navbar">
        <div className="logo">BlogPlatform</div>

        <div className="nav-links">
          <span onClick={() => navigate("/dashboard")}>Home</span>
          <span onClick={() => navigate("/my-posts")}>My Posts</span>
          <span onClick={() => navigate("/getposts")}>All Posts</span>
          <span onClick={() => navigate("/plans")}>Plans</span>
          <span onClick={() => navigate("/invoices")}>My Invoices</span>

          <span onClick={() => navigate("/notifications")}>
            🔔{" "}
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

      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="no-posts-wrapper">
            <div className="no-posts-box">
              <h2>No posts found.</h2>
            </div>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <h3>{post.title}</h3>

              {/* Show Status */}
              <p>
                <strong>Status:</strong> {post.status}
              </p>

              <p>{post.content}</p>

              <div className="post-images">
                {post.images?.map((img, i) => (
                  <img
                    key={i}
                    src={`https://blog-management-system-y5tx.onrender.com${img.replace(/\\/g, "/")}`}
                    alt={`Post ${i}`}
                  />
                ))}
              </div>

              {/* Publish Button for Draft */}
              {post.status === "draft" && (
                <button
                  className="publish-btn"
                  onClick={() => handlePublish(post.id)}
                >
                  Publish
                </button>
              )}

              <button
                className="delete-btn"
                onClick={() => handleDelete(post.id)}
              >
                Delete Post
              </button>
            </div>
          ))
        )}
      </div>

      <AIChat />
    </>
  );
}
