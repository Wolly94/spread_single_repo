import { PropUtils } from "./definitions";

const type = "InfectCell";

export interface InfectCellProps {
    type: "InfectCell";
    infectedBy: Set<number>;
}

export const infectCellUtils: PropUtils<InfectCellProps> = {
    combine: (a, b) => {
        return {
            type: type,
            infectedBy: new Set([
                ...Array.from(a.infectedBy),
                ...Array.from(b.infectedBy),
            ]),
        };
    },
    default: { type: type, infectedBy: new Set() },
    collect: (props) => {
        return props
            .filter((prop): prop is InfectCellProps => prop.type === type)
            .reduce((prev, curr) => {
                if (curr.type === type) return infectCellUtils.combine(prev, curr);
                else return prev;
            }, infectCellUtils.default);
    },
};
