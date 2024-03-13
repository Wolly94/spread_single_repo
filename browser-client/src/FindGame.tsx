import { createReconnectingWS, createWS, createWSState } from "@solid-primitives/websocket";
import { matchmakingApiUrl } from "./env";
import { getPlayerId } from "./playerIdStorage";
import { Match, Show, Switch, createEffect, createSignal, onCleanup } from "solid-js";
import { FoundGameResponse } from "./foundGameResponse";

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

  createEffect(() => {
    if (connected() && intervalId() === null) {
        const id = window.setInterval(function(){
          setWaitingInSeconds(waitingInSeconds()+1);
        }, 1000);
        setIntervalId(id);
    }
  })
  
  ws.addEventListener("message", (ev) => {
    const m = ev.data as FoundGameResponse;
    console.log("found game: " + m)
    window.location.href = '/game/';
  
    if (ws !== null) {
      ws.close()
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

  return (
    <>
    <Switch fallback={<p>Something is off!</p>}>
      <Match when={connected()}>
        <p>Waiting since {waitingInSeconds()}</p>
      </Match>
      <Match when={!connected()}>
        <p>Server is not running, try again later</p>
      </Match>
    </Switch>
    </>
  )
}