import SpreadReplay from "../../messages/replay/replay";
import { SpreadGameImplementation } from "../../spreadGame/spreadGame";
import { RagePerk } from "./rage";

test("test rage", () => {
    const rep: SpreadReplay = { ...RagePerk.replay, lengthInMs: 10000 };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 3000);
    var clientState = game.toClientGameState();
    let ragedBubbles = clientState.bubbles.filter(
        (bubble) => bubble.attackCombatAbilities > 0
    );
    expect(ragedBubbles.length).toBe(1);
    game.runReplay(rep, 2000);
    clientState = game.toClientGameState();
    const secondLostCell = clientState.cells.find((ce) => ce.id === 2);
    expect(secondLostCell?.playerId).toBe(0);
    game.runReplay(rep, 3000);
    game.sendUnits(0, [0], 1);
    game.run(1000, rep.gameSettings.updateFrequencyInMs);
    clientState = game.toClientGameState();
    expect(clientState.bubbles.length).toBe(1);
    ragedBubbles = clientState.bubbles.filter(
        (bubble) => bubble.attackCombatAbilities > 0
    );
    expect(ragedBubbles.length).toBe(0);
});

test("test no rage", () => {
    const rep = { ...RagePerk.replay, perks: [] };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 3000);
    var clientState = game.toClientGameState();
    const ragedBubbles = clientState.bubbles.filter(
        (bubble) => bubble.attackCombatAbilities > 1
    );
    expect(ragedBubbles.length).toBe(0);
});
