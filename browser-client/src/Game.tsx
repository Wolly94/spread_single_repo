import { createSignal, onCleanup, onMount } from "solid-js";
import { Canvas } from "./Canvas";
import { createWS } from "@solid-primitives/websocket";
import { MessageFromServer } from "./models/messageFromServer";
import { GameState } from "./models/gameStateMessage";
import { isLeft } from "fp-ts/lib/Either";
import { getPlayerId } from "./playerIdStorage";
import { MessageToServer } from "./models/messageToServer";
import { getGame } from "./gameStorage";

export const Game = () => {
  const game = getGame();
  if (game === null) {
    console.log("no game found, redirecting to start page")
    window.location.href = '/';
    return
  }
  const url = game?.url
  const playerId = getPlayerId();

  const ws = createWS(`${url}?token=${playerId}`);
  ws.addEventListener("message", (ev) => {
    const parsed = JSON.parse(ev.data);
    const decoded = MessageFromServer.decode(parsed);
    if (isLeft(decoded)) {
      console.log("unknown message: ", parsed, decoded);
    } else {
      const msg = decoded.right;
      if (msg.type === "GameState") {
        //console.log("set gamestate: ", msg.content);
        setGameState(msg.content);
      } else if (msg.type === "InitClient") {
        console.log("init player:", msg.content);
        setOwnerId(msg.content.owner_id);
      }
    }
  });

  const sendMessage = (msg: MessageToServer) => {
    console.log("sending message ", msg);
    ws.send(JSON.stringify(msg));
  };

  // TODO zoom
  const [width, setWidth] = createSignal(600);
  const [height, setHeight] = createSignal(600);

  const [ownerId, setOwnerId] = createSignal<number | null>(null);

  const [gameState, setGameState] = createSignal<GameState>({
    bubbles: [],
    cells: [],
    elapsed: 0,
  });

  return (
    <Canvas
      width={width()}
      height={height()}
      sendUnits={(senders, target) => {
        sendMessage({
          type: "Transfer",
          content: {
            senders: senders,
            target: target,
          },
        });
      }}
      gameState={gameState()}
      owner={ownerId()}
    ></Canvas>
  );
};
