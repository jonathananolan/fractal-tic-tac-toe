import express from "express";
import viteExpress from "vite-express";
import {
  makeMove,
  createGameBoard,
  GameState,
  UUID,
} from "./src/tic-tac-toe.ts";

const app = express();

app.use(express.json());

export const gameStates = new Map<UUID, GameState>([
  [crypto.randomUUID(), createGameBoard()],
]);

app.get("/api/games", (req, res) => {
  const gamesList = Array.from(gameStates.entries());
  res.json(gamesList);
});

app.post("/api/games/:board_id/move", (req, res) => {
  const { board_id } = req.params;
  const { index } = req.body;
  const updatedBoardState = makeMove(gameStates, board_id, index);
  gameStates.set(board_id, updatedBoardState);
  const UpdatedGameState = { id: board_id, ...updatedBoardState };
  res.json(UpdatedGameState);
});

app.get("/api/games/:board_id", (req, res) => {
  const { board_id } = req.params;
  const boardState = gameStates.get(board_id);
  if (!boardState) {
    return res.status(404).json({ Error: "Game not found" });
  }
  const gamestate = { id: board_id, ...boardState };
  res.json(gamestate);
});

app.post("/api/createNewGame", (req, res) => {
  const newBoard = createGameBoard();
  const gameUUID = crypto.randomUUID();
  gameStates.set(gameUUID, newBoard);
  console.log(gameStates);

  const gamestate = { id: gameUUID, ...newBoard };
  res.json(gamestate);
});

const PORT = 3005;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
