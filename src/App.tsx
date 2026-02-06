import { useState, useEffect } from "react";
import {
  getWinner,
  type CellIndex,
  type GameState,
  type Board,
  type UUID,
  type CellProps,
} from "./tic-tac-toe";
import "./App.css";
import {
  sendMove,
  requestGames,
  requestJoinGame,
  requestNewGame,
} from "./services/api.ts";
import { CurrentGame } from "./components/currentGame.tsx";
import { Lobby } from "./components/lobby.tsx";

function App() {
  const [currentGameState, setCurrentGameState] = useState<GameState | null>(
    null,
  );
  const [currentBoardID, setcurrentBoardID] = useState<UUID | null>(null); // Start with null
  const [games, setGames] = useState<Array<UUID> | null>(null);

  useEffect(() => {
    console.log("creating new game!");
    const init = async () => {
      const startGameList = await getGames();

      if (!startGameList) {
        await createGame();
        await getGames();
      }
      console.log("listing games!");
    };
    init();
  }, []);

  async function createGame() {
    const newGame = await requestNewGame(); // API call
    setCurrentGameState(newGame);
    setGames(await getGames()); // Refresh the games list!
    return newGame; // Update state
  }

  async function joinGame(game: UUID) {
    const updatedGameState = await requestJoinGame(game); // API call
    setcurrentBoardID(game);
    setCurrentGameState(updatedGameState);
    return updatedGameState; // Update state
  }

  async function enterLobby() {
    setcurrentBoardID(null);
    setCurrentGameState(null);
  }

  async function getGames() {
    const gamesList = await requestGames(); // API call
    setGames(gamesList);
    return gamesList; // Update state
  }

  async function makeMove(currentGame: UUID, index: CellIndex) {
    const updatedGameState = await sendMove({ currentGame, index }); // API call
    setCurrentGameState(updatedGameState);
    return updatedGameState; // Update state
  }

  if (!games) {
    return "Loading";
  }

  return currentBoardID && currentGameState ? (
    <CurrentGame
      board_id={currentBoardID}
      currentGameState={currentGameState}
      onMove={(index) => makeMove(currentBoardID, index)}
      enterLobby={() => enterLobby()}
      setCurrentGameState={(gameState) => setCurrentGameState(gameState)}
    />
  ) : (
    <Lobby
      games={games}
      onJoin={(game: UUID) => joinGame(game)}
      createGame={() => createGame()}
    />
  );
}

export default App;
