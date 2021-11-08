import { ClientCell } from "../messages/inGame/clientGameState";
import { Move } from "../messages/replay/replay";
import { SpreadGameImplementation } from "../spreadGame";
import Cell from "../spreadGame/cell";
import basicMechanics from "../spreadGame/mechanics/basicMechanics";
import {
    GrowthProps,
    growthUtils,
} from "../spreadGame/mechanics/events/growth";
import { sendUnitsUtils } from "../spreadGame/mechanics/events/sendUnits";

export interface Ai {
    playerId: number;
    getMove: (state: SpreadGameImplementation) => Move | null;
}

export const availableAttackers = (cell: Cell) => {
    const dummyCell: Cell = {
        id: -1,
        playerId: 0,
        position: [-100, -100],
        radius: 50,
        units: 50,
    };
    const [newCell, newBubble] = basicMechanics.sendBubble(
        cell,
        dummyCell,
        0,
        sendUnitsUtils.default
    );
    return newBubble === null ? 0 : newBubble.units;
};

export const estimatedDefenders = (
    defender: Cell,
    durationInMs: number | null | undefined
) => {
    if (durationInMs === null || durationInMs === undefined)
        return defender.units;
    const newCell = basicMechanics.grow(
        defender,
        durationInMs,
        growthUtils.default
    );
    return newCell.units;
};
