import { GameSettings } from "../messages/inGame/gameServerMessages";
import { defaultSkillTree } from "../skilltree/skilltree";
import { Player, SpreadGameImplementation } from "../spreadGame";
import { SpreadMap } from "../spreadGame/map/map";
import InGameImplementation from "./../communication/gameServerHandler/inGame";
import { GreedyAi } from "./greedyAi";

test("greedy ai", () => {
    const map: SpreadMap = {
        width: 500,
        height: 500,
        players: 2,
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
                units: 10,
            },
            {
                id: 2,
                playerId: null,
                position: [100, 400],
                radius: 50,
                units: 10,
            },
        ],
    };
    const settings: GameSettings = {
        updateFrequencyInMs: 25,
        mechanics: "basic",
    };
    const players: Player[] = [
        { id: 0, skills: [] },
        { id: 1, skills: [] },
    ];
    const game = new SpreadGameImplementation(map, settings, players);
    const ai = new GreedyAi(settings, map, players, 0);
    const move = ai.getMove(game);
    expect(move.data.senderIds.length).toBe(1);
    expect(move.data.receiverId).toBe(2);
    game.applyMove(move);
    const move2 = ai.getMove(game);
    expect(move2.data.senderIds.length).toBe(1);
    expect(move2.data.receiverId).toBe(1);
    game.applyMove(move2);
    const move3 = ai.getMove(game);
    expect(move3).toBe(null);
});
