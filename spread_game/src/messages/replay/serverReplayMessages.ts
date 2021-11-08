import SpreadReplay from "./replay";

export interface SendReplayMessage {
  type: "sendreplay";
  data: SpreadReplay;
}

export type ServerReplayMessage = SendReplayMessage;
