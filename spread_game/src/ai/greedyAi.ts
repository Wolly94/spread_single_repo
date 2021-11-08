import { gameClientMessages } from "../messages/inGame";
import { GameSettings } from "../messages/inGame/gameServerMessages";
import { SendUnitsMove } from "../messages/replay/replay";
import { Player, SpreadGameImplementation } from "../spreadGame";
import Cell from "../spreadGame/cell";
import { distance } from "../spreadGame/entites";
import { SpreadMap } from "../spreadGame/map/map";
import basicMechanics from "../spreadGame/mechanics/basicMechanics";
import { growthUtils } from "../spreadGame/mechanics/events/growth";
import { Ai, availableAttackers, estimatedDefenders } from "./ai";
import { analyzeCapturePlan, isTarget, sortByWeakestCells } from "./aiHelper";
import { ReachType, getAttackerData } from "./reach";
import { ReachableImplementation, ReachableMap } from "./reachableMap";

export interface AttackerReducer {
    senderIds: number[];
    currentDefenders: number;
    totalAttackers: number;
}

export class GreedyAi implements Ai {
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
    getMove(state: SpreadGameImplementation) {
        const myCells = state.cells.filter((c) => c.playerId === this.playerId);
        const cellsToTarget = state.cells.filter(
            (cell) =>
                cell.playerId !== this.playerId &&
                !isTarget(state, cell.id, this.playerId)
        );
        var weakestUnownedCells = sortByWeakestCells(
            cellsToTarget,
            myCells,
            this.reachable
        );

        if (weakestUnownedCells.length === 0) return null;
        var weakestUnownedCellData = weakestUnownedCells[0];

        if (weakestUnownedCellData.analyze.overshot <= 0) {
            // only attack from saturated cells
            const saturatedCells = myCells.filter((c) => {
                const grow = basicMechanics.grow(c, 25, growthUtils.default);
                return grow.units <= c.units;
            });
            if (saturatedCells.length > 0) {
                weakestUnownedCells = sortByWeakestCells(
                    cellsToTarget,
                    saturatedCells,
                    this.reachable
                );
                if (weakestUnownedCells.length === 0) return null;
                // this is where you should transfer to other friendly cells
                else {
                    weakestUnownedCellData = weakestUnownedCells[0];
                    weakestUnownedCellData.analyze.senderIds =
                        saturatedCells.map((c) => c.id);
                }
            }
            return null;
        }

        const result: SendUnitsMove = {
            type: "sendunitsmove",
            data: {
                receiverId: weakestUnownedCellData.targetCell.id,
                senderIds: weakestUnownedCellData.analyze.senderIds,
                playerId: this.playerId,
            },
        };

        return result;
    }
}
