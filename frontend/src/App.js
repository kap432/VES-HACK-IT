import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Register from "./components/Register";
import Login from "./components/Login";
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import MemoryMatch from "./components/games/MemoryMatch";
import MathQuiz from "./components/games/MathQuiz";
import WordScramble from "./components/games/WordScramble";
import Chatroom from "./components/chatroom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/games/1" element={<MemoryMatch />} />
        <Route path="/games/2" element={<MathQuiz />} />
        <Route path="/games/3" element={<WordScramble />} />
        <Route path="/Chatroom" element={<Chatroom />} /> {/* Chatroom route */}
      </Routes>
    </Router>
  );
}

export default App;
