import { SpreadGameImplementation } from "../../spreadGame/spreadGame"
import { BaseAttackPerk } from "./baseAttack";

test("test base attack", () => {
    const rep = BaseAttackPerk.replay;
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 5000);
    const cstate = game.toClientGameState();
    const cell1 = cstate.cells.find((c) => c.id === 1);
    expect(cell1?.playerId).toBe(0);
});

test("test no base attack", () => {
    const rep = { ...BaseAttackPerk.replay, perks: [] };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 5000);
    const cstate = game.toClientGameState();
    const cell1 = cstate.cells.find((c) => c.id === 1);
    expect(cell1?.playerId).toBe(1);
});
