import SpreadReplay from "../../messages/replay/replay";
import { SpreadGameImplementation } from "../../spreadGame";
import { PreparationPerk } from "./preparation";

test("test preparation", () => {
    const rep = PreparationPerk.replay;
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 5000);
    var clientState = game.toClientGameState();
    let cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(1);
    expect(cell2?.data?.defenderCombatAbilities).toBeGreaterThan(5);

    // check for reset after sent attack
    game.sendUnits(1, [1], 0);
    game.step(25);
    clientState = game.toClientGameState();
    cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(1);
    expect(cell2?.data?.defenderCombatAbilities).toBe(0);
});

test("test no preparation", () => {
    const rep = { ...PreparationPerk.replay, perks: [] };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 5000);
    var clientState = game.toClientGameState();
    const cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.playerId).toBe(0);
});

test("test preparation cap", () => {
    const maxLength = 2000000;
    const rep: SpreadReplay = {
        ...PreparationPerk.replay,
        lengthInMs: maxLength,
    };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, maxLength / 2);
    var clientState = game.toClientGameState();
    var cell2 = clientState.cells.find((c) => c.id === 1);
    expect(cell2?.data?.defenderCombatAbilities).toBe(100);
    const oldValue =
        cell2 === undefined ? 0 : cell2?.data?.defenderCombatAbilities;
    game.runReplay(rep, 5000);
    clientState = game.toClientGameState();
    cell2 = clientState.cells.find((c) => c.id === 1);
    expect(oldValue).toBe(cell2?.data?.defenderCombatAbilities);
});

test("no preparation on neutral cells", () => {
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
                    playerId: null,
                    position: [400, 400],
                    radius: 50,
                    units: 50,
                },
            ],
        },
        { mechanics: "basic", updateFrequencyInMs: 25 },
        [
            {
                id: 0,
                skills: [
                    { level: 2, perk: PreparationPerk.createFromValues() },
                ],
            },
            { id: 1, skills: [] },
        ],
        [PreparationPerk.createFromValues()]
    );
    game.run(4000, 25);
    var cstate = game.toClientGameState(null);
    var cell0 = cstate.cells.find((c) => c.id === 0);
    var cell1 = cstate.cells.find((c) => c.id === 1);
    expect(cell0.data.defenderCombatAbilities).toBeGreaterThan(0);
    expect(cell1.data.defenderCombatAbilities).toBe(0);
});
