import * as D from 'io-ts/Decoder'

export const Bubble = D.struct({
    id: D.number,
    center: D.tuple(D.number, D.number),
    radius: D.number,
    units: D.number,
    owner: D.number,
})


export type Bubble = D.TypeOf<typeof Bubble>;