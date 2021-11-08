import SpreadReplay from "../../messages/replay/replay";
import { SpreadGameImplementation } from "../../spreadGame";
import { unitsToRadius } from "../../spreadGame/common";
import { MembranePerk } from "./membrane";

test("test membrane", () => {
    const rep: SpreadReplay = {
        ...MembranePerk.replay,
        gameSettings: { mechanics: "scrapeoff", updateFrequencyInMs: 25 },
    };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, rep.lengthInMs);
    const cstate = game.toClientGameState();
    const cell = cstate.cells.find((c) => c.id === 0);
    expect(cell?.playerId).toBe(0);
    expect(cell?.data?.membraneValue).toBeGreaterThan(5);
    expect(cell?.data?.units).toBeLessThan(25);
});

test("membrane visual", () => {
    const rep: SpreadReplay = {
        ...MembranePerk.replay,
        map: {
            ...MembranePerk.replay.map,
            cells: [
                {
                    id: 0,
                    playerId: 0,
                    position: [100, 100],
                    radius: unitsToRadius(50),
                    units: 100,
                },
                {
                    id: 1,
                    playerId: 1,
                    position: [400, 100],
                    radius: unitsToRadius(40),
                    units: 40,
                },
            ],
        },
        moveHistory: [
            {
                timestamp: 0,
                data: {
                    type: "sendunitsmove",
                    data: { senderIds: [0], receiverId: 1, playerId: 0 },
                },
            },
        ],
    };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, rep.lengthInMs);
    const cstate = game.toClientGameState();
    const cell1 = cstate.cells.find((c) => c.id === 1);
    expect(cell1?.playerId).toBe(0);
    expect(cell1?.data?.membraneValue).toBeGreaterThan(5);
});

test("test no membrane", () => {
    const rep: SpreadReplay = {
        ...MembranePerk.replay,
        players: [
            { id: 0, skills: [] },
            { id: 1, skills: [] },
        ],
    };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, rep.lengthInMs);
    const cstate = game.toClientGameState();
    const cell = cstate.cells.find((c) => c.id === 0);
    expect(cell?.playerId).toBe(1);
});
