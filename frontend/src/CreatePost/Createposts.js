import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Createposts.css";
import AIChat from "../Ai/AIChat";
import { useAuth0 } from "@auth0/auth0-react";

export default function Createposts() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [limitMsg, setLimitMsg] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const [publishOption, setPublishOption] = useState("publish");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const { logout } = useAuth0();

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("publish_option", publishOption);

    if (publishOption === "schedule") {
      const scheduledAt = new Date(
        `${scheduleDate}T${scheduleTime}`,
      ).toISOString();

      formData.append("scheduled_at", scheduledAt);
    }

    images.forEach((img) => formData.append("images", img));

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
        return;
      }

      setSuccess("🎉 Post created successfully!");

      // RESET FORM
      setTitle("");
      setContent("");
      setImages([]);
      setScheduleDate("");
      setScheduleTime("");
      setPublishOption("publish");

      // 🔥 Redirect to My Posts
      setTimeout(() => {
        navigate("/my-posts");
      }, 1000);
    } catch (err) {
      console.log(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

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

          <div>
            <label>Publish Options</label>
            <select
              value={publishOption}
              onChange={(e) => setPublishOption(e.target.value)}
            >
              <option value="publish">Publish Now</option>
              <option value="draft">Save as Draft</option>
              <option value="schedule">Schedule Post</option>
            </select>
          </div>

          {publishOption === "schedule" && (
            <>
              <div>
                <label>Select Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Select Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {success && <p className="success">{success}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Post"}
          </button>
        </form>
      </div>

      <AIChat />
    </>
  );
}
