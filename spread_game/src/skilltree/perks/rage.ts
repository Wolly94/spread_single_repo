import {
    AttachProps,
    TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import { BubbleFightProps } from "../../spreadGame/mechanics/events/fight";
import {
    VisualizeBubbleProps,
    visualizeBubbleUtils,
} from "../../spreadGame/mechanics/events/visualizeBubbleProps";
import { formatDescription } from "../utils";
import { CreatePerk, getPerkValue } from "./perk";

const name = "Rage";
const defaultValue: [number, number] = [0, 0];
const defaultValues: [number, number][] = [
    [2000, 20],
    [3000, 30],
];

export const RagePerk: CreatePerk<[number, number]> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: "Rage",
            values: values,
            defaultValue: defaultValue,
            description: (lvl) =>
                "Whenever a friendly cell is lost, combat abilities of all currently existing bubbles are increased by " +
                formatDescription(
                    values,
                    (val) => val[1].toString() + "%",
                    "/"
                ) +
                " for " +
                formatDescription(
                    values,
                    (val) => (val[0] / 1000).toString(),
                    "/"
                ) +
                " seconds.",
            triggers: [
                {
                    type: "CapturedCell",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<
                        TimedProps<BubbleFightProps | VisualizeBubbleProps>
                    >[] => {
                        const playerId = trigger.beforePlayerId;
                        const val = getPerkValue(
                            game,
                            name,
                            playerId,
                            values,
                            defaultValue
                        );
                        const resPropsTemplate: AttachProps<
                            TimedProps<BubbleFightProps>
                        > = {
                            entity: null,
                            perkName: name,
                            triggerType: "CapturedCell",
                            props: {
                                expirationInMs: val[0] + game.timePassed,
                                value: {
                                    type: "BubbleFightProps",
                                    combatAbilityModifier: val[1],
                                },
                            },
                        };
                        const playerProps: AttachProps<
                            TimedProps<BubbleFightProps>
                        > = {
                            ...resPropsTemplate,
                            entity: {
                                type: "Player",
                                id: playerId,
                            },
                        };
                        const bubbleProps = game.bubbles
                            .filter((b) => b.playerId === playerId)
                            .flatMap(
                                (
                                    b
                                ): AttachProps<
                                    TimedProps<
                                        BubbleFightProps | VisualizeBubbleProps
                                    >
                                >[] => {
                                    return [
                                        {
                                            ...resPropsTemplate,
                                            entity: {
                                                type: "Bubble",
                                                id: b.id,
                                            },
                                        },
                                        {
                                            ...resPropsTemplate,
                                            entity: {
                                                type: "Bubble",
                                                id: b.id,
                                            },
                                            props: {
                                                ...resPropsTemplate.props,
                                                value: {
                                                    ...visualizeBubbleUtils.default,
                                                    combatAbilityModifier:
                                                        val[1],
                                                },
                                            },
                                        },
                                    ];
                                }
                            );
                        return [playerProps, ...bubbleProps];
                    },
                },
                {
                    type: "SendUnits",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<
                        TimedProps<BubbleFightProps | VisualizeBubbleProps>
                    >[] => {
                        const playerId = trigger.sender.playerId;
                        // find the above attached value:
                        const prop:
                            | AttachProps<TimedProps<BubbleFightProps>>
                            | undefined = game.attachedProps.find(
                            (
                                ap
                            ): ap is AttachProps<
                                TimedProps<BubbleFightProps>
                            > =>
                                ap.entity?.type === "Player" &&
                                ap.entity.id === playerId &&
                                ap.perkName === name &&
                                ap.props.value.type === "BubbleFightProps" &&
                                ap.triggerType === "CapturedCell" // this is unnecessary
                        );
                        return prop === undefined
                            ? []
                            : [
                                  prop,
                                  {
                                      ...prop,
                                      props: {
                                          ...prop.props,
                                          value: {
                                              ...visualizeBubbleUtils.default,
                                              combatAbilityModifier:
                                                  prop.props.value
                                                      .combatAbilityModifier,
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
                    playerId: 0,
                    position: [400, 100],
                    radius: 50,
                    units: 10,
                },
                {
                    id: 2,
                    playerId: 1,
                    position: [250, 400],
                    radius: 50,
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
                        playerId: 1,
                        senderIds: [2],
                        receiverId: 1,
                    },
                },
            },
            {
                timestamp: 2000,
                data: {
                    type: "sendunitsmove",
                    data: {
                        playerId: 0,
                        senderIds: [0],
                        receiverId: 2,
                    },
                },
            },
        ],
        perks: [
            {
                name: name,
                data: { type: "number_number", val: defaultValues },
            },
        ],
        players: [
            { id: 0, skills: [{ name: name, level: 3 }] },
            { id: 1, skills: [] },
        ],
    },
};
