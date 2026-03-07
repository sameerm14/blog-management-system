import React, { useEffect, useState } from "react";
import "./Myposts.css";
import { useNavigate } from "react-router-dom";

export default function Myposts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "",
    onConfirm: null,
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  // Fetch my posts
  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/posts/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch your posts");
        const data = await res.json();

        setPosts(data);
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, []);

  // Delete a post
  const handleDelete = (postId) => {
    setPopup({
      show: true,
      message: "Are you sure you want to delete this post?",
      type: "confirm",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("token");

          const res = await fetch(
            `https://blog-management-system-y5tx.onrender.com/posts/${postId}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (!res.ok) throw new Error("Failed to delete post");

          setPosts((prev) => prev.filter((post) => post.id !== postId));
        } catch (err) {
          setPopup({
            show: true,
            message: err.message,
            type: "alert",
          });
        }
      },
    });
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
          <span onClick={() => navigate("/notifications")}>Notifications</span>
          <span onClick={() => navigate("/profile")}>Profile</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>
      {popup.show && (
        <div className="popup-overlay">
          <div className="popup-box">
            <p>{popup.message}</p>

            <div className="popup-buttons">
              {popup.type === "confirm" && (
                <button
                  className="popup-confirm"
                  onClick={() => {
                    popup.onConfirm && popup.onConfirm();
                    setPopup({ show: false });
                  }}
                >
                  Yes
                </button>
              )}

              <button
                className="popup-cancel"
                onClick={() => setPopup({ show: false })}
              >
                {popup.type === "confirm" ? "No" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="no-posts-wrapper">
            <div className="no-posts-box">
              <h2>You haven't created any posts yet.</h2>
              <p>Be the first one to share something amazing ✨</p>
            </div>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <h3>{post.title}</h3>
              <p>{post.content}</p>

              <div className="post-images">
                {post.images.map((img, i) => (
                  <img
                    key={i}
                    src={`http://localhost:8000${img.replace(/\\/g, "/")}`}
                    alt={`Post ${i}`}
                  />
                ))}
              </div>

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
    </>
  );
}
