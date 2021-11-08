import { unitsToRadius } from "../../spreadGame/common";
import {
    AttachProps,
    TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import { MoveProps, moveUtils } from "../../spreadGame/mechanics/events/move";
import { formatDescription } from "../utils";
import { CreatePerk, getPerkValue } from "./perk";

const name = "BaseAgility";
const defaultValue = 0;
const defaultValues = [20, 40, 60];

export const BaseAgilityPerk: CreatePerk<number> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: "Base Agility",
            defaultValue: defaultValue,
            values: values,
            description: (lvl) =>
                "Velocity is increased by " +
                formatDescription(values, (val) => val.toString() + "%", "/") +
                ".",
            triggers: [
                {
                    type: "CreateBubble",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<MoveProps>>[] => {
                        const val = getPerkValue(
                            game,
                            name,
                            trigger.after.bubble.playerId,
                            values,
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
                                triggerType: "SendUnits",
                                props: {
                                    expirationInMs: "Never",
                                    value: {
                                        ...moveUtils.default,
                                        additionalSpeedInPercent: val,
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
                    position: [100, 400],
                    radius: 50,
                    units: 100,
                },
                {
                    id: 2,
                    playerId: 0,
                    position: [400, 100],
                    radius: unitsToRadius(100),
                    units: 100,
                },
                {
                    id: 3,
                    playerId: 1,
                    position: [400, 400],
                    radius: unitsToRadius(100),
                    units: 100,
                },
            ],
            players: 2,
        },
        moveHistory: [
            {
                timestamp: 0,
                data: {
                    type: "sendunitsmove",
                    data: {
                        playerId: 0,
                        senderIds: [0],
                        receiverId: 2,
                    },
                },
            },
            {
                timestamp: 0,
                data: {
                    type: "sendunitsmove",
                    data: {
                        playerId: 1,
                        senderIds: [1],
                        receiverId: 3,
                    },
                },
            },
        ],
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
    },
};
