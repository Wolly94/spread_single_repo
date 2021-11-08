import { SkilledPerk } from "../../../skilltree/skilltree";
import { Effect, PropUtils } from "./definitions";

const type = "StolenPerk";

export interface StolenPerksProps {
    type: "StolenPerk";
    skilledPerks: SkilledPerk[];
}

export interface StolenPerkEvent {
    type: StolenPerksProps["type"];
    stolenPerk: SkilledPerk;
}

export interface StolenPerkEffect extends Effect<StolenPerkEvent> {
    type: StolenPerksProps["type"];
}

export const stolenPerksUtils: PropUtils<StolenPerksProps> = {
    combine: (a, b) => {
        return {
            type: type,
            skilledPerks: a.skilledPerks.concat(b.skilledPerks),
        };
    },
    default: { type: type, skilledPerks: [] },
    collect: (props) => {
        return props
            .filter((prop): prop is StolenPerksProps => prop.type === type)
            .reduce((prev, curr) => {
                if (curr.type === type)
                    return stolenPerksUtils.combine(prev, curr);
                else return prev;
            }, stolenPerksUtils.default);
    },
};
