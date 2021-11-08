import { PropUtils } from "./definitions";

interface CellHideProps {
    showUnits: boolean;
}

export const cellHideUtils = {
    combine: (a: CellHideProps, b: CellHideProps): CellHideProps => {
        return {
            showUnits: a.showUnits && b.showUnits,
        };
    },
    default: { showUnits: true },
};

export type PlayerCellHideProps = Map<number, CellHideProps>;

const combinePlayerCellHideProps = (
    a: PlayerCellHideProps,
    b: PlayerCellHideProps
): PlayerCellHideProps => {
    const res: PlayerCellHideProps = new Map();
    Array.from(a.entries()).forEach((entry) => {
        const [key, value] = entry;
        const exVal = res.get(key);
        res.set(
            key,
            cellHideUtils.combine(
                exVal === undefined ? cellHideUtils.default : exVal,
                value
            )
        );
    });
    Array.from(b.entries()).forEach((entry) => {
        const [key, value] = entry;
        const exVal = res.get(key);
        res.set(
            key,
            cellHideUtils.combine(
                exVal === undefined ? cellHideUtils.default : exVal,
                value
            )
        );
    });
    return res;
};

const type = "VisualizeCellProps";

export interface VisualizeCellProps {
    type: "VisualizeCellProps";
    hideProps: PlayerCellHideProps;
    combatAbilityModifier: number;
    membraneAbsorption: number;
    rageValue: number;
    infected: boolean;
}

export const visualizeCellUtils: PropUtils<VisualizeCellProps> = {
    combine: (a, b) => {
        return {
            type: type,
            combatAbilityModifier:
                a.combatAbilityModifier + b.combatAbilityModifier,
            rageValue: a.rageValue + b.rageValue,
            membraneAbsorption: a.membraneAbsorption + b.membraneAbsorption,
            hideProps: combinePlayerCellHideProps(a.hideProps, b.hideProps),
            infected: a.infected || b.infected,
        };
    },
    default: {
        type: type,
        combatAbilityModifier: 0,
        rageValue: 0,
        membraneAbsorption: 0,
        hideProps: new Map(),
        infected: false,
    },
    collect: (props) => {
        return props
            .filter((prop): prop is VisualizeCellProps => prop.type === type)
            .reduce((prev, curr) => {
                if (curr.type === type)
                    return visualizeCellUtils.combine(prev, curr);
                else return prev;
            }, visualizeCellUtils.default);
    },
};
