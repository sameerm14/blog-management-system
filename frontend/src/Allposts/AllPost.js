import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Allpost.css";
import AIChat from "../Ai/AIChat";

export default function AllPost() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [comments, setComments] = useState({});
  const [showComment, setShowComment] = useState({});
  const [popupMsg, setPopupMsg] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

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
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const fetchPosts = async (pageNumber = 1, searchTerm = "") => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const query = new URLSearchParams({
        page: pageNumber,
        limit: 9,
        search: searchTerm,
      });
      const res = await fetch(
        `https://blog-management-system-y5tx.onrender.com/posts?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data.posts);
      setPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchUnreadCount();
  }, []);

  const handlePageChange = (newPage) => {
    fetchPosts(newPage);
  };

  // Toggle comment input for a specific post
  const toggleCommentInput = (postId) => {
    setShowComment({ ...showComment, [postId]: !showComment[postId] });
  };

  // Like button handler
  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://blog-management-system-y5tx.onrender.com/posts/${postId}/like`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.status === 403) {
        setPopupMsg("Upgrade your subscription to like more posts.");
        setTimeout(() => setPopupMsg(""), 4000);
        return;
      }

      if (!res.ok) throw new Error("Failed to like post");

      const data = await res.json();

      setPosts(
        posts.map((p) =>
          p.id === postId ? { ...p, likes: data.total_post_likes } : p,
        ),
      );
    } catch (err) {
      setPopupMsg(err.message);
      setTimeout(() => setPopupMsg(""), 4000);
    }
  };

  const handleComment = async (e, postId) => {
    e.preventDefault();
    const commentText = comments[postId];
    if (!commentText) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://blog-management-system-y5tx.onrender.com/posts/${postId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: commentText }),
        },
      );

      if (res.status === 403) {
        setPopupMsg("Upgrade your subscription to add more comments.");
        setTimeout(() => setPopupMsg(""), 4000);
        return;
      }

      if (!res.ok) throw new Error("Failed to add comment");

      setComments({ ...comments, [postId]: "" });
      setShowComment({ ...showComment, [postId]: false });
    } catch (err) {
      setPopupMsg(err.message);
      setTimeout(() => setPopupMsg(""), 4000);
    }
  };

  if (loading) return <p>Loading posts...</p>;
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
      {popupMsg && <div className="upgrade-popup">{popupMsg}</div>}
      <div className="posts-page">
        <div className="posts-container">
          {posts.length === 0 ? (
            <div className="no-posts-wrapper">
              <div className="no-posts-box">
                <h2>No Posts Found</h2>
              </div>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post-card">
                <h3>{post.title}</h3>
                <p className="post-author">Posted by {post.author_username}</p>
                <p>{post.content}</p>

                {post.images && (
                  <div className="post-images">
                    {(Array.isArray(post.images)
                      ? post.images
                      : [post.images]
                    ).map((img, i) => (
                      <img
                        key={i}
                        src={`https://blog-management-system-y5tx.onrender.com${img.replace("\\", "/")}`}
                        alt={`Post ${i}`}
                      />
                    ))}
                  </div>
                )}

                {/* Like & Comment buttons */}
                <div className="post-actions">
                  <button onClick={() => handleLike(post.id)}>
                    ❤️ Like ({post.likes || 0})
                  </button>
                  <button onClick={() => toggleCommentInput(post.id)}>
                    💬 Comment
                  </button>
                </div>

                {/* Comment input */}
                {showComment[post.id] && (
                  <form onSubmit={(e) => handleComment(e, post.id)}>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={comments[post.id] || ""}
                      onChange={(e) =>
                        setComments({ ...comments, [post.id]: e.target.value })
                      }
                    />
                    <button type="submit">Send</button>
                  </form>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
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

      <AIChat />
    </>
  );
}
