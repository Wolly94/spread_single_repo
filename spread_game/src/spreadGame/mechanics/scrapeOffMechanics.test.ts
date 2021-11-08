import { SpreadGameImplementation } from "..";
import SpreadReplay from "../../messages/replay/replay";
import { BaseAttackPerk } from "../../skilltree/perks/baseAttack";
import { backupFromPerk } from "../../skilltree/perks/perk";

const replay: SpreadReplay = {
    gameSettings: { mechanics: "basic", updateFrequencyInMs: 25 },
    lengthInMs: 5000,
    map: {
        width: 500,
        height: 500,
        players: 2,
        cells: [
            { id: 0, position: [100, 100], radius: 50, playerId: 0, units: 50 },
            { id: 1, position: [100, 400], radius: 50, playerId: 1, units: 30 },
        ],
    },
    players: [
        { id: 0, skills: [{ level: 2, name: "BaseAttack" }] },
        { id: 1, skills: [] },
    ],
    perks: [backupFromPerk(BaseAttackPerk.createFromValues())],
    moveHistory: [
        {
            timestamp: 0,
            data: {
                type: "sendunitsmove",
                data: { playerId: 0, receiverId: 1, senderIds: [0] },
            },
        },
    ],
};

test("scrape off vs basic", () => {
    const rep1 = replay;
    const rep2: SpreadReplay = {
        ...replay,
        gameSettings: { ...replay.gameSettings, mechanics: "scrapeoff" },
    };
    const game1 = SpreadGameImplementation.fromReplay(rep1);
    const game2 = SpreadGameImplementation.fromReplay(rep2);
    game1.runReplay(rep1, 5000);
    game2.runReplay(rep2, 5000);
    const cstate1 = game1.toClientGameState();
    const cstate2 = game2.toClientGameState();
    const cell21 = cstate1.cells.find((c) => c.id === 1);
    const cell22 = cstate2.cells.find((c) => c.id === 1);
    expect(cell21.playerId).toBe(1);
    expect(cell22.playerId).toBe(1);
    expect(cell21?.data?.units).toBeCloseTo(
        cell22 === undefined || cell22.data === null ? -1 : cell22.data.units,
        5
    );
});
