import { SpreadGameImplementation } from "../../spreadGame";
import { BaseSpiritPerk } from "./baseSpirit";

test("test base spirit", () => {
    const rep = BaseSpiritPerk.replay;
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 1000);

    expect(game.bubbles.length).toBe(2);
    var clientState = game.toClientGameState();
    var cell0 = clientState.cells.find((c) => c.id === 0);
    var bubble1 = clientState.bubbles.find((b) => b.id === 1);
    expect(cell0?.data?.defenderCombatAbilities).toBe(1 * 6);
    expect(bubble1?.attackCombatAbilities).toBe(1 * 6);

    while (game.bubbles.length >= 2) {
        game.step(25);
    }
    expect(game.bubbles.length).toBe(1);
    clientState = game.toClientGameState();
    var cell1 = clientState.cells.find((c) => c.id === 1);
    expect(cell1?.playerId).toBe(0);
    var bubble2 = clientState.bubbles.find((b) => b.id === 2);
    expect(bubble2?.attackCombatAbilities).toBe(0);
    cell0 = clientState.cells.find((c) => c.id === 0);
    expect(cell0?.data?.defenderCombatAbilities).toBe(0 * 6);
    bubble1 = clientState.bubbles.find((b) => b.id === 1);
    expect(bubble1).toBe(undefined);

    while (game.bubbles.length >= 1) {
        game.step(25);
    }

    expect(game.bubbles.length).toBe(0);
    clientState = game.toClientGameState();
    var cell2 = clientState.cells.find((c) => c.id === 2);
    expect(cell2?.playerId).toBe(1);
});
