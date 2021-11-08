import Bubble, { createBubble, setUnits } from "../bubble";
import Cell from "../cell";
import { radiusToUnits } from "../common";
import { distance } from "../entites";
import basicMechanics from "./basicMechanics";
import {
    calculationAccuracy,
    fight,
    fightBubblePartial,
    minOverlap,
    overlap,
    reinforceCell,
    SpreadGameMechanics,
    takeOverCell,
} from "./commonMechanics";
import { BubbleFightProps } from "./events/fight";

export const cellFighters = (bubbleUnits: number, bubbleSpace: number) => {
    const fighters = bubbleUnits - radiusToUnits(bubbleSpace);
    return fighters;
};

const scrapeOffMechanics: SpreadGameMechanics = {
    collidesWithBubble: (bubble1, bubble2) => {
        return !(overlap(bubble1, bubble2) < minOverlap + calculationAccuracy);
    },
    collidesWithCell: (bubble, cell) => {
        return !(overlap(bubble, cell) < minOverlap + calculationAccuracy);
    },
    collideBubble: (
        bubble1: Bubble,
        bubble2: Bubble,
        f1: BubbleFightProps,
        f2: BubbleFightProps
    ) => {
        if (!scrapeOffMechanics.collidesWithBubble(bubble1, bubble2))
            return [{ ...bubble1 }, { ...bubble2 }];
        if (bubble1.playerId === bubble2.playerId) return [bubble1, bubble2];
        const dist = distance(bubble1.position, bubble2.position);
        const [u1, u2] = fightBubblePartial(
            bubble1.units,
            bubble2.units,
            1 + f1.combatAbilityModifier / 100,
            1 + f2.combatAbilityModifier / 100,
            dist
        );
        var res1: Bubble | null = null;
        var res2: Bubble | null = null;
        if (u1 !== null) {
            res1 = setUnits(bubble1, u1);
        }
        if (u2 !== null) {
            res2 = setUnits(bubble2, u2);
        }
        return [res1, res2];
    },
    collideCell: (bubble: Bubble, cell: Cell, f1, f2) => {
        const resCell = { ...cell };
        if (!scrapeOffMechanics.collidesWithCell(bubble, cell))
            return [{ ...bubble }, { ...cell }];
        // if collides returns true, then dist <= bubble.radius
        const bubbleSpace =
            distance(bubble.position, resCell.position) - resCell.radius;
        if (bubbleSpace <= calculationAccuracy) {
            return basicMechanics.collideCell(bubble, resCell, f1, f2);
        } else {
            const fighters = cellFighters(bubble.units, bubbleSpace);
            // fighters >= here
            if (bubble.playerId === resCell.playerId) {
                reinforceCell(resCell, fighters);
            } else {
                const result = fight(fighters, resCell.units, f1, f2);
                takeOverCell(resCell, result, bubble.playerId);
            }
            const resBubble = createBubble({
                ...bubble,
                units: bubble.units - fighters,
            });
            return [resBubble, resCell];
        }
    },
    move: basicMechanics.move,
    grow: basicMechanics.grow,
    sendBubble: basicMechanics.sendBubble,
};

export default scrapeOffMechanics;
