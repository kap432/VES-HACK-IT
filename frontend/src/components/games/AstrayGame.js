// frontend/src/components/games/AstrayGame.js
import React from "react";

const AstrayGame = () => {
  // If you've integrated the game logic into this component, include it here.
  // Otherwise, if the legacy code remains largely unchanged, you might still use an iframe:
  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <iframe
        src="/astray/index.html"  // Adjust if your Astray game is now part of the bundle
        title="Astray Game"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          filter: "brightness(1.2)" // Adjust brightness if needed
        }}
      ></iframe>
    </div>
  );
};

export default AstrayGame;
