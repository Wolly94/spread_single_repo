import { Effect, PropUtils } from "./definitions";

const type = "StartGame";

export interface StartGameEvent {
    type: "StartGame";
}

export interface StartGameCellProps {
    type: StartGameEvent["type"];
    additionalUnits: number;
}

export interface StartGameEffect extends Effect<StartGameEvent> {
    type: StartGameEvent["type"];
}

export const startGameCellUtils: PropUtils<StartGameCellProps> = {
    combine: (a, b) => {
        return {
            type: type,
            additionalUnits: a.additionalUnits + b.additionalUnits,
        };
    },
    default: { type: type, additionalUnits: 0 },
    collect: (props) => {
        return props
            .filter((prop): prop is StartGameCellProps => prop.type === type)
            .reduce((prev, curr) => {
                if (curr.type === type)
                    return startGameCellUtils.combine(prev, curr);
                else return prev;
            }, startGameCellUtils.default);
    },
};
