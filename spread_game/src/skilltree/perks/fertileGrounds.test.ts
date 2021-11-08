import SpreadReplay from "../../messages/replay/replay";
import { SpreadGameImplementation } from "../../spreadGame";
import { FertileGroundsPerk } from "./fertileGrounds";

test("test fertile grounds", () => {
    const rep: SpreadReplay = FertileGroundsPerk.replay;
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, rep.lengthInMs);
    const cstate = game.toClientGameState();
    const cell0 = cstate.cells.find((c) => c.id === 0);
    const cell1 = cstate.cells.find((c) => c.id === 1);
    if (cell1 === undefined) expect(true).toBe(false);
    else
        expect(cell0?.data?.units).toBeGreaterThan(
            cell1.data !== null ? cell1.data.units : 10000000
        );
});

test("test no fertile grounds", () => {
    const rep: SpreadReplay = {
        ...FertileGroundsPerk.replay,
        perks: [],
    };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, rep.lengthInMs);
    const cstate = game.toClientGameState();
    const cell0 = cstate.cells.find((c) => c.id === 0);
    const cell1 = cstate.cells.find((c) => c.id === 1);
    if (cell1 === undefined) expect(true).toBe(false);
    else
        expect(cell0?.data?.units).toBe(
            cell1.data !== null ? cell1.data.units : -10000
        );
});
