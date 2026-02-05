import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app, { gameStates } from "./server";
import { createGameBoard } from "./src/tic-tac-toe";

describe("Tic-Tac-Toe Server", () => {
  beforeEach(() => {
    // Clear game states before each test
    gameStates.clear();
  });

  describe("POST /api/createNewGame", () => {
    it("should create a new game with initial state", async () => {
      const response = await request(app)
        .post("/api/createNewGame")
        .expect(200);

      expect(response.body).toHaveProperty("id");
      expect(response.body.board).toEqual([
        null, null, null,
        null, null, null,
        null, null, null
      ]);
      expect(response.body.currentPlayer).toBe("X");
      expect(response.body.winner).toBeNull();

      // Verify game was added to gameStates
      expect(gameStates.has(response.body.id)).toBe(true);
    });

    it("should create unique game IDs for multiple games", async () => {
      const game1 = await request(app).post("/api/createNewGame");
      const game2 = await request(app).post("/api/createNewGame");

      expect(game1.body.id).not.toBe(game2.body.id);
      expect(gameStates.size).toBe(2);
    });
  });

  describe("GET /api/games", () => {
    it("should return empty array when no games exist", async () => {
      const response = await request(app)
        .get("/api/games")
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it("should return all existing games", async () => {
      // Create a few games
      const game1 = await request(app).post("/api/createNewGame");
      const game2 = await request(app).post("/api/createNewGame");

      const response = await request(app)
        .get("/api/games")
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.some(([id]) => id === game1.body.id)).toBe(true);
      expect(response.body.some(([id]) => id === game2.body.id)).toBe(true);
    });
  });

  describe("GET /api/games/:board_id", () => {
    it("should return game state for valid game ID", async () => {
      const newGame = await request(app).post("/api/createNewGame");
      const gameId = newGame.body.id;

      const response = await request(app)
        .get(`/api/games/${gameId}`)
        .expect(200);

      expect(response.body.id).toBe(gameId);
      expect(response.body.board).toEqual([
        null, null, null,
        null, null, null,
        null, null, null
      ]);
      expect(response.body.currentPlayer).toBe("X");
      expect(response.body.winner).toBeNull();
    });

    it("should return 404 for non-existent game ID", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .get(`/api/games/${fakeId}`)
        .expect(404);

      expect(response.body.Error).toBe("Game not found");
    });
  });

  describe("POST /api/games/:board_id/move", () => {
    let gameId: string;

    beforeEach(async () => {
      const newGame = await request(app).post("/api/createNewGame");
      gameId = newGame.body.id;
    });

    it("should make a valid move for player X", async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/move`)
        .send({ index: 0 })
        .expect(200);

      expect(response.body.board[0]).toBe("X");
      expect(response.body.currentPlayer).toBe("O");
      expect(response.body.winner).toBeNull();
    });

    it("should alternate between X and O players", async () => {
      // X plays at position 0
      await request(app)
        .post(`/api/games/${gameId}/move`)
        .send({ index: 0 });

      // O plays at position 1
      const response = await request(app)
        .post(`/api/games/${gameId}/move`)
        .send({ index: 1 })
        .expect(200);

      expect(response.body.board[0]).toBe("X");
      expect(response.body.board[1]).toBe("O");
      expect(response.body.currentPlayer).toBe("X");
    });

    it("should detect a winner (horizontal)", async () => {
      // X: 0, O: 3, X: 1, O: 4, X: 2 (X wins)
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 0 });
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 3 });
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 1 });
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 4 });

      const response = await request(app)
        .post(`/api/games/${gameId}/move`)
        .send({ index: 2 })
        .expect(200);

      expect(response.body.winner).toBe("X");
      expect(response.body.board).toEqual([
        "X", "X", "X",
        "O", "O", null,
        null, null, null
      ]);
    });

    it("should detect a winner (vertical)", async () => {
      // X: 0, O: 1, X: 3, O: 4, X: 6 (X wins)
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 0 });
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 1 });
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 3 });
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 4 });

      const response = await request(app)
        .post(`/api/games/${gameId}/move`)
        .send({ index: 6 })
        .expect(200);

      expect(response.body.winner).toBe("X");
    });

    it("should detect a winner (diagonal)", async () => {
      // X: 0, O: 1, X: 4, O: 2, X: 8 (X wins)
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 0 });
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 1 });
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 4 });
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 2 });

      const response = await request(app)
        .post(`/api/games/${gameId}/move`)
        .send({ index: 8 })
        .expect(200);

      expect(response.body.winner).toBe("X");
    });

    it("should throw error when position is already occupied", async () => {
      await request(app)
        .post(`/api/games/${gameId}/move`)
        .send({ index: 0 });

      // Try to play in the same position
      const response = await request(app)
        .post(`/api/games/${gameId}/move`)
        .send({ index: 0 })
        .expect(500);

      expect(response.body).toBeDefined();
    });

    it("should throw error for invalid position (negative)", async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/move`)
        .send({ index: -1 })
        .expect(500);

      expect(response.body).toBeDefined();
    });

    it("should throw error for invalid position (greater than 8)", async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/move`)
        .send({ index: 9 })
        .expect(500);

      expect(response.body).toBeDefined();
    });

    it("should throw error when game is already won", async () => {
      // Create a winning scenario
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 0 });
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 3 });
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 1 });
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 4 });
      await request(app).post(`/api/games/${gameId}/move`).send({ index: 2 });

      // Try to make another move after game is won
      const response = await request(app)
        .post(`/api/games/${gameId}/move`)
        .send({ index: 5 })
        .expect(500);

      expect(response.body).toBeDefined();
    });

    it("should handle a draw game", async () => {
      // Play a draw game
      const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
      let response;

      for (const index of moves) {
        response = await request(app)
          .post(`/api/games/${gameId}/move`)
          .send({ index });
      }

      // Final board state should be full with no winner
      expect(response.body.board.every((cell: any) => cell !== null)).toBe(true);
      expect(response.body.winner).toBeNull();
    });

    it("should persist game state between requests", async () => {
      // Make a move
      await request(app)
        .post(`/api/games/${gameId}/move`)
        .send({ index: 4 });

      // Get the game state
      const response = await request(app)
        .get(`/api/games/${gameId}`)
        .expect(200);

      expect(response.body.board[4]).toBe("X");
      expect(response.body.currentPlayer).toBe("O");
    });
  });
});
