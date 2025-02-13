import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
//import "./PatientGames.css"; // Optional: for styling

const PatientGames = () => {
  const { patientId } = useParams(); // Get the patient ID from the URL
  const [gamesData, setGamesData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");

  // Function to fetch game progress for the patient
  const fetchPatientGames = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/guardian/patient/${patientId}`,
        { headers: { "x-auth-token": token } }
      );
      setGamesData(res.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching patient games:", error.response?.data || error.message);
      setErrorMessage("Failed to load game data for this patient.");
    }
  };

  useEffect(() => {
    fetchPatientGames();
  }, [patientId]);

  return (
    <div className="patient-games">
      <h2>Game Details for Patient</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {gamesData.length > 0 ? (
        <div className="games-list">
          {gamesData.map((game) => (
            <div key={game.sessionId} className="game-card">
              <p><strong>Game:</strong> {game.gameName}</p>
              <p><strong>Score:</strong> {game.score}</p>
              <p><strong>Mistakes:</strong> {game.mistakes}</p>
              <p><strong>Total Time:</strong> {game.totalTime} seconds</p>
              <p><strong>Levels:</strong> {game.startLevel} to {game.endLevel}</p>
              <p><strong>Completed:</strong> {game.completed ? "Yes" : "No"}</p>
              <p><strong>Session ID:</strong> {game.sessionId}</p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(game.timestamp).toLocaleString()}
              </p>
              <hr />
            </div>
          ))}
        </div>
      ) : (
        <p>No game progress data found for this patient.</p>
      )}
    </div>
  );
};

export default PatientGames;
