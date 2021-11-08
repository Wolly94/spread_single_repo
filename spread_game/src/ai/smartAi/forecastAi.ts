import { GameSettings } from "../../messages/inGame/gameServerMessages";
import { Move } from "../../messages/replay/replay";
import { Player, SpreadGameImplementation } from "../../spreadGame";
import { SpreadMap } from "../../spreadGame/map/map";
import { Ai } from "../ai";
import { ReachableMap, ReachableImplementation } from "../reachableMap";

export class ForecastAi implements Ai {
    playerId: number;
    reachable: ReachableMap;
    constructor(
        settings: GameSettings,
        map: SpreadMap,
        players: Player[],
        playerId: number
    ) {
        const player = players.find((pl) => pl.id === playerId);
        const skills = player === undefined ? [] : player.skills;
        this.reachable = new ReachableImplementation(settings, map, skills);
        this.playerId = playerId;
    }
    getMove(state: SpreadGameImplementation): Move | null {
        return null;
    }
}
