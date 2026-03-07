import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Createposts.css";

export default function Createposts() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [limitMsg, setLimitMsg] = useState("");

  const handleLogout = () => {
    // 1. Remove token
    localStorage.removeItem("token");

    // 2. Redirect to landing page
    navigate("/", { replace: true });
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files)); // allows multiple files
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    images.forEach((img) => formData.append("images", img)); // multiple images

    try {
      const res = await fetch(
        "https://blog-management-system-y5tx.onrender.com/posts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (res.status === 403) {
        setLimitMsg(
          "You’ve reached your plan limit. Please upgrade your plan.",
        );
        setTimeout(() => setLimitMsg(""), 4000);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Something went wrong");
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("Post created:", data);
      setSuccess("🎉 Your post has been successfully created!");
      setTitle("");
      setContent("");
      setImages([]);
      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.log(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };
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
      {limitMsg && <div className="plan-limit-popup">{limitMsg}</div>}
      <div className="create-post-page">
        <h2>Share Your Thoughts ✨</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          {success && <p className="success">{success}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Post"}
          </button>
        </form>
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
