import { PropUtils } from "./definitions";

const type = "VisualizeGameProps";

export interface VisualizeGameProps {
    type: "VisualizeGameProps";
    deadlyEnvironment: boolean;
}

export const visualizeGameUtils: PropUtils<VisualizeGameProps> = {
    combine: (a, b) => {
        return {
            type: type,
            deadlyEnvironment: a.deadlyEnvironment || b.deadlyEnvironment,
        };
    },
    default: {
        type: type,
        deadlyEnvironment: false,
    },
    collect: (props) => {
        return props
            .filter((prop): prop is VisualizeGameProps => prop.type === type)
            .reduce((prev, curr) => {
                if (curr.type === type)
                    return visualizeGameUtils.combine(prev, curr);
                else return prev;
            }, visualizeGameUtils.default);
    },
};
