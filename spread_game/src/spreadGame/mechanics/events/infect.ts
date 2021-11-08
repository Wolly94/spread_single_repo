import { Effect, Entity } from "./definitions";

const type = "Infect";

export interface InfectionCauser {
    playerId: number;
    entity: Entity;
    duration: number;
}

export interface InfectEvent {
    type: "Infect";
    causerPlayerId: number;
    entityToInfect: Entity;
    duration: number;
}

export interface InfectEffect extends Effect<InfectEvent> {
    type: InfectEvent["type"];
}
