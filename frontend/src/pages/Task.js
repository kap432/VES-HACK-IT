// frontend/src/components/pages/Task.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import "./Task.css"; // Create and adjust styling as needed

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Optional: If you need the logged in user id, you can fetch it from the auth endpoint.
  const [userId, setUserId] = useState("");

  // Fetch the logged-in user's details to get the id
  const fetchUserDetails = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/user", {
        headers: { "x-auth-token": token },
      });
      setUserId(res.data._id);
    } catch (error) {
      console.error("Error fetching user details:", error.response?.data || error.message);
      setErrorMessage("Failed to load user details.");
    }
  };

  // Fetch tasks for the logged-in patient
  const fetchTasks = async () => {
    try {
      // Use the userId from the state
      const res = await axios.get(`http://localhost:5000/api/tasks/${userId}`, {
        headers: { "x-auth-token": token },
      });
      setTasks(res.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching tasks:", error.response?.data || error.message);
      setErrorMessage("Failed to load tasks.");
    }
  };

  useEffect(() => {
    // First, fetch user details then tasks
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  return (
    <div className="task-page">
      <h2>My Tasks</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {tasks.length > 0 ? (
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task._id} className="task-card">
              <p><strong>Task:</strong> {task.taskDescription}</p>
              <p><strong>Time:</strong> {task.startTime} - {task.endTime}</p>
              <p>
                <strong>Date:</strong> {new Date(task.taskDate).toLocaleDateString()}
              </p>
              <hr />
            </div>
          ))}
        </div>
      ) : (
        <p>No tasks assigned yet.</p>
      )}
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
};

export default Task;
