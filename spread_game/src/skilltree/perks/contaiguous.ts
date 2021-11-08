import { SpreadGameImplementation } from "../../spreadGame";
import {
    AttachProps,
    TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import {
    InfectBubbleProps,
    infectBubbleUtils,
    PlayerInfectBubbleProps,
} from "../../spreadGame/mechanics/events/infectBubble";
import { infectCellUtils } from "../../spreadGame/mechanics/events/infectCell";
import { RaiseEventProps } from "../../spreadGame/mechanics/events/raiseEvent";
import { BaseInfectionPerk } from "./baseInfection";
import { CreatePerk, getPerkValue } from "./perk";

const name = "Contaigous";
const defaultValue = 0;
const defaultValues = [1];

const getRemainingInfectionTime = (
    game: SpreadGameImplementation,
    cellId: number,
    playerId: number
): number => {
    const infectedUntil: number | "Never" = game.attachedProps
        .filter((ap) => {
            return (
                ap.props.value.type === "InfectCell" &&
                ap.props.value.infectedBy.has(playerId) &&
                ap.entity?.type === "Cell" &&
                ap.entity.id === cellId
            );
        })
        .map((prop) => prop.props.expirationInMs)
        .reduce((prev, curr) => {
            if (prev === "Never" || curr === "Never") return "Never";
            else return Math.max(prev, curr);
        }, 0);
    if (infectedUntil === "Never") {
        throw new Error("Invalid infection duration for cell.");
    }
    return Math.max(infectedUntil - game.timePassed, 0);
};

export const ContaiguousPerk: CreatePerk<number> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: name,
            defaultValue: defaultValue,
            values: values,
            description: (lvl) =>
                "Enemy cells infect each other when transferring.",
            triggers: [
                {
                    type: "ReinforcedCell",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<RaiseEventProps>>[] => {
                        // check wether this was the target
                        //if (trigger.after.bubble !== null) return [];
                        const infections = infectBubbleUtils.collect(
                            game.fromAttachedProps({
                                type: "Bubble",
                                id: trigger.bubbleId,
                            })
                        );
                        const res = Array.from(
                            infections.infectedBy.entries()
                        ).map(
                            (
                                entry
                            ): AttachProps<TimedProps<RaiseEventProps>> => {
                                const props: RaiseEventProps = {
                                    type: "RaiseEvent",
                                    event: {
                                        type: "Infect",
                                        entityToInfect: {
                                            type: "Cell",
                                            id: trigger.cellId,
                                        },
                                        causerPlayerId: entry[0],
                                        duration:
                                            entry[1].infectionTimeLeftInMs,
                                    },
                                };
                                return {
                                    entity: null,
                                    perkName: name,
                                    triggerType: "ReinforcedCell",
                                    props: {
                                        expirationInMs: "Never",
                                        value: props,
                                    },
                                };
                            }
                        );
                        return res;
                    },
                },
                {
                    type: "CreateBubble",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<InfectBubbleProps>>[] => {
                        const cellId = trigger.sendUnitsEvent.sender.id;
                        const infections = infectCellUtils.collect(
                            game.fromAttachedProps({
                                type: "Cell",
                                id: cellId,
                            })
                        );
                        const bubbleInf: PlayerInfectBubbleProps = new Map();
                        Array.from(infections.infectedBy).forEach(
                            (infectedByPlayerId) => {
                                const val = getPerkValue(
                                    game,
                                    name,
                                    infectedByPlayerId,
                                    values,
                                    defaultValue
                                );
                                if (val === defaultValue) return;

                                const remInfectionTime =
                                    getRemainingInfectionTime(
                                        game,
                                        cellId,
                                        infectedByPlayerId
                                    );
                                bubbleInf.set(infectedByPlayerId, {
                                    infectionTimeLeftInMs: remInfectionTime,
                                });
                            }
                        );
                        const props: InfectBubbleProps = {
                            ...infectBubbleUtils.default,
                            infectedBy: bubbleInf,
                        };
                        return [
                            {
                                entity: {
                                    type: "Bubble",
                                    id: trigger.after.bubble.id,
                                },
                                perkName: name,
                                triggerType: "CreateBubble",
                                props: {
                                    expirationInMs: "Never",
                                    value: props,
                                },
                            },
                        ];
                    },
                },
            ],
        };
    },
    replay: {
        gameSettings: { mechanics: "basic", updateFrequencyInMs: 25 },
        lengthInMs: 5000,
        map: {
            width: 500,
            height: 500,
            cells: [
                {
                    id: 0,
                    playerId: 0,
                    position: [100, 100],
                    radius: 50,
                    units: 140,
                },
                {
                    id: 1,
                    playerId: 1,
                    position: [300, 100],
                    radius: 50,
                    units: 100,
                },
                {
                    id: 2,
                    playerId: 1,
                    position: [300, 300],
                    radius: 50,
                    units: 10,
                },
            ],
            players: 2,
        },
        perks: [
            {
                name: name,
                data: { type: "number", val: defaultValues },
            },
            {
                name: BaseInfectionPerk.name,
                data: BaseInfectionPerk.replay.perks[0].data,
            },
        ],
        players: [
            {
                id: 0,
                skills: [
                    { name: BaseInfectionPerk.name, level: 3 },
                    { name: name, level: 3 },
                ],
            },
            { id: 1, skills: [] },
        ],
        moveHistory: [
            {
                timestamp: 0,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 0, senderIds: [0], receiverId: 1 },
                },
            },
            {
                timestamp: 1500,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 1, senderIds: [1], receiverId: 2 },
                },
            },
        ],
    },
};
