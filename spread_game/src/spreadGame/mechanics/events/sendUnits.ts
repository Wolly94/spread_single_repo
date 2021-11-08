import Cell from "../../cell";
import { Effect, PropUtils } from "./definitions";

const type = "SendUnits";

export interface SendUnitsEvent {
    type: "SendUnits";
    sender: Cell;
    target: Cell;
}

export interface SendUnitsProps {
    type: SendUnitsEvent["type"];
    additionalUnits: number;
}

export interface SendUnitsEffect extends Effect<SendUnitsEvent> {
    type: SendUnitsEvent["type"];
}

export const sendUnitsUtils: PropUtils<SendUnitsProps> = {
    combine: (a, b) => {
        return {
            type: type,
            additionalUnits: a.additionalUnits + b.additionalUnits,
        };
    },
    default: { type: type, additionalUnits: 0 },
    collect: (props) => {
        return props
            .filter((prop): prop is SendUnitsProps => prop.type === type)
            .reduce((prev, curr) => {
                if (curr.type === type)
                    return sendUnitsUtils.combine(prev, curr);
                else return prev;
            }, sendUnitsUtils.default);
    },
};
