import { GameSettings } from "../messages/inGame/gameServerMessages";
import { radiusToUnits } from "../spreadGame/common";
import { SpreadMap } from "../spreadGame/map/map";
import { reach, reachByUnit } from "./reach";

test("test reach basic by fixed unit count", () => {
    const map: SpreadMap = {
        players: 1,
        height: 500,
        width: 500,
        cells: [
            { id: 0, playerId: 0, units: 50, radius: 50, position: [100, 100] },
            { id: 1, playerId: 0, units: 50, radius: 30, position: [80, 250] },
            { id: 2, playerId: 0, units: 50, radius: 50, position: [100, 400] },
        ],
    };
    const basicSettings: GameSettings = {
        updateFrequencyInMs: 25,
        mechanics: "basic",
    };
    const r = reachByUnit(map, basicSettings, [], 0, 2, 0.5);
    expect(r.duration).toBe("Infinity");
});

test("test reach for different settings", () => {
    const map: SpreadMap = {
        players: 1,
        height: 500,
        width: 500,
        cells: [
            { id: 0, playerId: 0, units: 50, radius: 50, position: [100, 100] },
            { id: 1, playerId: 0, units: 50, radius: 20, position: [60, 250] },
            { id: 2, playerId: 0, units: 50, radius: 50, position: [100, 400] },
        ],
    };
    const basicSettings: GameSettings = {
        updateFrequencyInMs: 25,
        mechanics: "basic",
    };
    const scrapeSettings: GameSettings = {
        updateFrequencyInMs: 25,
        mechanics: "scrapeoff",
    };
    const bounceSettings: GameSettings = {
        updateFrequencyInMs: 25,
        mechanics: "bounce",
    };
    const reachBasic = reach(map, basicSettings, [], 0, 2);
    const reachScrape = reach(map, scrapeSettings, [], 0, 2);
    const reachBounce = reach(map, bounceSettings, [], 0, 2);
    expect(reachBasic).not.toBe(null);
    expect(reachScrape).not.toBe(null);
    expect(reachBounce).not.toBe(null);
    if (reachBasic.type === "basic") {
        expect(reachBasic.maxSendableUnits).toBe(radiusToUnits(40));
    }
    if (reachScrape.type === "scratch") {
        expect(reachScrape.maxReceivableUnits).toBeCloseTo(
            radiusToUnits(20),
            1
        );
    }
    if (reachBounce.type === "bounce") {
        expect(reachBounce.absoluteUnitLoss).toBe(2);
    }
});
