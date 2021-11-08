import { BaseDefensePerk } from "../perks/baseDefense";
import { LootsOfVictoryPerk } from "../perks/lootsOfVictory";
import { MembranePerk } from "../perks/membrane";
import { PreparationPerk } from "../perks/preparation";
import { Skill } from "../skilltree";

export const Defense: Skill = {
    name: "Defense",
    perks: [
        BaseDefensePerk.createFromValues(),
        PreparationPerk.createFromValues(),
        LootsOfVictoryPerk.createFromValues(),
        MembranePerk.createFromValues(),
    ],
};
