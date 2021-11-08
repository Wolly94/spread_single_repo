import { unitsToRadius } from "../../spreadGame/common";
import {
    AttachProps,
    Entity,
    TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import {
    GrowthProps,
    growthUtils,
} from "../../spreadGame/mechanics/events/growth";
import { InfectEvent } from "../../spreadGame/mechanics/events/infect";
import {
    InfectCellProps,
    infectCellUtils,
} from "../../spreadGame/mechanics/events/infectCell";
import { RaiseEventProps } from "../../spreadGame/mechanics/events/raiseEvent";
import { VisualizeBubbleProps } from "../../spreadGame/mechanics/events/visualizeBubbleProps";
import {
    VisualizeCellProps,
    visualizeCellUtils,
} from "../../spreadGame/mechanics/events/visualizeCellProps";
import { formatDescription } from "../utils";
import { CreatePerk, getPerkValue } from "./perk";

const name = "BaseInfection";
const defaultValue = 0;
const defaultValues = [1 / 100, 1 / 50, 1 / 33];

export const BaseInfectionPerk: CreatePerk<number> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: "Base Infection",
            defaultValue: defaultValue,
            values: values,
            description: (lvl) =>
                "Cells you attacked are infected for " +
                formatDescription(
                    values,
                    (val) => "#attacker/" + (1 / val).toString(),
                    ", "
                ) +
                " seconds, rendering them unable to grow.",
            triggers: [
                {
                    type: "Infect",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<
                        TimedProps<
                            | InfectCellProps
                            | GrowthProps
                            | VisualizeCellProps
                            | VisualizeBubbleProps
                        >
                    >[] => {
                        const infectionProps: InfectCellProps = {
                            ...infectCellUtils.default,
                            infectedBy: new Set([trigger.causerPlayerId]),
                        };
                        const infRes = {
                            entity: trigger.entityToInfect,
                            perkName: name,
                            triggerType: "InfectEntity",
                            props: {
                                expirationInMs:
                                    game.timePassed + trigger.duration,
                                value: infectionProps,
                            },
                        };
                        if (trigger.entityToInfect.type === "Cell") {
                            const growthProps: GrowthProps = {
                                ...growthUtils.default,
                                blocked: true,
                            };
                            const visProps: VisualizeCellProps = {
                                ...visualizeCellUtils.default,
                                infected: true,
                            };
                            const groRes: AttachProps<TimedProps<GrowthProps>> =
                                {
                                    ...infRes,
                                    props: {
                                        ...infRes.props,
                                        value: growthProps,
                                    },
                                };
                            const visRes: AttachProps<
                                TimedProps<VisualizeCellProps>
                            > = {
                                ...infRes,
                                props: { ...infRes.props, value: visProps },
                            };
                            return [infRes, groRes, visRes];
                        } else {
                            return [infRes];
                        }
                    },
                },
                {
                    type: "DefendedCell",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<RaiseEventProps>>[] => {
                        const playerId = trigger.attackerPlayerId;
                        const val = getPerkValue(
                            game,
                            name,
                            playerId,
                            values,
                            defaultValue
                        );
                        const timeToInfectInMs =
                            val * trigger.unitsDefeated * 1000;
                        const infectEvent: InfectEvent = {
                            type: "Infect",
                            causerPlayerId: playerId,
                            duration: timeToInfectInMs,
                            entityToInfect: {
                                type: "Cell",
                                id: trigger.cellId,
                            },
                        };
                        return [
                            {
                                entity: null,
                                perkName: name,
                                triggerType: "DefendedCell",
                                props: {
                                    expirationInMs: "Never",
                                    value: {
                                        type: "RaiseEvent",
                                        event: infectEvent,
                                    },
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
                    radius: unitsToRadius(90),
                    units: 140,
                },
                {
                    id: 1,
                    playerId: 1,
                    position: [300, 100],
                    radius: unitsToRadius(150),
                    units: 100,
                },
            ],
            players: 2,
        },
        perks: [
            {
                name: name,
                data: { type: "number", val: defaultValues },
            },
        ],
        players: [
            { id: 0, skills: [{ name: name, level: 3 }] },
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
        ],
    },
};
