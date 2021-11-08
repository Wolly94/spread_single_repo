import Bubble from "../../bubble";
import { Effect, PropUtils } from "./definitions";

const type = "Move";

export interface MoveEvent {
    type: "Move";
    bubble: Bubble;
}

export interface MoveProps {
    type: MoveEvent["type"];
    additionalSpeedInPercent: number;
    unitLossPerSecond: number;
}

export interface MoveEffect extends Effect<MoveEvent> {
    type: MoveEvent["type"];
}

export const moveUtils: PropUtils<MoveProps> = {
    combine: (a, b) => {
        return {
            type: type,
            additionalSpeedInPercent:
                a.additionalSpeedInPercent + b.additionalSpeedInPercent,
            unitLossPerSecond: Math.max(
                a.unitLossPerSecond,
                b.unitLossPerSecond
            ),
        };
    },
    default: {
        type: type,
        additionalSpeedInPercent: 0,
        unitLossPerSecond: 0,
    },
    collect: (props) => {
        return props
            .filter((prop): prop is MoveProps => prop.type === type)
            .reduce((prev, curr) => {
                if (curr.type === type) return moveUtils.combine(prev, curr);
                else return prev;
            }, moveUtils.default);
    },
};
