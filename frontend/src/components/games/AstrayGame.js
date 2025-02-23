// frontend/src/components/games/AstrayGame.js
import React, { useEffect, useRef } from "react";
import axios from "axios";

const AstrayGame = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      // Optionally check event.origin for security (e.g., event.origin === "http://localhost:3000").
      if (event.data) {
        if (event.data.type === "sessionStarted") {
          console.log("Session started from game:", event.data.sessionId);
          localStorage.setItem("astraySessionId", event.data.sessionId);
        }
        if (event.data.type === "progressUpdate") {
          console.log("Received progress update from game:", event.data.progress);
          axios
            .post("http://localhost:5000/api/games/progress", event.data.progress, {
              headers: {
                "x-auth-token": localStorage.getItem("token"),
                "Content-Type": "application/json"
              }
            })
            .then((response) => {
              console.log("Progress updated on backend:", response.data);
            })
            .catch((error) => {
              console.error("Error updating progress on backend:", error);
            });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    // Container that forces full viewport usage
    <div
      style={{
        margin: 0,
        padding: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <iframe
        ref={iframeRef}
        src="/astray/index.html"
        title="Astray Game"
        style={{
          flex: "1 1 auto",    // Let the iframe grow/shrink to fill space
          width: "100%",
          border: "none",
          display: "block",    // Removes default iframe inline-block spacing
          // Optional: "filter" can be added here if you still want brightness
          // filter: "brightness(1.2)"
        }}
      ></iframe>
    </div>
  );
};

export default AstrayGame;
