import React from "react";
import { useEffect, useState } from "react";

import "./Myinvoice.css";
import { useNavigate } from "react-router-dom";
export default function Myinvoice() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("https://blog-management-system-y5tx.onrender.com/my-invoices", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setInvoices(data))
      .catch((err) => console.log(err));
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
          <span onClick={() => navigate("/notifications")}>Notifications</span>
          <span onClick={() => navigate("/profile")}>Profile</span>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <div className="invoice-container">
        <h2 className="invoice-title">My Invoices</h2>

        {invoices.length === 0 ? (
          <p className="no-invoice">No invoices yet</p>
        ) : (
          invoices.map((inv, index) => (
            <div key={index} className="invoice-card">
              <p className="invoice-info">
                <b>Amount:</b> ₹{inv.amount}
              </p>

              <p className="invoice-info">
                <b>Start:</b> {inv.start_date}
              </p>

              <p className="invoice-info">
                <b>End:</b> {inv.end_date}
              </p>

              <a
                className="invoice-btn"
                href={`http://localhost:8000/${inv.invoice}`}
                target="_blank"
                rel="noreferrer"
              >
                View Invoice
              </a>
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
          </div>

          <div className="footer-right">
            <p>© 2026 BlogPlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
