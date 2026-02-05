export type Player = "X" | "O";

export type Cell = Player | null;

// Board is a 3x3 grid, represented as a 9-element array.
// Indices map to positions:
//  0 | 1 | 2
//  ---------
//  3 | 4 | 5
//  ---------
//  6 | 7 | 8
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

export type GameState = {
  board: Board;
  currentPlayer: Player;
  winner: Player | null;
};

export type CellIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 6 | 7 | 8;

export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export const winLines: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export type GameStates = Map<UUID, GameState>;

export function createGameBoard(): GameState {
  return {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: "X",
    winner: null,
  };
}

export function getWinner(board: Board): Player | null {
  for (const [a, b, c] of winLines) {
    let potentialWinner = board[a];

    if (board[a] != null && board[a] === board[b] && board[b] === board[c])
      return potentialWinner;
  }

  return null;
}

export function makeMove(
  states: GameStates,
  board_id: UUID,
  position: CellIndex,
): GameState {
  const state = states.get(board_id);

  if (getWinner(state?.board) !== null) {
    throw new Error("Game is already over");
  }
  if (!Number.isInteger(position)) {
    throw new Error("Position must be an integer");
  }
  if (position === null) {
    throw new Error("Position must be between 0 and 8");
  }
  if (position > 8 || position < 0) {
    throw new Error("Position must be between 0 and 8");
  }
  if (state?.board[position] !== null) {
    throw new Error("Position is already occupied");
  }

  const newBoard = [...state.board] as Board;
  newBoard[position] = state.currentPlayer;
  const newWinner = getWinner(newBoard);

  let nextPlayer: Player;

  if (state.currentPlayer === "X") {
    nextPlayer = "O";
  } else {
    nextPlayer = "X";
  }

  const updatedGameState: GameState = {
    board: newBoard,
    currentPlayer: nextPlayer,
    winner: newWinner,
  };

  return updatedGameState;
}
