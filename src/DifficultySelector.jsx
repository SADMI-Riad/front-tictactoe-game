import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GameStyles.css";

function DifficultySelector() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      setShowButtons(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = (level) => {
    setMode(level);
    navigate("/game", { state: { mode: level } });
  };

  return (
    <div>
      <div className="container">
        {showWelcome && (
          <h1 className="welcome-message">Welcome to Tic-Tac-Toe Game</h1>
        )}
        {showButtons && (
          <>
            <h1>Choose Bot Difficulty:</h1>
            <button onClick={() => handleClick("Easy")}>Easy Mode</button>
            <button onClick={() => handleClick("Medium")}>Medium Mode</button>
            <button onClick={() => handleClick("Hard")}>Hard Mode</button>
            <div className="footer">Good Luck!</div>
          </>
        )}
        {mode}
      </div>
    </div>
  );
}

export default DifficultySelector;
