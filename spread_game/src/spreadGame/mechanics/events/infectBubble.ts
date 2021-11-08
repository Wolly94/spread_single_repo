import { PropUtils } from "./definitions";

const type = "InfectBubble";

interface SinglePlayerInfectBubbleProps {
    infectionTimeLeftInMs: number;
}

const comb = (
    a: SinglePlayerInfectBubbleProps,
    b: SinglePlayerInfectBubbleProps
): SinglePlayerInfectBubbleProps => {
    return {
        infectionTimeLeftInMs: Math.max(
            a.infectionTimeLeftInMs,
            b.infectionTimeLeftInMs
        ),
    };
};

export type PlayerInfectBubbleProps = Map<number, SinglePlayerInfectBubbleProps>;

export interface InfectBubbleProps {
    type: "InfectBubble";
    infectedBy: PlayerInfectBubbleProps;
}

export const infectBubbleUtils: PropUtils<InfectBubbleProps> = {
    combine: (a, b) => {
        const combined: PlayerInfectBubbleProps = new Map();
        Array.from(a.infectedBy.entries()).forEach((entry) => {
            const exVal = combined.get(entry[0]);
            if (exVal === undefined) combined.set(entry[0], entry[1]);
            else combined.set(entry[0], comb(exVal, entry[1]));
        });
        Array.from(b.infectedBy.entries()).forEach((entry) => {
            const exVal = combined.get(entry[0]);
            if (exVal === undefined) combined.set(entry[0], entry[1]);
            else combined.set(entry[0], comb(exVal, entry[1]));
        });
        return {
            type: type,
            infectedBy: combined,
        };
    },
    default: { type: type, infectedBy: new Map() },
    collect: (props) => {
        return props
            .filter((prop): prop is InfectBubbleProps => prop.type === type)
            .reduce((prev, curr) => {
                if (curr.type === type)
                    return infectBubbleUtils.combine(prev, curr);
                else return prev;
            }, infectBubbleUtils.default);
    },
};
