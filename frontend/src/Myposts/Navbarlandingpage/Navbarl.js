import React from "react";
import "./Navbarl.css";
import { useNavigate } from "react-router-dom";

export default function Navbarl() {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <h2 className="logo" onClick={() => navigate("/")}>
        BlogPlatform
      </h2>
    </nav>
  );
}
