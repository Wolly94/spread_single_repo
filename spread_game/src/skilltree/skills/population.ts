import { BasePopulationPerk } from "../perks/basePopulation";
import { FertileGroundsPerk } from "../perks/fertileGrounds";
import { ReinforcementsPerk } from "../perks/reinforcements";
import { Skill } from "../skilltree";

export const Population: Skill = {
    name: "Population",
    perks: [
        BasePopulationPerk.createFromValues(),
        FertileGroundsPerk.createFromValues(),
        ReinforcementsPerk.createFromValues(),
    ],
};
