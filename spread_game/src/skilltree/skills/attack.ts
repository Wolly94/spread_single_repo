import { BaseAttackPerk } from "../perks/baseAttack";
import { BerserkPerk } from "../perks/berserk";
import { RagePerk } from "../perks/rage";
import { SlaveryPerk } from "../perks/slavery";
import { Skill } from "../skilltree";

export const Attack: Skill = {
    name: "Attack",
    perks: [
        BaseAttackPerk.createFromValues(),
        RagePerk.createFromValues(),
        BerserkPerk.createFromValues(),
        SlaveryPerk.createFromValues(),
    ],
};
