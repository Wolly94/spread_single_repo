import { createReconnectingWS, createWS, createWSState } from "@solid-primitives/websocket";
import { matchmakingApiUrl } from "./env";
import { getPlayerId } from "./playerIdStorage";
import { Match, Show, Switch, createEffect, createSignal, onCleanup } from "solid-js";
import { FoundGameResponse } from "./foundGameResponse";
import { getGame, setGame, unsetGame } from "./gameStorage";
import { isLeft } from "fp-ts/lib/Either";

enum ConnectionState {
  Connecting = 1,
  Connected = 2,
  Disconnecting = 3,
  Disconnected = 4,
}

export const FindGame = () => {
  const token = getPlayerId();
  const url = matchmakingApiUrl(token);
  
  const ws = createReconnectingWS(url);
  const wsState = createWSState(ws);
  const connected = () => wsState() <= ConnectionState.Connected;
  const [waitingInSeconds, setWaitingInSeconds] = createSignal(0);
  const [intervalId, setIntervalId] = createSignal<number | null>(null);

  const game = getGame();

  createEffect(() => {
    if (connected() && intervalId() === null) {
        const id = window.setInterval(function(){
          setWaitingInSeconds(waitingInSeconds()+1);
        }, 1000);
        setIntervalId(id);
    }
  })
  
  ws.addEventListener("message", (ev) => {
    const m = FoundGameResponse.decode(JSON.parse(ev.data));
    console.log("found game: " + m)
    if (isLeft(m)) {
      console.log(`Invalid format from matchmaker! ${ev.data}`)
    } else {
      setGame(m.right);
      joinGame();
  
      if (ws !== null) {
        ws.close()
      }
    }
  });

  const stop = () => {
    setWaitingInSeconds(0);
    const id = intervalId()
    if (id !== null)
        clearInterval(id);
    setIntervalId(null);
  }

  onCleanup(() => {stop()});

  const joinGame = () => {
    window.location.href = '/game/';
  }

  const cancelGame = () => {
    // TODO properly signal to server, that you left!
    unsetGame();
  }

  return (
    <>
    <Show when={game === null} fallback={
      <>
        You are still in a running game
        <button onClick={joinGame}>Rejoin</button>
        <button onClick={cancelGame}>Cancel</button>
      </>
    }>
      <Switch fallback={<p>Something is off!</p>}>
        <Match when={connected()}>
          <p>Waiting since {waitingInSeconds()}</p>
        </Match>
        <Match when={!connected()}>
          <p>Server is not running, try again later</p>
        </Match>
      </Switch>
    </Show>
    </>
  )
}