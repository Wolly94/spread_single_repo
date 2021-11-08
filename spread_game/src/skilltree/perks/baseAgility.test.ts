import { SpreadGameImplementation } from "../../spreadGame";
import { BaseAgilityPerk } from "./baseAgility";

test("base agility", () => {
    const rep = BaseAgilityPerk.replay;
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, rep.gameSettings.updateFrequencyInMs);
    expect(game.bubbles.length).toBe(2);
    while (game.bubbles.length > 1) {
        game.step(rep.gameSettings.updateFrequencyInMs);
    }
    expect(game.bubbles.length).toBe(1);
    expect(game.timePassed).toBeLessThanOrEqual(1500);
});

test("no base agility", () => {
    const rep = { ...BaseAgilityPerk.replay, perks: [] };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, rep.gameSettings.updateFrequencyInMs);
    expect(game.bubbles.length).toBe(2);
    while (game.bubbles.length > 1) {
        game.step(rep.gameSettings.updateFrequencyInMs);
    }
    expect(game.bubbles.length).toBe(0);
    expect(game.timePassed).toBeGreaterThan(1500);
});
