import Bubble from "../bubble";
import Cell from "../cell";
import { radiusToUnits, radiusToUnitsFixPoint } from "../common";
import { distance } from "../entites";
import {
    BubbleFightProps,
    CellFightProps,
    isCellFightProps,
} from "./events/fight";
import { GrowthProps } from "./events/growth";
import { MoveProps } from "./events/move";
import { SendUnitsProps } from "./events/sendUnits";

export const calculationAccuracy = 0.01;
export const minOverlap = 0;

// > 0 means attacker won, <= 0 means defender won
export const fight = (
    att: number,
    def: number,
    am: BubbleFightProps,
    bm: BubbleFightProps | CellFightProps
): number => {
    const factorA = 1 + am.combatAbilityModifier / 100;
    const factorB = 1 + bm.combatAbilityModifier / 100;
    if (isCellFightProps(bm)) {
        att -= bm.membraneAbsorption;
        if (att <= 0) return -def;
    }
    const unitDiff = att * factorA - def * factorB;
    if (unitDiff <= 0) return unitDiff / factorB;
    else return unitDiff / factorA;
};

// returns remaining fighters from both entities
export const fightBubblePartial = (
    att: number,
    def: number,
    am: number,
    bm: number,
    dist: number
): [number | null, number | null] => {
    const maxUnits = radiusToUnits(dist);
    const upperBound = am * maxUnits;
    const lowerBound = bm * maxUnits;
    const unitDiff = att * am - def * bm;
    if (unitDiff >= upperBound) return [unitDiff / am, null];
    else if (unitDiff <= -lowerBound) return [null, -unitDiff / bm];
    else {
        const beta =
            (unitDiff + bm * maxUnits) /
            ((2 * dist * bm) / radiusToUnitsFixPoint);
        const deltaMod = am - bm;
        if (deltaMod === 0) {
            const ra = beta;
            return [radiusToUnits(ra), radiusToUnits(dist - ra)];
        } else {
            const alpha = deltaMod / (2 * dist * bm);
            const ra =
                -1 / (2 * alpha) +
                Math.sqrt(beta / alpha + 1 / (4 * alpha ** 2));
            return [radiusToUnits(ra), radiusToUnits(dist - ra)];
        }
    }
};

// newCellUnits is expected to be the result of 'fight' or 'fightCellPartial'
export const takeOverCell = (
    cell: Cell,
    newCellUnits: number,
    enemyPlayerId: number
) => {
    if (newCellUnits > calculationAccuracy) {
        cell.units = newCellUnits;
        cell.playerId = enemyPlayerId;
    } else {
        cell.units = -newCellUnits;
    }
};

export const reinforceCell = (cell: Cell, units: number) => {
    cell.units += units;
};

export const overlap = (b: Bubble, e: Bubble | Cell) => {
    return b.radius + e.radius - distance(b.position, e.position);
};

export const centerOverlap = (b: Bubble, e: Bubble | Cell) => {
    return Math.max(b.radius, e.radius) - distance(b.position, e.position);
};

// <= 0 if entities at least touch each other
export const entityDistance = (b: Bubble, e: Bubble | Cell) => {
    return Math.max(-overlap(b, e), 0);
};

// <= 0 if at least the center of one entity is contained in the other entity
export const centerOverlapDistance = (b: Bubble, e: Bubble | Cell) => {
    return Math.max(-centerOverlap(b, e), 0);
};

export const isBubble = (val: any): val is Bubble => {
    return val.direction !== undefined;
};

export const approaching = (b: Bubble, e: Bubble | Cell) => {
    let direction: [number, number] = b.direction;
    if (isBubble(e)) {
        direction = [
            direction[0] - e.direction[0],
            direction[1] - e.direction[1],
        ];
    }
    const relPosition: [number, number] = [
        b.position[0] - e.position[0],
        b.position[1] - e.position[1],
    ];
    const res = direction[0] * relPosition[0] + direction[1] * relPosition[1];
    return res < 0;
};

export const calculateBubbleUnits = (
    sender: Cell,
    sendUnitsProps: SendUnitsProps
) => {
    const baseAttackers = Math.floor(sender.units / 2);
    const res = Math.min(
        sender.units,
        radiusToUnits(sender.radius),
        baseAttackers + sendUnitsProps.additionalUnits
    );
    return res;
};

export interface SpreadGameMechanics {
    collidesWithBubble: (bubble1: Bubble, bubble2: Bubble) => boolean;
    collidesWithCell: (bubble: Bubble, cell: Cell) => boolean;
    collideBubble: (
        bubble1: Bubble,
        bubble2: Bubble,
        f1: BubbleFightProps,
        f2: BubbleFightProps
    ) => [Bubble | null, Bubble | null];
    collideCell: (
        bubble: Bubble,
        cell: Cell,
        f1: BubbleFightProps,
        f2: CellFightProps
    ) => [Bubble | null, Cell];
    move: (bubble: Bubble, ms: number, moveProps: MoveProps) => Bubble;
    grow: (cell: Cell, ms: number, growthProps: GrowthProps) => Cell;
    sendBubble: (
        sender: Cell,
        target: Cell,
        timePassed: number,
        sendUnitsProps: SendUnitsProps
    ) => [Cell, Bubble | null];
}
