import * as D from "io-ts/Decoder";

export const Cell = D.struct({
  id: D.number,
  center: D.tuple(D.number, D.number),
  radius: D.number,
  units: D.number,
  owner: D.nullable(D.number),
});

export type Cell = D.TypeOf<typeof Cell>;
