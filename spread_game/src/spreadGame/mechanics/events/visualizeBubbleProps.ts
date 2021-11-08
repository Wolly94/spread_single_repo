import { PropUtils } from "./definitions";

const type = "VisualizeBubbleProps";

export interface VisualizeBubbleProps {
    type: "VisualizeBubbleProps";
    combatAbilityModifier: number;
    infected: boolean;
}

export const visualizeBubbleUtils: PropUtils<VisualizeBubbleProps> = {
    combine: (a, b) => {
        return {
            type: type,
            combatAbilityModifier:
                a.combatAbilityModifier + b.combatAbilityModifier,
            infected: a.infected || b.infected,
        };
    },
    default: {
        type: type,
        combatAbilityModifier: 0,
        infected: false,
    },
    collect: (props) => {
        return props
            .filter((prop): prop is VisualizeBubbleProps => prop.type === type)
            .reduce((prev, curr) => {
                if (curr.type === type)
                    return visualizeBubbleUtils.combine(prev, curr);
                else return prev;
            }, visualizeBubbleUtils.default);
    },
};
