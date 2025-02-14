// frontend/src/components/PatientDashboard.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import ProgressGraph from "./ProgressGraph";
import "./patient-dashboard.css";

const PatientDashboard = () => {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchGames();
    fetchProgress();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, redirecting to login");
        navigate("/login");
        return;
      }
      const res = await axios.get("http://localhost:5000/api/auth/user", {
        headers: { "x-auth-token": token },
      });
      console.log("User data fetched:", res.data);
      setUser(res.data);
    } catch (error) {
      console.error("Failed to load user data:", error);
      setError("Failed to load user data.");
    }
  };

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found in fetchGames, redirecting to login");
        navigate("/login");
        return;
      }
      const res = await axios.get("http://localhost:5000/api/patient/games", {
        headers: { "x-auth-token": token },
      });
      console.log("Games fetched:", res.data);
      setGames(res.data);
    } catch (error) {
      console.error("Failed to load games:", error);
      setError("Failed to load games.");
    }
  };

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found in fetchProgress, redirecting to login");
        navigate("/login");
        return;
      }
      const res = await axios.get("http://localhost:5000/api/patient/progress", {
        headers: { "x-auth-token": token },
      });
      console.log("Progress fetched:", res.data);
      setProgressData(res.data);
    } catch (error) {
      console.error("Failed to load progress:", error);
      setError("Failed to load progress.");
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Logout function: clear token and navigate to login page
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <a href="/" className="logo">
          GameTherapy
        </a>
        <div className="menu">
          <Link to="/dashboard">Home</Link>
          <Link to="/games">Games</Link>
          <Link to="/pages/profile">Profile</Link>
          <Link to="/tasks">Tasks</Link>
        </div>
        <div className="profile-dropdown" ref={dropdownRef}>
          <img
            src={user?.profilePic || "/profile-icon.png"}
            alt="Profile"
            className="profile-pic"
            onClick={toggleDropdown}
          />
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <img
                  src={user?.profilePic || "/profile-icon.png"}
                  alt="Profile"
                  className="dropdown-profile-pic"
                />
                <div className="dropdown-user-info">
                  <p className="dropdown-name">{user?.name || "User Name"}</p>
                  <p className="dropdown-email">{user?.email || "user@example.com"}</p>
                </div>
              </div>
              <div className="dropdown-divider" />
              <Link to="/pages/profile" className="dropdown-item">
                Profile
              </Link>
              <Link to="/settings" className="dropdown-item">
                Settings
              </Link>
              <div className="dropdown-divider" />
              <button onClick={handleLogout} className="dropdown-item logout-btn">
                Sign out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Dashboard Container */}
      <div className="dashboard-container">
        <main className="main-content">
          {error && <p className="error">{error}</p>}
          <section className="game-section">
            <h2>Available Games</h2>
            {games.length > 0 ? (
              <div className="game-grid">
                {games.map((game) => (
                  <div className="game-card" key={game.id}>
                    <img
                      src={game.image || `/game_${game.id}.jpeg`}
                      alt={game.title}
                    />
                    <h4>{game.title}</h4>
                    <p>{game.description}</p>
                    <button onClick={() => navigate(`/games/${game.id}`)}>
                      Play Now
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-games">No games available.</p>
            )}
          </section>

          <section className="progress-section">
            <h2>Your Progress</h2>
            {progressData.length > 0 ? (
              <ProgressGraph progress={progressData} />
            ) : (
              <p>No progress recorded yet.</p>
            )}
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">
        © 2025 GameTherapy. All Rights Reserved.
      </footer>
    </>
  );
};

export default PatientDashboard;
