import { SpreadGameImplementation } from "../../spreadGame";
import Cell from "../../spreadGame/cell";
import { unitsToRadius } from "../../spreadGame/common";
import {
    AttachProps,
    TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import {
    BubbleFightProps,
    bubbleFightUtils,
    CellFightProps,
    cellFightUtils,
} from "../../spreadGame/mechanics/events/fight";
import {
    VisualizeBubbleProps,
    visualizeBubbleUtils,
} from "../../spreadGame/mechanics/events/visualizeBubbleProps";
import {
    VisualizeCellProps,
    visualizeCellUtils,
} from "../../spreadGame/mechanics/events/visualizeCellProps";
import { formatDescription } from "../utils";
import { CreatePerk, getPerkValue } from "./perk";

const name = "BaseSpirit";
const defaultValues = [2, 4, 6];
const defaultValue = 0;

const getCellDiff = (
    cells: Array<Cell>,
    enemyPlayerId: number,
    ownPlayerId: number | null
) => {
    const attackerBubbles = cells.filter(
        (b) => b.playerId === enemyPlayerId
    ).length;
    const defenderBubbles = cells.filter(
        (b) => b.playerId === ownPlayerId
    ).length;
    return attackerBubbles - defenderBubbles;
};

const getProps = (
    game: SpreadGameImplementation,
    ownplayerId: number,
    incValue: number
): [] | [BubbleFightProps, CellFightProps] => {
    const maxCellDiff = game.players
        .filter((pl) => pl.id !== ownplayerId)
        .map((pl) => {
            return getCellDiff(game.cells, pl.id, ownplayerId);
        })
        .reduce((prev, current) => Math.max(prev, current), 0);
    const val = maxCellDiff * incValue;
    return [
        { ...bubbleFightUtils.default, combatAbilityModifier: val },
        { ...cellFightUtils.default, combatAbilityModifier: val },
    ];
};

const makeProps = (
    props: BubbleFightProps | CellFightProps,
    entityId: number
) => {
    const c: AttachProps<TimedProps<BubbleFightProps | CellFightProps>> = {
        entity: {
            type: props.type === "BubbleFightProps" ? "Bubble" : "Cell",
            id: entityId,
        },
        perkName: name,
        triggerType: "BaseSpirit",
        props: {
            expirationInMs: "Never",
            value: props,
        },
    };
    const visualProps: VisualizeBubbleProps | VisualizeCellProps =
        props.type === "BubbleFightProps"
            ? {
                  ...visualizeBubbleUtils.default,
                  combatAbilityModifier: props.combatAbilityModifier,
              }
            : {
                  ...visualizeCellUtils.default,
                  combatAbilityModifier: props.combatAbilityModifier,
              };
    const v: AttachProps<
        TimedProps<VisualizeBubbleProps | VisualizeCellProps>
    > = {
        ...c,
        props: {
            ...c.props,
            value: visualProps,
        },
    };
    return [c, v];
};

const getAllPlayerProps = (
    game: SpreadGameImplementation,
    playerId: number,
    bubbleProps: BubbleFightProps,
    cellProps: CellFightProps
) => {
    const res1 = game.cells
        .filter((cell) => cell.playerId === playerId)
        .flatMap((cell) => {
            return makeProps(cellProps, cell.id);
        });
    const res2 = game.bubbles
        .filter((bubble) => bubble.playerId === playerId)
        .flatMap((bubble) => {
            return makeProps(bubbleProps, bubble.id);
        });
    return [...res1, ...res2];
};

export const BaseSpiritPerk: CreatePerk<number> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: "Base Spirit",
            defaultValue: defaultValue,
            values: values,
            description: (lvl) =>
                "Attack and defense are increased by " +
                formatDescription(values, (val) => val.toString() + "%", "/") +
                " for every cell the enemy has more than you.",
            triggers: [
                {
                    type: "CapturedCell",
                    getValue: (trigger, game) => {
                        const res = game.players.flatMap((pl) => {
                            const val = getPerkValue(
                                game,
                                name,
                                pl.id,
                                values,
                                defaultValue
                            );
                            const [bubbleProps, cellProps] = getProps(
                                game,
                                pl.id,
                                val
                            );
                            if (
                                bubbleProps === undefined ||
                                cellProps === undefined
                            )
                                return [];
                            return getAllPlayerProps(
                                game,
                                pl.id,
                                bubbleProps,
                                cellProps
                            );
                        });
                        return res;
                    },
                },
                {
                    type: "CreateBubble",
                    getValue: (trigger, game) => {
                        const playerId = trigger.after.bubble.playerId;
                        const val = getPerkValue(
                            game,
                            name,
                            playerId,
                            values,
                            defaultValue
                        );
                        const [bubbleProps] = getProps(game, playerId, val);
                        if (bubbleProps === undefined) return [];
                        return [
                            ...makeProps(bubbleProps, trigger.after.bubble.id),
                        ];
                    },
                },
                {
                    type: "StartGame",
                    getValue: (trigger, game) => {
                        const res = game.players.flatMap((pl) => {
                            const val = getPerkValue(
                                game,
                                name,
                                pl.id,
                                values,
                                defaultValue
                            );
                            const [bubbleProps, cellProps] = getProps(
                                game,
                                pl.id,
                                val
                            );
                            if (
                                bubbleProps === undefined ||
                                cellProps === undefined
                            )
                                return [];
                            return getAllPlayerProps(
                                game,
                                pl.id,
                                bubbleProps,
                                cellProps
                            );
                        });
                        return res;
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
                    radius: unitsToRadius(60),
                    units: 120,
                },
                {
                    id: 1,
                    playerId: 1,
                    position: [400, 100],
                    radius: unitsToRadius(60),
                    units: 60,
                },
                {
                    id: 2,
                    playerId: 1,
                    position: [400, 250],
                    radius: unitsToRadius(30),
                    units: 30,
                },
            ],
            players: 2,
        },

        players: [
            { id: 0, skills: [{ name: name, level: 3 }] },
            { id: 1, skills: [] },
        ],
        perks: [{ name: name, data: { type: "number", val: [2, 4, 6] } }],
        moveHistory: [
            {
                timestamp: 0,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 0, senderIds: [0], receiverId: 1 },
                },
            },
            {
                timestamp: 100,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 0, senderIds: [0], receiverId: 2 },
                },
            },
        ],
    },
};
