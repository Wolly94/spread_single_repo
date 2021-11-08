import { CapturedCellEvent } from "../../../skilltree/events";
import { Effect, PropUtils } from "./definitions";

const type = "CapturedCell";

export interface ConquerCellProps {
    type: CapturedCellEvent["type"];
    additionalUnits: number;
    unitsInPercentToRemain: number;
}

export interface ConquerCellEffect extends Effect<CapturedCellEvent> {
    type: CapturedCellEvent["type"];
}

export const conquerCellUtils: PropUtils<ConquerCellProps> = {
    combine: (a, b) => {
        return {
            type: type,
            additionalUnits: a.additionalUnits + b.additionalUnits,
            unitsInPercentToRemain:
                a.unitsInPercentToRemain * b.unitsInPercentToRemain,
        };
    },
    default: { type: type, additionalUnits: 0, unitsInPercentToRemain: 1 },
    collect: (props) => {
        return props
            .filter((prop): prop is ConquerCellProps => prop.type === type)
            .reduce((prev, curr) => {
                if (curr.type === type)
                    return conquerCellUtils.combine(prev, curr);
                else return prev;
            }, conquerCellUtils.default);
    },
};
