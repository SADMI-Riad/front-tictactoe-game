import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./GameStyles.css"; // Assurez-vous d'importer le CSS

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = location.state || {};
  const [board, setBoard] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const [player, setPlayer] = useState();
  const [bot, setBot] = useState();
  const [gameOver, setGameOver] = useState(false);
  const [turn, setTurn] = useState(null);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [draw, setDraw] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);

  const hasFetchedData = useRef(false); // Flag pour contrôler l'exécution de fetchData

  // Fetching data
  useEffect(() => {
    if (hasFetchedData.current) return; // Éviter les appels multiples
    hasFetchedData.current = true; // Marquer fetchData comme exécuté

    const fetchData = async () => {
      try {
        const response = await axios.post(
          "https://ria5d.pythonanywhere.com/pick_mode",
          {
            mode,
          }
        );
        const { player, bot, currentTurn, bot_move } = response.data;
        setPlayer(player);
        setBot(bot);
        setTurn(currentTurn);

        if (bot_move) {
          const { i, j } = bot_move;
          setBoard((prevBoard) => {
            const newBoard = prevBoard.map((row, rowIndex) =>
              row.map((cell, colIndex) =>
                rowIndex === i && colIndex === j ? bot : cell
              )
            );
            return newBoard;
          });
        }
      } catch (error) {
        console.error("Error fetching Player and Bot", error);
      }
    };

    fetchData();
  }, [mode]);

  const handleClick = async (i, j) => {
    if (board[i][j] || gameOver || turn !== player) return; // Vérifiez que c'est le tour du joueur

    try {
      const response = await axios.post(
        "https://ria5d.pythonanywhere.com/move",
        {
          i,
          j,
          turn,
        }
      );
      const { winner, winning_line, bot_move, currentTurn, draw } =
        response.data;

      setBoard((prevBoard) => {
        let updatedBoard = prevBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) =>
            rowIndex === i && colIndex === j ? player : cell
          )
        );

        if (bot_move) {
          const { i: bi, j: bj } = bot_move;
          updatedBoard = updatedBoard.map((row, rowIndex) =>
            row.map((cell, colIndex) =>
              rowIndex === bi && colIndex === bj ? bot : cell
            )
          );
        }

        return updatedBoard;
      });

      setTurn(currentTurn);

      if (winner) {
        setGameOver(true);
        setWinner(winner);
        setWinningLine(winning_line);

        // Mettre à jour le score
        if (winner === player) {
          setPlayerScore((prevScore) => prevScore + 1);
        } else if (winner === bot) {
          setBotScore((prevScore) => prevScore + 1);
        }
      } else if (draw) {
        setGameOver(true);
        setDraw(true);
      }
    } catch (error) {
      console.error("Error during move:", error);
    }
  };

  const resetGame = async () => {
    try {
      await axios.post("https://ria5d.pythonanywhere.com/reset");
      setBoard([
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]);
      setGameOver(false);
      setWinner(null);
      setWinningLine(null);
      setDraw(false);
      hasFetchedData.current = false; // Réinitialiser le flag
      // Recharger les données initiales
      const response = await axios.post(
        "https://ria5d.pythonanywhere.com/pick_mode",
        {
          mode,
        }
      );
      const { player, bot, currentTurn, bot_move } = response.data;
      setPlayer(player);
      setBot(bot);
      setTurn(currentTurn);

      if (bot_move) {
        const { i, j } = bot_move;
        setBoard((prevBoard) => {
          const newBoard = prevBoard.map((row, rowIndex) =>
            row.map((cell, colIndex) =>
              rowIndex === i && colIndex === j ? bot : cell
            )
          );
          return newBoard;
        });
      }
    } catch (error) {
      console.error("Error resetting the game:", error);
    }
  };

  const changeMode = () => {
    navigate("/");
  };

  // Fonction pour obtenir la classe CSS de la ligne gagnante et définir les variables CSS correspondantes
  const getWinningClass = () => {
    if (!winningLine || winningLine.length === 0) return "";
    const [[x1, y1], , [x3, y3]] = winningLine;

    if (x1 === x3) {
      document.documentElement.style.setProperty("--winning-row", x1);
      return "winning-row";
    } else if (y1 === y3) {
      document.documentElement.style.setProperty("--winning-column", y1);
      return "winning-column";
    } else if (x1 === y1 && x1 + y1 === 2) {
      return "winning-diagonal-anti";
    } else {
      return "winning-diagonal-main";
    }
  };

  return (
    <div className="container">
      {/* Affichage du score */}
      <div className="scoreboard">
        <div>
          Vous ({player}): {playerScore}
        </div>
        <div>
          Bot ({bot}): {botScore}
        </div>
      </div>

      {/* Affichage du message concernant le tour */}
      {!gameOver && (
        <div className="message">
          {turn === player
            ? "C'est à votre tour !"
            : "Le bot est en train de jouer..."}
        </div>
      )}

      {/* Plateau de jeu */}
      <div className={`game-board ${gameOver ? getWinningClass() : ""}`}>
        {board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`cell ${
                winningLine && winningLine.some(([x, y]) => x === i && y === j)
                  ? "winning-cell"
                  : ""
              }`}
              onClick={() => handleClick(i, j)}
            >
              <div className="cell-content">{cell}</div>
            </div>
          ))
        )}
      </div>

      {/* Messages de fin de jeu */}
      {gameOver && draw && <div className="draw-message">Match nul !</div>}
      {gameOver && !draw && (
        <div className="winner-message">Le gagnant est : {winner}</div>
      )}

      {/* Boutons de contrôle */}
      {gameOver && (
        <div className="control-buttons">
          <button className="reset-btn" onClick={resetGame}>
            Rejouer
          </button>
          <button className="change-mode-btn" onClick={changeMode}>
            Changer de Mode
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
