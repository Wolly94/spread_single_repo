import { GameSettings } from "../../messages/inGame/gameServerMessages";
import SpreadReplay from "../../messages/replay/replay";
import { playersWithoutSkills } from "../../skilltree/perks/testHelper";
import { SpreadGameImplementation } from "../../spreadGame";
import { SpreadMap } from "../../spreadGame/map/map";
import { playerFromData } from "../../spreadGame/player";
import { CellSenderCapabilityImplementation } from "./cellSenderCapabilities";
import { futureCellsFromGame } from "./futureCells";

const simpleMap: SpreadMap = {
    players: 2,
    height: 500,
    width: 500,
    cells: [
        {
            id: 0,
            playerId: 0,
            position: [100, 100],
            radius: 50,
            units: 30,
        },
        {
            id: 1,
            playerId: null,
            position: [400, 400],
            radius: 50,
            units: 30,
        },
        {
            id: 2,
            playerId: 1,
            position: [100, 400],
            radius: 40,
            units: 15,
        },
    ],
};
const gameSettings: GameSettings = {
    mechanics: "basic",
    updateFrequencyInMs: 25,
};

test("cell sender caps with no collisions", () => {
    const game = new SpreadGameImplementation(
        simpleMap,
        gameSettings,
        playersWithoutSkills(2).map((data) => playerFromData(data))
    );
    const futureCells = futureCellsFromGame(game);
    const senderCaps = new CellSenderCapabilityImplementation(futureCells);
    const cap1 = senderCaps.get(0);
    const cap2 = senderCaps.get(1);
    expect(cap1.timeline.length).toBe(1);
    expect(cap2.timeline.length).toBe(0);
});

test("cell sender caps with collisions", () => {
    const rep: SpreadReplay = {
        gameSettings: gameSettings,
        lengthInMs: 10000,
        map: simpleMap,
        perks: [],
        players: playersWithoutSkills(2),
        moveHistory: [
            {
                timestamp: 0,
                data: {
                    type: "sendunitsmove",
                    data: {
                        playerId: 0,
                        senderIds: [0],
                        receiverId: 1,
                    },
                },
            },
            {
                timestamp: 500,
                data: {
                    type: "sendunitsmove",
                    data: {
                        playerId: 0,
                        senderIds: [0],
                        receiverId: 2,
                    },
                },
            },
        ],
    };
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 1000);
    const senderCaps = CellSenderCapabilityImplementation.fromGame(game);
    const cap0 = senderCaps.get(0);
    const cap1 = senderCaps.get(1);
    const cap2 = senderCaps.get(2);
    expect(cap0.timeline.length).toBe(1);
    expect(cap1.timeline.length).toBe(0);
    expect(cap2.timeline.length).toBe(2);
});
