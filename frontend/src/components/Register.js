import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "player",
    guardianEmail: "", // Guardian email input
    selfMonitor: false, // Checkbox state
  });

  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = () => {
    setUser((prevState) => ({
      ...prevState,
      selfMonitor: !prevState.selfMonitor,
      guardianEmail: prevState.selfMonitor ? "" : prevState.guardianEmail, // Clear guardian email if self-monitoring
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestBody = { ...user };

      // Remove guardianEmail for guardians & doctors
      if (user.role !== "player") {
        delete requestBody.guardianEmail;
        delete requestBody.selfMonitor;
      } else if (user.selfMonitor) {
        requestBody.guardianEmail = ""; // No guardian required if self-monitoring
      }

      await axios.post("http://localhost:5000/api/auth/register", requestBody, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Request Body:", requestBody);

      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      setErrorMessage(error.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Register
        </h2>

        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />

          {/* Role Selection */}
          <select
            name="role"
            value={user.role}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="player">Player</option>
            <option value="doctor">Doctor</option>
            <option value="guardian">Guardian</option>
          </select>

          {/* Show Guardian Input Only for Players */}
          {user.role === "player" && (
            <>
              <input
                type="email"
                name="guardianEmail"
                placeholder="Guardian's Email (if applicable)"
                value={user.guardianEmail}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={user.selfMonitor}
              />

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="selfMonitor"
                  checked={user.selfMonitor}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                I will monitor my own progress
              </label>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
