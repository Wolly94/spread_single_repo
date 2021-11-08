import { formatDescription } from "../../skilltree/utils";
import {
    AttachProps,
    TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import { BubbleFightProps } from "../../spreadGame/mechanics/events/fight";
import {
    VisualizeBubbleProps,
    visualizeBubbleUtils,
} from "../../spreadGame/mechanics/events/visualizeBubbleProps";
import { CreatePerk, getPerkValue } from "./perk";

const name = "BaseAttack";
const defaultValue = 0;
const defaultValues = [10, 20, 30];
export const BaseAttackPerk: CreatePerk<number> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: "Base Attack",
            values: values,
            defaultValue: defaultValue,
            description: (lvl) =>
                "Raises combat abilities of your bubbles by " +
                formatDescription(values, (val) => val.toString() + "%", "/") +
                ".",
            triggers: [
                {
                    type: "CreateBubble",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<BubbleFightProps>>[] => {
                        const val = getPerkValue(
                            game,
                            name,
                            trigger.sendUnitsEvent.sender.playerId,
                            values,
                            defaultValue
                        );
                        const bubbleProps: AttachProps<
                            TimedProps<BubbleFightProps>
                        > = {
                            entity: {
                                type: "Bubble",
                                id: trigger.after.bubble.id,
                            },
                            perkName: name,
                            triggerType: "CreateBubble",
                            props: {
                                expirationInMs: "Never",
                                value: {
                                    type: "BubbleFightProps",
                                    combatAbilityModifier: val,
                                },
                            },
                        };
                        return [bubbleProps];
                    },
                },
                {
                    type: "CreateBubble",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<VisualizeBubbleProps>>[] => {
                        const val = getPerkValue(
                            game,
                            name,
                            trigger.sendUnitsEvent.sender.playerId,
                            values,
                            defaultValue
                        );
                        const visProps: AttachProps<
                            TimedProps<VisualizeBubbleProps>
                        > = {
                            entity: {
                                type: "Bubble",
                                id: trigger.after.bubble.id,
                            },
                            perkName: name,
                            triggerType: "CreateBubble",
                            props: {
                                expirationInMs: "Never",
                                value: {
                                    ...visualizeBubbleUtils.default,
                                    combatAbilityModifier: val,
                                },
                            },
                        };
                        return [visProps];
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
                    radius: 50,
                    units: 50,
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
                        receiverId: 1,
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
                        receiverId: 0,
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
