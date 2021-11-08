import SpreadReplay from "../../messages/replay/replay";
import { SpreadGameImplementation } from "../../spreadGame";
import { DeadlyEnvironmentPerk } from "./deadlyEnvironment";
import { playersWithoutSkills } from "./testHelper";

test("deadly environment", () => {
    const rep = DeadlyEnvironmentPerk.replay;
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, rep.lengthInMs);
    const cstate = game.toClientGameState();
    const cell1 = cstate.cells.find((c) => c.id === 1);
    expect(cstate.deadlyEnvironment).toBe(true);
    expect(cell1?.playerId).toBe(1);
});

test("no deadly environment", () => {
    const rep: SpreadReplay = {
        ...DeadlyEnvironmentPerk.replay,
        players: playersWithoutSkills(2),
    };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, rep.lengthInMs);
    const cstate = game.toClientGameState();
    const cell1 = cstate.cells.find((c) => c.id === 1);
    expect(cstate.deadlyEnvironment).toBe(false);
    expect(cell1?.playerId).toBe(0);
});
