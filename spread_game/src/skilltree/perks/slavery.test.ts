import SpreadReplay from "../../messages/replay/replay";
import { SpreadGameImplementation } from "../../spreadGame";
import { SlaveryPerk } from "./slavery";

test("test slavery", () => {
    const rep = SlaveryPerk.replay;
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 2000);
    var clientState = game.toClientGameState();
    let cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(1);
    game.runReplay(rep, 1000);
    var clientState = game.toClientGameState();
    cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(0);
    expect(cell2?.data?.units).toBeGreaterThanOrEqual(20);
});

test("test no slavery", () => {
    const rep: SpreadReplay = { ...SlaveryPerk.replay, perks: [] };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 2000);
    var clientState = game.toClientGameState();
    let cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(1);
    game.runReplay(rep, 1000);
    var clientState = game.toClientGameState();
    cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(0);
    expect(cell2?.data?.units).toBeLessThanOrEqual(11);
});
