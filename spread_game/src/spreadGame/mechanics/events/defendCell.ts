import { DefendedCellEvent } from "../../../skilltree/events"
import Bubble from "../../bubble";
import Cell from "../../cell";
import { Effect, PropUtils } from "./definitions";

const type = "DefendedCell";

export interface DefendCellProps {
    type: DefendedCellEvent["type"];
    additionalUnits: number;
}

export interface DefendCellEffect extends Effect<DefendedCellEvent> {
    type: DefendedCellEvent["type"];
}

export const defendCellUtils: PropUtils<DefendCellProps> = {
    combine: (a, b) => {
        return {
            type: type,
            additionalUnits: a.additionalUnits + b.additionalUnits,
        };
    },
    default: { type: type, additionalUnits: 0 },
    collect: (props) => {
        return props
            .filter((prop): prop is DefendCellProps => prop.type === type)
            .reduce((prev, curr) => {
                if (curr.type === type)
                    return defendCellUtils.combine(prev, curr);
                else return prev;
            }, defendCellUtils.default);
    },
};
