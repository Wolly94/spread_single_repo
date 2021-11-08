import { SpreadGameImplementation } from "../../spreadGame";
import { BerserkPerk } from "./berserk";

test("test rage", () => {
    const rep = BerserkPerk.replay;
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 2000);
    var clientState = game.toClientGameState();
    let ragedBubbles = clientState.bubbles.filter(
        (bubble) => bubble.attackCombatAbilities > 0
    );
    let ragedCell = clientState.cells.find(
        (c) => c.data !== null && c.data.attackerCombatAbilities > 0
    );
    expect(ragedCell?.data?.attackerCombatAbilities).toBe(30);
    expect(ragedBubbles.length).toBe(2);
    expect(ragedBubbles[0].attackCombatAbilities).toBe(10);
    expect(ragedBubbles[1].attackCombatAbilities).toBe(20);
    game.runReplay(rep, 1000);
    let c1 = game.cells.find((c) => c.id === 1);
    expect(c1?.playerId).toBe(1);
    game.runReplay(rep, 1000);
    clientState = game.toClientGameState();
    ragedBubbles = clientState.bubbles.filter(
        (bubble) =>
            bubble.attackCombatAbilities > 0
    );
    expect(clientState.bubbles.length).toBe(1);
    expect(ragedBubbles.length).toBe(0);
    game.runReplay(rep, 1000);
    c1 = game.cells.find((c) => c.id === 1);
    const c2 = game.cells.find((c) => c.id === 2);
    expect(c1?.playerId).toBe(0);
    expect(c2?.playerId).toBe(0);
});

test("test no rage", () => {
    const rep = { ...BerserkPerk.replay, perks: [] };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 3000);
    var clientState = game.toClientGameState();
    var c1 = clientState.cells.find((c) => c.id === 1);
    var c2 = clientState.cells.find((c) => c.id === 2);
    expect(c1?.playerId).toBe(1);
    expect(c2?.playerId).toBe(1);
    game.runReplay(rep, 2000);
    clientState = game.toClientGameState();
    c1 = clientState.cells.find((c) => c.id === 1);
    c2 = clientState.cells.find((c) => c.id === 2);
    expect(c1?.playerId).toBe(0);
    expect(c2?.playerId).toBe(1);
});
