import { ReinforcedCellEvent } from "../../../skilltree/events";
import { Effect } from "./definitions";

const type = "ReinforcedCell";

//export interface ReinforceCellProps {
//    type: ReinforceCellEvent["type"];
//    additionalUnits: number;
//    unitsInPercentToRemain: number;
//}

export interface ReinforceCellEffect extends Effect<ReinforcedCellEvent> {
    type: ReinforcedCellEvent["type"];
}

//export const reinforceCellUtils: PropUtils<ReinforceCellProps> = {
//    combine: (a, b) => {
//        return {
//            type: type,
//            additionalUnits: a.additionalUnits + b.additionalUnits,
//            unitsInPercentToRemain: a.unitsInPercentToRemain*b.unitsInPercentToRemain,
//        };
//    },
//    default: { type: type, additionalUnits: 0, unitsInPercentToRemain: 1 },
//    collect: (props) => {
//        return props
//            .filter((prop): prop is ReinforceCellProps => prop.type === type)
//            .reduce((prev, curr) => {
//                if (curr.type === type)
//                    return reinforceCellUtils.combine(prev, curr);
//                else return prev;
//            }, reinforceCellUtils.default);
//    },
//};
