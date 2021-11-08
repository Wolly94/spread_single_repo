import { HistoryEntry } from "../../messages/replay/replay";
import { CollisionEvent, getFinishTime } from "../../skilltree/events";
import { SpreadGameImplementation } from "../../spreadGame";
import { availableAttackers } from "../ai";

export interface CellHistoryData {
    playerId: number | null;
    immobilizedBeforeDurationInMs: number;
    units: number;
    sendableUnits: number;
}

export type CellHistory = HistoryEntry<CellHistoryData>[];

export type FutureCells = { cellId: number; history: CellHistory }[];

export const futureCellsFromGame = (game: SpreadGameImplementation) => {
    const copied = game.copy();
    while (copied.bubbles.length > 0) {
        copied.step(game.gameSettings.updateFrequencyInMs);
    }
    const collisionEvents = copied.eventHistory.filter(
        (ev): ev is HistoryEntry<CollisionEvent> =>
            ev.data.type === "CollisionEvent"
    );
    const res: FutureCells = copied.cells.map((sender) => {
        const cellHistory: CellHistory = [];
        const initialCell = game.cells.find((c) => c.id === sender.id);
        if (initialCell !== undefined) {
            cellHistory.push({
                timestamp: game.timePassed,
                data: {
                    playerId: initialCell.playerId,
                    units: initialCell.units,
                    sendableUnits: availableAttackers(initialCell),
                    immobilizedBeforeDurationInMs: 0,
                },
            });
        }
        collisionEvents.forEach((ev) => {
            if (
                ev.data.after.other.type !== "Cell" ||
                ev.data.after.other.val.id !== sender.id
            )
                return;
            const newOwnerId = ev.data.after.other.val.playerId;
            if (newOwnerId === null) return; // this should be impossible
            const finishTime = getFinishTime(ev.data);
            if (finishTime === null) return;
            const sendableUnits = availableAttackers(ev.data.after.other.val);
            cellHistory.push({
                timestamp: finishTime,
                data: {
                    immobilizedBeforeDurationInMs: finishTime - ev.timestamp,
                    playerId: newOwnerId,
                    units: ev.data.after.other.val.units,
                    sendableUnits: sendableUnits,
                },
            });
        });
        return {
            cellId: sender.id,
            history: cellHistory,
        };
    });
    return res;
};
