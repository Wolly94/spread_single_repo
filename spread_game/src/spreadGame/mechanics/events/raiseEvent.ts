import { Effect, NewSpreadGameEvent, SpreadGameEffect } from "./definitions";
import { InfectEffect, InfectEvent } from "./infect";
import { StolenPerkEffect, StolenPerkEvent } from "./stolenPerk";

const type = "RaiseEvent";

export type RaisableEvent = StolenPerkEvent | InfectEvent;

export type RaiseEventProps = {
    type: "RaiseEvent";
    event: RaisableEvent;
};

export type RaiseEventEffect = StolenPerkEffect | InfectEffect;

export const isRaisableEvent = (
    event: NewSpreadGameEvent
): event is RaisableEvent => {
    return event.type === "StolenPerk" || event.type === "Infect";
};

export const isRaisableEffect = (
    effect: SpreadGameEffect
): effect is RaiseEventEffect => {
    return effect.type === "StolenPerk" || effect.type === "Infect";
};
