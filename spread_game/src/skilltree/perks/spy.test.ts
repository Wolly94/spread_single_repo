import { SpreadGameImplementation } from "../../spreadGame";
import { SpyPerk } from "./spy";

test("spy", () => {
    const rep = SpyPerk.replay;
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, rep.lengthInMs);
    const cstate = game.toClientGameState();
    const cell0 = cstate.cells.find((c) => c.id === 0);
    expect(cell0?.data?.defenderCombatAbilities).toBeGreaterThan(1);
    const skills = game.getSkilledPerks(0);
    expect(skills.length).toBe(2);
});

test("no spy", () => {
    const rep = { ...SpyPerk.replay, perks: [] };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, rep.lengthInMs);
    const cstate = game.toClientGameState();
    const cell0 = cstate.cells.find((c) => c.id === 0);
    expect(cell0?.data?.defenderCombatAbilities).toBe(0);
    const skills = game.getSkilledPerks(0);
    expect(skills.length).toBe(1);
});
