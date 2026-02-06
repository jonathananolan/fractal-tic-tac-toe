import express from "express";
import viteExpress from "vite-express";
import {
  makeMove,
  createGameBoard,
  GameState,
  UUID,
} from "./src/tic-tac-toe.ts";

const app = express();
var expressWs = require("express-ws")(app);

app.use(express.json());

export const gameStates = new Map<UUID, GameState>([
  [crypto.randomUUID(), createGameBoard()],
]);

const webSocketUsers = new Map<UUID, Set<WebSocket>>();

app.ws("/ws/:board_id", (ws, req) => {
  const { board_id } = req.params;
  ws.send(JSON.stringify(gameStates.get(board_id)));

  //create a new empty set for the board id if it's not already there
  let connections = webSocketUsers.get(board_id);
  if (!connections) {
    connections = new Set();
    webSocketUsers.set(board_id, connections);
  }
  connections.add(ws);

  ws.on("close", () => {
    const connection = webSocketUsers.get(board_id);
    connections.delete(ws);
    console.log("removed from websocket");
  });
});

app.get("/api/games", (req, res) => {
  const gamesList = Array.from(gameStates.keys());
  res.json(gamesList);
});

app.post("/api/games/:board_id/move", (req, res) => {
  const { board_id } = req.params;
  const { index } = req.body;
  const updatedBoardState = makeMove(gameStates, board_id, index);
  gameStates.set(board_id, updatedBoardState);
  const UpdatedGameState = { id: board_id, ...updatedBoardState };

  const boardUsers = webSocketUsers.get(board_id);

  boardUsers?.forEach((ws) => {
    ws.send(JSON.stringify(UpdatedGameState));
    console.log(`sent updated game state to ${ws}`);
  });

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

const PORT = parseInt(process.env.PORT || "3005");
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  // In production, serve the built React app
  app.use(express.static("dist"));

  // Handle client-side routing - serve index.html for all non-API routes
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/ws")) {
      next();
    } else {
      res.sendFile("index.html", { root: "dist" });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT} in production mode...`);
  });
} else {
  // In development, use vite-express
  viteExpress.listen(app, PORT, () => {
    console.log(`Server is listening on port ${PORT} in development mode...`);
  });
}

export default app;
