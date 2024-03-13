import * as D from "io-ts/Decoder";
import { GameState } from "./gameStateMessage";

export const MessageFromServer = D.sum("type")({
  GameState: D.struct({ type: D.literal("GameState"), content: GameState }),
  InitClient: D.struct({
    type: D.literal("InitClient"),
    content: D.struct({
      owner_id: D.number,
    }),
  }),
});
export type MessageFromServer = D.TypeOf<typeof MessageFromServer>;
