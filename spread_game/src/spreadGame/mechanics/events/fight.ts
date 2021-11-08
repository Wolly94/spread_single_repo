import { BeforeCollisionState } from "../../../skilltree/events"
import { Effect, PropUtils } from "./definitions";

const bubbleType = "BubbleFightProps";
const cellType = "CellFightProps";

export interface BubbleFightProps {
    type: "BubbleFightProps";
    combatAbilityModifier: number;
}

export const bubbleFightUtils: PropUtils<BubbleFightProps> = {
    combine: (a, b) => {
        return {
            type: bubbleType,
            combatAbilityModifier:
                a.combatAbilityModifier + b.combatAbilityModifier,
        };
    },
    default: { type: bubbleType, combatAbilityModifier: 0 },
    collect: (props) => {
        return props
            .filter(
                (prop): prop is BubbleFightProps => prop.type === bubbleType
            )
            .reduce((prev, curr) => {
                if (curr.type === bubbleType)
                    return bubbleFightUtils.combine(prev, curr);
                else return prev;
            }, bubbleFightUtils.default);
    },
};

export interface CellFightProps {
    type: "CellFightProps";
    combatAbilityModifier: number;
    membraneAbsorption: number;
}

export const cellFightUtils: PropUtils<CellFightProps> = {
    combine: (a, b) => {
        return {
            type: cellType,
            combatAbilityModifier:
                a.combatAbilityModifier + b.combatAbilityModifier,
            membraneAbsorption: a.membraneAbsorption + b.membraneAbsorption,
        };
    },
    default: {
        type: cellType,
        combatAbilityModifier: 0,
        membraneAbsorption: 0,
    },
    collect: (props) => {
        return props
            .filter((prop): prop is CellFightProps => prop.type === cellType)
            .reduce((prev, curr) => {
                if (curr.type === cellType)
                    return cellFightUtils.combine(prev, curr);
                else return prev;
            }, cellFightUtils.default);
    },
};

export const isCellFightProps = (props: any): props is CellFightProps => {
    return props.membraneAbsorption !== undefined;
};

export interface BeforeFightEvent {
    type: "BeforeFightEvent";
    before: BeforeCollisionState;
}

export interface BeforeFightEffect extends Effect<BeforeFightEvent> {
    type: BeforeFightEvent["type"];
}
