import React, { useState, useEffect } from "react";
import axios from "axios";

const GuardianDashboard = () => {
  const [playersData, setPlayersData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");

  const fetchPlayersGameDetails = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/guardian/players/games", {
        headers: { "x-auth-token": token },
      });
      setPlayersData(res.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching players' game details:", error.response?.data || error.message);
      setErrorMessage("Failed to load players' game data.");
    }
  };

  useEffect(() => {
    fetchPlayersGameDetails();
  }, []);

  return (
    <div className="guardian-dashboard">
      <h2>Guardian Dashboard</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {playersData.length > 0 ? (
        <div className="players-list">
          <h3>My Players and Their Game Details</h3>
          {playersData.map(({ player, progress }) => (
            <div key={player._id} className="player-card">
              <p><strong>Name:</strong> {player.name}</p>
              <p><strong>Email:</strong> {player.email}</p>
              {progress && progress.length > 0 ? (
                <div className="progress-list">
                  <h4>Game Progress:</h4>
                  {progress.map((entry) => (
                    <div key={entry.sessionId} className="progress-entry">
                      <p><strong>Game:</strong> {entry.gameName}</p>
                      <p>
                        <strong>Score:</strong> {entry.score} |{" "}
                        <strong>Mistakes:</strong> {entry.mistakes} |{" "}
                        <strong>Total Time:</strong> {entry.totalTime}
                      </p>
                      <p>
                        <strong>Levels:</strong> {entry.startLevel} to {entry.endLevel}
                      </p>
                      <p>
                        <strong>Completed:</strong> {entry.completed ? "Yes" : "No"}
                      </p>
                      <hr />
                    </div>
                  ))}
                </div>
              ) : (
                <p>No game progress found for this player.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No players associated with this guardian.</p>
      )}
    </div>
  );
};

export default GuardianDashboard;
