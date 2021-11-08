import SpreadReplay from "../../messages/replay/replay";
import { SpreadGameImplementation } from "../../spreadGame";
import { SpreadGameEffect } from "../../spreadGame/mechanics/events/definitions";
import { RaiseEventEffect } from "../../spreadGame/mechanics/events/raiseEvent";
import { BaseAgilityPerk } from "./baseAgility";
import { BaseAttackPerk } from "./baseAttack";
import { BaseDefensePerk } from "./baseDefense";
import { BaseInfectionPerk } from "./baseInfection";
import { BasePopulationPerk } from "./basePopulation";
import { BaseSpiritPerk } from "./baseSpirit";
import { BerserkPerk } from "./berserk";
import { CamouflagePerk } from "./camouflage";
import { ContaiguousPerk } from "./contaiguous";
import { DeadlyEnvironmentPerk } from "./deadlyEnvironment";
import { FertileGroundsPerk } from "./fertileGrounds";
import { KamikazePerk } from "./kamikaze";
import { LootsOfVictoryPerk } from "./lootsOfVictory";
import { MembranePerk } from "./membrane";
import { PreparationPerk } from "./preparation";
import { RagePerk } from "./rage";
import { ReinforcementsPerk } from "./reinforcements";
import { SlaveryPerk } from "./slavery";
import { SpyPerk } from "./spy";

export interface Perk<TValue> {
    name: string;
    displayName: string;
    values: TValue[];
    defaultValue: TValue;
    description: (level: number) => string;
    triggers: SpreadGameEffect[];
}

export const getPerkLevel = (
    game: SpreadGameImplementation,
    perkName: string,
    playerId: number | null
): number => {
    const skPerk = game.getSkilledPerk(perkName, playerId);
    if (skPerk !== null) return skPerk.level;
    else return 0;
};

export const getPerkValueHelper = <TValue>(
    level: number,
    values: TValue[],
    defaultValue: TValue
) => {
    if (level <= 0) return defaultValue;
    else {
        const val = values[Math.min(level, values.length) - 1];
        return val;
    }
};

export const getPerkValue = <TValue>(
    game: SpreadGameImplementation,
    perkName: string,
    playerId: number | null,
    values: TValue[],
    defaultValue: TValue
) => {
    const lvl = getPerkLevel(game, perkName, playerId);
    const val = getPerkValueHelper(lvl, values, defaultValue);
    return val;
};

export interface CreatePerk<TValue> {
    createFromValues: (values?: TValue[]) => Perk<TValue>;
    name: string;
    replay: SpreadReplay;
}

export type PerkData = number | [number, number];

export type GeneralPerk = Perk<PerkData>;
export type GeneralCreatePerk = CreatePerk<PerkData>;

export interface BackUpPerk {
    name: string;
    data:
        | { type: "number"; val: number[] }
        | { type: "number_number"; val: [number, number][] };
}

export const backupFromPerk = (perk: GeneralPerk): BackUpPerk => {
    const v1 = perk.values[0];
    const values: any = perk.values;
    return {
        name: perk.name,
        data:
            typeof v1 === "number"
                ? { type: "number", val: values }
                : { type: "number_number", val: values },
    };
};

export const allPerks: GeneralPerk[] = [
    //Attack
    BaseAttackPerk.createFromValues(),
    RagePerk.createFromValues(),
    BerserkPerk.createFromValues(),
    SlaveryPerk.createFromValues(),

    //Defense
    BaseDefensePerk.createFromValues(),
    PreparationPerk.createFromValues(),
    LootsOfVictoryPerk.createFromValues(),
    MembranePerk.createFromValues(),

    //Population
    BasePopulationPerk.createFromValues(),
    FertileGroundsPerk.createFromValues(),
    ReinforcementsPerk.createFromValues(),

    //Spirit
    BaseSpiritPerk.createFromValues(),
    KamikazePerk.createFromValues(),

    //Agility
    BaseAgilityPerk.createFromValues(),
    SpyPerk.createFromValues(),
    CamouflagePerk.createFromValues(),

    //Infection
    BaseInfectionPerk.createFromValues(),
    ContaiguousPerk.createFromValues(),
    DeadlyEnvironmentPerk.createFromValues(),
];

export const numberPerkCreators = [
    BaseAttackPerk,
    SlaveryPerk,
    BaseDefensePerk,
    LootsOfVictoryPerk,
    MembranePerk,
    BasePopulationPerk,
    FertileGroundsPerk,
    ReinforcementsPerk,
    BaseSpiritPerk,
    KamikazePerk,
    BaseAgilityPerk,
    SpyPerk,
    CamouflagePerk,
    BaseInfectionPerk,
    ContaiguousPerk,
    DeadlyEnvironmentPerk,
];
export const listPerkCreators = [RagePerk, BerserkPerk, PreparationPerk];

export const getPerkReplay = (perk: GeneralPerk): SpreadReplay | null => {
    var ex:
        | CreatePerk<number>
        | CreatePerk<[number, number]>
        | undefined = numberPerkCreators.find((pk) => pk.name === perk.name);
    if (ex === undefined) {
        ex = listPerkCreators.find((pk) => pk.name === perk.name);
    }
    if (ex !== undefined) return ex.replay;
    else return null;
};

export const perkFromBackUp = (data: BackUpPerk): GeneralPerk | null => {
    const d = data.data;
    if (d.type === "number") {
        const perk = numberPerkCreators.find((p) => p.name === data.name);
        if (perk === undefined) return null;
        else return perk.createFromValues(d.val);
    } else {
        const perk = listPerkCreators.find((p) => p.name === data.name);
        if (perk === undefined) return null;
        else return perk.createFromValues(d.val);
    }
};
