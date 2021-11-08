import SpreadReplay from "../../messages/replay/replay";
import { SpreadGameImplementation } from "../../spreadGame";
import { BasePopulationPerk } from "./basePopulation";
import { playersWithoutSkills } from "./testHelper";

test("test base population", () => {
    const rep: SpreadReplay = BasePopulationPerk.replay;
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, rep.lengthInMs);
    let cstate = game.toClientGameState();
    let cell0 = cstate.cells.find((c) => c.id === 0);
    const cell1 = cstate.cells.find((c) => c.id === 1);
    expect(cell0?.data?.units).toBeGreaterThan(51);
    expect(cell1?.data?.units).toBe(50);
    game.run(100000, 25);
    cstate = game.toClientGameState();
    cell0 = cstate.cells.find((c) => c.id === 0);
    expect(cell0?.data?.units).toBe(110);
});

test("test no base population", () => {
    const rep: SpreadReplay = {
        ...BasePopulationPerk.replay,
        players: playersWithoutSkills(2),
    };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, rep.lengthInMs);
    const cstate = game.toClientGameState();
    const cell0 = cstate.cells.find((c) => c.id === 0);
    const cell1 = cstate.cells.find((c) => c.id === 1);
    expect(cell0?.data?.units).toBe(50);
    expect(cell1?.data?.units).toBe(50);
});
