// frontend/src/pages/Profile.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const token = localStorage.getItem("token");

  // Fetch the current profile details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/detail", {
          headers: { "x-auth-token": token },
        });
        // Use the fetched user details for editing as well as display
        setProfile(res.data);
        setEditName(res.data.name);
        setEditEmail(res.data.email);
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data || error.message);
        setErrorMessage("Failed to load profile.");
      }
    };
    fetchProfile();
  }, [token]);

  // Function to handle profile update submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(
        "http://localhost:5000/api/detail",
        { name: editName, email: editEmail },
        { headers: { "x-auth-token": token, "Content-Type": "application/json" } }
      );
      setProfile(res.data.detail);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      setErrorMessage("Failed to update profile.");
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      
      {profile ? (
        <div className="profile-detail">
          <p><strong>User ID:</strong> {profile._id}</p>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <button onClick={() => setIsEditing(true)} className="edit-btn">
            Edit Profile
          </button>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}

      {/* Sliding Edit Form */}
      <div className={`edit-form-container ${isEditing ? "open" : ""}`}>
        <form onSubmit={handleUpdate} className="edit-form">
          <h3>Edit Profile</h3>
          <label>
            Name:
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
          </label>
          <div className="form-buttons">
            <button type="submit">Update</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
