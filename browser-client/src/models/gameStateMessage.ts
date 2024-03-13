import * as D from 'io-ts/Decoder'
import { Cell } from './cell'
import { Bubble } from './bubble';

export const GameState = D.struct({
    elapsed: D.number,
    cells: D.array(Cell),
    bubbles: D.array(Bubble),
});

export type GameState = D.TypeOf<typeof GameState>;