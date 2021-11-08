import { HistoryEntry } from "../../messages/replay/replay";
import { CollisionEvent, getFinishTime } from "../../skilltree/events";
import { SpreadGameImplementation } from "../../spreadGame";
import Cell from "../../spreadGame/cell";
import { availableAttackers } from "../ai";
import { FutureCells, futureCellsFromGame } from "./futureCells";

export interface UnitsSent {
    senderPlayerId: number;
    senderCellId: number;
    availableAttackers: number;
    earliestPossibleTimeInMs: number;
    latestPossibleTimeInMs: number | null;
}

export interface CellImpactData {
    timeline: UnitsSent[];
}

export interface CellSenderCapabilities {
    get: (senderId: number) => CellImpactData | null;
    set: (senderId: number, imp: CellImpactData) => void;
    getCellIds: () => number[];
}

export class CellSenderCapabilityImplementation
    implements CellSenderCapabilities
{
    store: { senderId: number; impact: CellImpactData }[];
    static fromGame(game: SpreadGameImplementation): CellSenderCapabilities {
        const futureCells = futureCellsFromGame(game);
        return new CellSenderCapabilityImplementation(futureCells);
    }
    constructor(futCells: FutureCells) {
        this.store = [];
        futCells.forEach((futCell) => {
            let currentTimePassed = 0;
            const timeline: UnitsSent[] = futCell.history.flatMap((ch) => {
                if (ch.data.playerId === null) return [];
                currentTimePassed = ch.timestamp;
                return [
                    {
                        availableAttackers: ch.data.sendableUnits,
                        senderCellId: futCell.cellId,
                        senderPlayerId: ch.data.playerId,
                        earliestPossibleTimeInMs: ch.timestamp,
                        // this is used as a placeholder for the loop below:
                        latestPossibleTimeInMs:
                            ch.data.immobilizedBeforeDurationInMs,
                    },
                ];
            });
            timeline.forEach((tl, index, arr) => {
                if (index !== 0 && tl.latestPossibleTimeInMs !== null)
                    arr[index - 1].latestPossibleTimeInMs =
                        tl.earliestPossibleTimeInMs - tl.latestPossibleTimeInMs;
                tl.latestPossibleTimeInMs = null;
            });
            this.set(futCell.cellId, { timeline: timeline });
        });
    }
    getCellIds() {
        return this.store.map((val) => val.senderId);
    }
    get(senderId: number) {
        const res = this.store.find((val) => val.senderId === senderId);
        if (res === undefined) return null;
        else return res.impact;
    }
    set(senderId: number, imp: CellImpactData) {
        const index = this.store.findIndex((val) => val.senderId === senderId);
        const val = {
            senderId: senderId,
            impact: imp,
        };
        if (index < 0) this.store.push(val);
        else this.store[index] = val;
    }
}
