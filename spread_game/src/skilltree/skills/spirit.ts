import { BaseSpiritPerk } from "../perks/baseSpirit";
import { KamikazePerk } from "../perks/kamikaze";
import { Skill } from "../skilltree";

export const Spirit: Skill = {
    name: "Spirit",
    perks: [BaseSpiritPerk.createFromValues(), KamikazePerk.createFromValues()],
};
