import { HistoryEntry } from "../../messages/replay/replay";
import Bubble from "../../spreadGame/bubble";
import { unitsToRadius } from "../../spreadGame/common";
import {
    AttachProps,
    TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import { BubbleFightProps } from "../../spreadGame/mechanics/events/fight";
import {
    VisualizeBubbleProps,
    visualizeBubbleUtils,
} from "../../spreadGame/mechanics/events/visualizeBubbleProps";
import {
    VisualizeCellProps,
    visualizeCellUtils,
} from "../../spreadGame/mechanics/events/visualizeCellProps";
import { SpreadGameEvent } from "../events";
import { formatDescription } from "../utils";
import { CreatePerk, getPerkValue } from "./perk";

const name = "Berserk";
const defaultValue: [number, number] = [0, 0];
const defaultValues: [number, number][] = [
    [2000, 5],
    [2000, 10],
];

const currentAttacksSent = (
    toleratedTimeSpan: number,
    attacker: Bubble,
    eventHistory: HistoryEntry<SpreadGameEvent>[]
) => {
    const attacksSentBeforeCreation = eventHistory.filter(
        (ev) =>
            ev.data.type === "SendBubbleEvent" &&
            ev.data.sender.id === attacker.motherId &&
            ev.data.sender.playerId === attacker.playerId &&
            ev.timestamp >= attacker.creationTime - toleratedTimeSpan &&
            ev.timestamp < attacker.creationTime
    );
    return attacksSentBeforeCreation.length;
};

export const BerserkPerk: CreatePerk<[number, number]> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: name,
            values: values,
            defaultValue: defaultValue,
            description: (lvl) =>
                "For every consecutive (within " +
                formatDescription(
                    values,
                    (val) => (val[0] / 1000).toString(),
                    "/"
                ) +
                " seconds after the last) attack a cell orders it's attack increases by " +
                formatDescription(
                    values,
                    (val) => val[1].toString() + "%",
                    "/"
                ) +
                ".",
            triggers: [
                {
                    type: "CreateBubble",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<
                        TimedProps<
                            | BubbleFightProps
                            | VisualizeBubbleProps
                            | VisualizeCellProps
                        >
                    >[] => {
                        const playerId = trigger.sendUnitsEvent.sender.playerId;
                        const val = getPerkValue(
                            game,
                            name,
                            playerId,
                            values,
                            defaultValue
                        );
                        const factor = currentAttacksSent(
                            val[0],
                            trigger.after.bubble,
                            game.eventHistory
                        );
                        const combatModifier = val[1] * factor;
                        const bubbleProps: AttachProps<
                            TimedProps<BubbleFightProps>
                        > = {
                            entity: {
                                type: "Bubble",
                                id: trigger.after.bubble.id,
                            },
                            perkName: name,
                            triggerType: "SendUnits",
                            props: {
                                expirationInMs: "Never",
                                value: {
                                    type: "BubbleFightProps",
                                    combatAbilityModifier: combatModifier,
                                },
                            },
                        };
                        const visualBubbleProps: AttachProps<
                            TimedProps<VisualizeBubbleProps>
                        > = {
                            ...bubbleProps,
                            props: {
                                ...bubbleProps.props,
                                value: {
                                    ...visualizeBubbleUtils.default,
                                    combatAbilityModifier: combatModifier,
                                },
                            },
                        };
                        const visualCellProps: AttachProps<
                            TimedProps<VisualizeCellProps>
                        > = {
                            ...bubbleProps,
                            triggerType:
                                "SendUnits" + game.timePassed.toString(),
                            entity: {
                                type: "Cell",
                                id: trigger.sendUnitsEvent.sender.id,
                            },
                            props: {
                                ...bubbleProps.props,
                                expirationInMs: game.timePassed + val[0],
                                value: {
                                    ...visualizeCellUtils.default,
                                    rageValue: val[1],
                                },
                            },
                        };
                        return [
                            bubbleProps,
                            visualBubbleProps,
                            visualCellProps,
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
                    radius: unitsToRadius(40),
                    units: 80,
                },
                {
                    id: 1,
                    playerId: 1,
                    position: [400, 100],
                    radius: unitsToRadius(40),
                    units: 40,
                },
                {
                    id: 2,
                    playerId: 1,
                    position: [250, 400],
                    radius: unitsToRadius(20),
                    units: 20,
                },
            ],
            players: 2,
        },
        moveHistory: [
            {
                timestamp: 0,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 0, senderIds: [0], receiverId: 1 },
                },
            },
            {
                timestamp: 500,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 0, senderIds: [0], receiverId: 2 },
                },
            },
            {
                timestamp: 1000,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 0, senderIds: [0], receiverId: 1 },
                },
            },
            {
                timestamp: 3500,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 0, senderIds: [0], receiverId: 1 },
                },
            },
        ],
        perks: [
            {
                name: name,
                data: {
                    type: "number_number",
                    val: [
                        [2000, 5],
                        [2000, 10],
                    ],
                },
            },
        ],
        players: [
            { id: 0, skills: [{ name: name, level: 3 }] },
            { id: 1, skills: [] },
        ],
    },
};
