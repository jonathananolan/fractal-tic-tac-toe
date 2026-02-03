import { useState } from "react";
import {
  createGame,
  makeMove,
  getWinner,
  type CellIndex,
  type GameState,
} from "./tic-tac-toe";
import "./App.css";

function App() {
  let [gameState, setGameState] = useState(getInitialGame());

  function handleCellClick(cellIndex: CellIndex) {
    const newGameState = makeMove(gameState, cellIndex);
    setGameState(newGameState);
  }

  function IndividualCell(props: { index: CellIndex }) {
    return (
      <button onClick={() => handleCellClick(props.index)}>
        {gameState.board[props.index]}
      </button>
    );
  }

  function WinnerDisplay() {
    let winner = getWinner(gameState);
    if (winner !== null) {
      return <h1>{winner} Wins!!!!</h1>;
    } else {
      return <h1></h1>;
    }
  }

  // TODO: display the gameState, and call `makeMove` when a player clicks a button
  return (
    <>
      <div>
        <h1> Tic, Tac, Toe</h1>
        <br />
        current player: {gameState.currentPlayer}
        <br />
      </div>
      {[0, 1, 2].map((i) => (
        <IndividualCell key={i} index={i as CellIndex} />
      ))}
      <br />
      {[3, 4, 5].map((i) => (
        <IndividualCell key={i} index={i as CellIndex} />
      ))}
      <br />
      {[6, 7, 8].map((i) => (
        <IndividualCell key={i} index={i as CellIndex} />
      ))}

      <WinnerDisplay />
    </>
  );
}

function getInitialGame() {
  let initialGameState = createGame();
  return initialGameState;
}

// Create a 'cell' component

export type CellProps = {
  cellIndex: CellIndex;
  gameState: GameState;
  onClick: () => void;
};

export default App;
