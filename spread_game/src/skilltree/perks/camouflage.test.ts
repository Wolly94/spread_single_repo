import { SpreadGameImplementation } from "../../spreadGame";
import { CamouflagePerk } from "./camouflage";

test("camouflage", () => {
    const rep = CamouflagePerk.replay;
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 1000);
    const cstate1 = game.toClientGameState(0);
    const cell11 = cstate1.cells.find((c) => c.id === 0);
    const cell12 = cstate1.cells.find((c) => c.id === 1);
    expect(cell11?.data).not.toBe(null);
    expect(cell12?.data).toBe(null);

    const cstate2 = game.toClientGameState(1);
    const cell21 = cstate2.cells.find((c) => c.id === 0);
    const cell22 = cstate2.cells.find((c) => c.id === 1);
    expect(cell21?.data).not.toBe(null);
    expect(cell22?.data).not.toBe(null);

    game.runReplay(rep, 4000);
    const gameCell0 = game.cells.find((c) => c.id === 0);
    expect(gameCell0?.playerId).toBe(1);
});

test("no camouflage", () => {
    const rep = { ...CamouflagePerk.replay, perks: [] };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 1000);
    const cstate1 = game.toClientGameState(0);
    const cell11 = cstate1.cells.find((c) => c.id === 0);
    expect(cell11?.data).not.toBe(null);
});

test("capture camouflaged cell", () => {
    const game = new SpreadGameImplementation(
        {
            players: 2,
            width: 500,
            height: 500,
            cells: [
                {
                    id: 0,
                    playerId: 0,
                    position: [100, 100],
                    radius: 50,
                    units: 50,
                },

                {
                    id: 1,
                    playerId: 1,
                    position: [400, 400],
                    radius: 50,
                    units: 0,
                },
            ],
        },
        { mechanics: "basic", updateFrequencyInMs: 25 },
        [
            { id: 0, skills: [] },
            {
                id: 1,
                skills: [{ perk: CamouflagePerk.createFromValues(), level: 1 }],
            },
        ]
    );
    game.run(1000, 25);
    var cstate = game.toClientGameState(0);
    var cell1 = cstate.cells.find((c) => c.id === 1);
    expect(cell1.data).toBe(null);
    game.sendUnits(0, [0], 1);
    game.run(4000, 25);
    cstate = game.toClientGameState(0);
    cell1 = cstate.cells.find((c) => c.id === 1);
    expect(cell1.playerId).toBe(0);
    expect(cell1.data).not.toBe(null);
});
