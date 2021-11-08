import { unitsToRadius } from "../../spreadGame/common";
import {
    AttachProps,
    Entity,
    TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import { MoveProps, moveUtils } from "../../spreadGame/mechanics/events/move";
import {
    VisualizeGameProps,
    visualizeGameUtils,
} from "../../spreadGame/mechanics/events/visualizeGameProps";
import { formatDescription } from "../utils";
import { CreatePerk, getPerkValue } from "./perk";

const name = "DeadlyEnvironment";
const defaultValue = 0;
const defaultValues = [1, 2];

export const DeadlyEnvironmentPerk: CreatePerk<number> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: "Deadly Environment",
            defaultValue: defaultValue,
            values: values,
            description: (lvl) =>
                "Enemy bubbles decrease in population over time. (" +
                formatDescription(values, (val) => "-" + val.toString(), "/") +
                " units/second)",
            triggers: [
                {
                    type: "StartGame",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<VisualizeGameProps>>[] => {
                        const val = game.players
                            .map((pl) => {
                                return getPerkValue(
                                    game,
                                    name,
                                    pl.id,
                                    values,
                                    defaultValue
                                );
                            })
                            .reduce((prev, curr) => Math.max(prev, curr), 0);
                        if (val === defaultValue) return [];
                        else
                            return [
                                {
                                    entity: { type: "Game", id: null },
                                    perkName: name,
                                    triggerType: "StartGame",
                                    props: {
                                        expirationInMs: "Never",
                                        value: {
                                            ...visualizeGameUtils.default,
                                            deadlyEnvironment: true,
                                        },
                                    },
                                },
                            ];
                    },
                },
                {
                    type: "CreateBubble",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<MoveProps>>[] => {
                        const bubblePlayerId = trigger.after.bubble.playerId;
                        const val = game.players
                            .filter((pl) => pl.id !== bubblePlayerId)
                            .map((pl) =>
                                getPerkValue(
                                    game,
                                    name,
                                    pl.id,
                                    values,
                                    defaultValue
                                )
                            )
                            .reduce(
                                (prev, curr) => Math.max(prev, curr),
                                defaultValue
                            );
                        if (val === defaultValue) return [];
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
                                    value: {
                                        ...moveUtils.default,
                                        unitLossPerSecond: val,
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
                    radius: 50,
                    units: 100,
                },
                {
                    id: 1,
                    playerId: 1,
                    position: [400, 100],
                    radius: unitsToRadius(49),
                    units: 49,
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
            { id: 0, skills: [] },
            { id: 1, skills: [{ name: name, level: 3 }] },
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
