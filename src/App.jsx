import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DifficultySelector from "./DifficultySelector";
import Game from "./Game";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DifficultySelector />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
