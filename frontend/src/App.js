import AllPost from "./Allposts/AllPost";
import "./App.css";
import AuthCallback from "./AuthCallback";
import AuthSync from "./AuthSync";
import Createposts from "./CreatePost/Createposts";
import Dashboard from "./Dashboard/Dashboard";
import Myinvoice from "./Invoices/Myinvoice";
import Login from "./Login/Login";
import Myposts from "./Myposts/Myposts";
import Notification from "./Notifications/Notification";
import Profile from "./Profile/Profile";
import Register from "./Register/Register";
import Plans from "./Subscriptions/Plans";
import Welcome from "./WelcomePage/Welcome";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <AuthSync />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-post" element={<Createposts />} />
        <Route path="/my-posts" element={<Myposts />} />
        <Route path="/getposts" element={<AllPost />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/login/callback" element={<AuthCallback />} />
        <Route path="/invoices" element={<Myinvoice />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
