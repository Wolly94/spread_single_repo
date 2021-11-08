import { BaseInfectionPerk } from "../perks/baseInfection";
import { ContaiguousPerk } from "../perks/contaiguous";
import { DeadlyEnvironmentPerk } from "../perks/deadlyEnvironment";
import { Skill } from "../skilltree";

export const Infection: Skill = {
    name: "Infection",
    perks: [
        BaseInfectionPerk.createFromValues(),
        ContaiguousPerk.createFromValues(),
        DeadlyEnvironmentPerk.createFromValues(),
    ],
};
