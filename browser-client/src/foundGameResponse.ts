import * as D from 'io-ts/Decoder'

export const FoundGameResponse = D.struct({
    id: D.string,
    url: D.string,
})

export type FoundGameResponse = D.TypeOf<typeof FoundGameResponse>;