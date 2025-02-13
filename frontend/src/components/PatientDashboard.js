import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProgressGraph from "./ProgressGraph";
import "./patient-dashboard.css";

const PatientDashboard = () => {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchGames();
    fetchProgress();
  }, []);

  // Fetch User Data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/auth/user", {
        headers: { "x-auth-token": token },
      });
      setUser(res.data);
    } catch (error) {
      setError("Failed to load user data.");
    }
  };

  // Fetch Games
  const fetchGames = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/patient/games", {
        headers: { "x-auth-token": token },
      });
      setGames(res.data);
    } catch (error) {
      setError("Failed to load games.");
    }
  };

  // Fetch Progress Data
  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/api/patient/progress",
        {
          headers: { "x-auth-token": token },
        }
      );
      setProgressData(res.data);
    } catch (error) {
      setError("Failed to load progress.");
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <a href="/" className="logo">
          GameTherapy
        </a>
        <div className="menu">
          <a href="/dashboard">Home</a>
          <a href="/games">Games</a>
          <a href="/profile">Profile</a>
          <a href="/logout">Logout</a>
        </div>
      </nav>

      {/* Dashboard Container */}
      <div className="dashboard-container">
        {/* Sidebar Profile */}
        <aside className="sidebar">
          {user && (
            <>
              <img
                src={
                  user.profilePic ||
                  `https://yourserver.com/uploads/users/user_${user.id}.jpg`
                }
                alt="User Profile"
              />
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <button onClick={() => navigate("/logout")}>Logout</button>
            </>
          )}
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Error Message */}
          {error && <p className="error">{error}</p>}

          {/* Game Section */}
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
              <p>No games available.</p>
            )}
          </section>

          <div className="chatroom-card">
            <h2>Join the Chatroom</h2>
            <p>Connect with others and discuss freely.</p>
            <button onClick={() => navigate("/chatroom")}>
              Enter Chatroom
            </button>
          </div>

          {/* Progress Graph Section */}
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
