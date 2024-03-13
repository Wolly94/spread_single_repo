import * as D from "io-ts/Decoder";
import { GameState } from "./gameStateMessage";

export const MessageToServer = D.sum("type")({
  Transfer: D.struct({
    type: D.literal("Transfer"),
    content: D.struct({
      senders: D.array(D.number),
      target: D.number,
    }),
  }),
});
export type MessageToServer = D.TypeOf<typeof MessageToServer>;
