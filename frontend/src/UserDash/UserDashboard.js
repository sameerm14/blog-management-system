import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./UserDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);
export default function UserDashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("https://blog-management-system-y5tx.onrender.com/user/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.posts.map((p) => p.created_at)); // <-- check raw dates
        setDashboard(data);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!dashboard)
    return <p style={{ textAlign: "center", margin: "2rem" }}>Loading...</p>;

  const {
    total_posts,
    total_comments_made,
    total_likes_received,
    total_views,
    posts,
  } = dashboard;

  // Chart data...
  const postTitles = posts.map((p) => p.title);
  const likes = posts.map((p) => p.likes);
  const comments = posts.map((p) => p.comments);

  const barData = {
    labels: postTitles,
    datasets: [
      {
        label: "Likes",
        data: likes,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
      {
        label: "Comments",
        data: comments,
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Post Engagement" },
    },
  };
  const lineLabels = posts.map((p) => {
    let date = null;

    // Case: timestamp in seconds
    if (typeof p.created_at === "number" && p.created_at < 1000000000000) {
      date = new Date(p.created_at * 1000); // convert seconds → ms
    }
    // Case: timestamp in ms
    else if (typeof p.created_at === "number") {
      date = new Date(p.created_at);
    }
    // Case: string like "YYYYMMDD"
    else if (typeof p.created_at === "string" && /^\d{8}$/.test(p.created_at)) {
      const str = p.created_at;
      date = new Date(
        `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`,
      );
    }
    // Case: ISO string
    else if (typeof p.created_at === "string") {
      date = new Date(p.created_at);
    }

    return date && !isNaN(date.getTime())
      ? date.toLocaleDateString()
      : "Unknown";
  });
  const lineData = posts.map((p) => p.likes + p.comments);

  const lineChartData = {
    labels: lineLabels,
    datasets: [
      {
        label: "Activity (Likes+Comments)",
        data: lineData,
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Post Activity Over Time" },
    },
  };

  return (
    <div className="user-stats">
      <div className="dashboard-stats">
        <div className="stats-cards">
          <div className="card">
            <h3>Total Posts</h3>
            <p>{total_posts}</p>
          </div>
          <div className="card">
            <h3>Total Comments</h3>
            <p>{total_comments_made}</p>
          </div>
          <div className="card">
            <h3>Total Likes Received</h3>
            <p>{total_likes_received}</p>
          </div>
          <div className="card">
            <h3>Total Views</h3>
            <p>{total_views}</p>
          </div>
        </div>

        <div className="charts">
          <div className="chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
          <div className="chart-container">
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
