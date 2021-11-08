import { SendUnitsMove } from "../messages/replay/replay";
import { SpreadGameImplementation } from "../spreadGame";
import Cell from "../spreadGame/cell";
import { fight } from "../spreadGame/mechanics/commonMechanics";
import {
    bubbleFightUtils,
    cellFightUtils,
} from "../spreadGame/mechanics/events/fight";
import { availableAttackers, estimatedDefenders } from "./ai";
import { AttackerReducer } from "./greedyAi";
import { AttackerData, getAttackerData } from "./reach";
import { ReachableMap } from "./reachableMap";

export const isTarget = (
    game: SpreadGameImplementation,
    targetCellId: number,
    byPlayerId: number
) => {
    const remBubbles = game.bubbles.filter(
        (b) => b.targetId === targetCellId && b.playerId === byPlayerId
    );
    return remBubbles.length > 0;
};

export interface AttackerDataWithSenderId extends AttackerData {
    senderId: number;
}

interface AnalyzeHelper {
    currentAttackers: number;
    currentDefenders: number;
    senderIds: number[];
    durationInMs: number;
}

export interface AnalyzeResult {
    maximalPossibleAttackers: number;
    senderIds: number[];
    currentAttackers: number;
    overshot: number;
    durationInMs: number;
}

export const analyzeCapturePlan = (
    cells: Cell[],
    targetCell: Cell,
    reachMap: ReachableMap
): AnalyzeResult => {
    const attackerData = cells
        .flatMap((attackerCell) => {
            const r = reachMap.get(attackerCell.id, targetCell.id);
            if (r === null) return [];
            const att = availableAttackers(attackerCell);
            const realAtt = getAttackerData(att, r);
            if (realAtt.effectiveAttackers === 0) return [];
            const data: AttackerDataWithSenderId = {
                ...realAtt,
                senderId: attackerCell.id,
            };
            return [data];
        })
        .sort((data1, data2) => data1.durationInMs - data2.durationInMs);
    const totalAttackers = attackerData.reduce((prev, curr) => {
        return prev + curr.effectiveAttackers;
    }, 0);
    const analyzeData = attackerData.reduce(
        (prev: AnalyzeHelper, curr): AnalyzeHelper => {
            if (prev.currentAttackers > prev.currentDefenders) return prev;
            const defenders = estimatedDefenders(targetCell, curr.durationInMs);
            return {
                currentAttackers:
                    prev.currentAttackers + curr.effectiveAttackers,
                currentDefenders: defenders,
                senderIds: [...prev.senderIds, curr.senderId],
                durationInMs: curr.durationInMs,
            };
        },
        {
            currentAttackers: 0,
            currentDefenders: targetCell.units,
            senderIds: [],
            durationInMs: 0,
        }
    );
    const overshot = fight(
        analyzeData.currentAttackers,
        analyzeData.currentDefenders,
        bubbleFightUtils.default,
        cellFightUtils.default
    );
    return {
        maximalPossibleAttackers: totalAttackers,
        currentAttackers: analyzeData.currentAttackers,
        durationInMs: analyzeData.durationInMs,
        senderIds: analyzeData.senderIds,
        overshot: overshot,
    };
};

export const sortByWeakestCells = (
    cellsToTarget: Cell[],
    cellsToSend: Cell[],
    reach: ReachableMap
) => {
    const weakestUnownedCells = cellsToTarget
        .map((c) => {
            const analyzed = analyzeCapturePlan(cellsToSend, c, reach);
            return { targetCell: c, analyze: analyzed };
        })
        .filter((data) => {
            return data.analyze.senderIds.length !== 0;
        })
        .sort((c1, c2) => {
            if (c1.analyze.durationInMs === c2.analyze.durationInMs) {
                // cells surrounded by stronger cells first
                return (
                    c2.analyze.maximalPossibleAttackers -
                    c1.analyze.maximalPossibleAttackers
                );
            } else {
                // closer cells first
                return c1.analyze.durationInMs - c2.analyze.durationInMs;
            }
        })
        // [-5, 2, 4, 1, -3] --> [1, 2, 4, -3, -5]
        .sort((c1, c2) => {
            if (c1.analyze.overshot === c2.analyze.overshot) {
                return c1.analyze.overshot > 0
                    ? c1.analyze.overshot - c2.analyze.overshot
                    : c2.analyze.overshot - c1.analyze.overshot;
            } else {
                return c1.analyze.overshot > 0 ? -1 : 1;
            }
        });
    return weakestUnownedCells;
};
