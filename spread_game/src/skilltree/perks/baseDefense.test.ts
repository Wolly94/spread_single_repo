import { SpreadGameImplementation } from "../../spreadGame";
import { BaseDefensePerk } from "./baseDefense";

test("test baseDefense", () => {
    const rep = BaseDefensePerk.replay;
    const game = SpreadGameImplementation.fromReplay(rep);
    var clientState = game.toClientGameState();
    var cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(1);
    expect(cell2?.data?.defenderCombatAbilities).toBe(30);
    game.runReplay(rep, 2000);
    clientState = game.toClientGameState();
    cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(1);
    game.runReplay(rep, 1000);
    clientState = game.toClientGameState();
    cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(1);
    expect(cell2?.data?.defenderCombatAbilities).toBe(30);
    game.runReplay(rep, 2000);
    clientState = game.toClientGameState();
    cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(0);
    expect(cell2?.data?.defenderCombatAbilities).toBe(0);
});

test("test no baseDefense", () => {
    const rep = { ...BaseDefensePerk.replay, perks: [] };
    const game = SpreadGameImplementation.fromReplay(rep);
    var clientState = game.toClientGameState();
    var cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(1);
    expect(cell2?.data?.defenderCombatAbilities).toBe(0);
    game.runReplay(rep, 2000);
    clientState = game.toClientGameState();
    cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(1);
    game.runReplay(rep, 1000);
    clientState = game.toClientGameState();
    cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(0);
});
