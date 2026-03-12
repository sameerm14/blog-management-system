import React, { useEffect, useState } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import AIChat from "../Ai/AIChat";
import { useAuth0 } from "@auth0/auth0-react";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { logout } = useAuth0();

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
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await fetch(
          "https://blog-management-system-y5tx.onrender.com/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setMobile(data.mobile || "");
          setAddress(data.address || "");
        } else {
          setError("Failed to fetch profile.");
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchUnreadCount();
    fetchProfile();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    if (mobile) formData.append("mobile", mobile);
    if (address) formData.append("address", address);
    if (image) formData.append("image", image);

    try {
      const res = await fetch(
        "https://blog-management-system-y5tx.onrender.com/profile",
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => ({ ...prev, ...data }));
        setEditMode(false);
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

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
      <div className="profile-page">
        <div className="dashboard">
          <div className="welcome-section">
            <h1>Welcome back, {profile.username}!</h1>
            <p className="profile-greeting">
              Here’s a summary of your profile and settings.
            </p>

            {profile && (
              <div className="profile-card">
                {profile.profile_image && (
                  <img
                    src={`https://blog-management-system-y5tx.onrender.com${profile.profile_image}`}
                    alt="Profile"
                    className="profile-img"
                  />
                )}

                {!editMode ? (
                  <>
                    <p>
                      <strong>Username:</strong> {profile.username}
                    </p>
                    <p>
                      <strong>Email:</strong> {profile.email}
                    </p>
                    <p>
                      <strong>Mobile:</strong> {profile.mobile || "Not set"}
                    </p>
                    <p>
                      <strong>Address:</strong> {profile.address || "Not set"}
                    </p>
                    <button
                      className="edit-btn"
                      onClick={() => setEditMode(true)}
                    >
                      Update Profile
                    </button>
                  </>
                ) : (
                  <form className="update-form" onSubmit={handleUpdate}>
                    <label>
                      Mobile:
                      <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter mobile number"
                      />
                    </label>
                    <label>
                      Address:
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter address"
                      />
                    </label>
                    <label>
                      Profile Image:
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                      />
                    </label>
                    <div className="form-buttons">
                      <button type="submit" disabled={updating}>
                        {updating ? "Updating..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
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
