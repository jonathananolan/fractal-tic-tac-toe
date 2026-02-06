import { type CellIndex, type GameState, type UUID } from "../tic-tac-toe";
import React, { useRef, useEffect } from "react";
import { IndividualCell } from "./individualCell";
``;

interface CurrentGameProps {
  board_id: UUID;
  currentGameState: GameState;
  onMove: (index: CellIndex) => Promise<GameState>;
  enterLobby: () => void;
  setCurrentGameState: (gameState: GameState) => void;
}

export function CurrentGame(props: CurrentGameProps) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket(`ws://localhost:3005/ws/${props.board_id}`);

    wsRef.current.onmessage = (event) => {
      const newBoard = JSON.parse(event.data);
      console.log(newBoard);

      props.setCurrentGameState(newBoard);
    };

    wsRef.current.onopen = () => {
      console.log("connected!");
    };
  }, [props.board_id]);

  function WinnerDisplay(props: { currentGameState: GameState }) {
    if (props.currentGameState.winner !== null) {
      return <h1>{props.currentGameState.winner} Wins!!!!</h1>;
    } else {
      return <h1></h1>;
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <h1> Tic, Tac, Toe</h1>
        <br />
        current player: {props.currentGameState.currentPlayer}
        <br />
      </div>
      <div
        style={{
          display: "grid",
          width: "100%",
          gap: "0px",
          padding: "0px",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "min(500px,80vh)",
          margin: "0 auto",
          gridTemplateColumns: "repeat(3,1fr)",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <IndividualCell
            board_id={props.board_id}
            currentGameState={props.currentGameState}
            key={i}
            index={i as CellIndex}
            onMove={(i: CellIndex) => props.onMove(i)}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <WinnerDisplay currentGameState={props.currentGameState} />
        <button onClick={() => props.enterLobby()}> Go back to lobby</button>
      </div>
    </>
  );
}
