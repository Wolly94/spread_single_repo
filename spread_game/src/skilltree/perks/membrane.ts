import { HistoryEntry } from "../../messages/replay/replay";
import { unitsToRadius } from "../../spreadGame/common";
import {
    AttachProps,
    TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import {
    CellFightProps,
    cellFightUtils,
} from "../../spreadGame/mechanics/events/fight";
import {
    VisualizeCellProps,
    visualizeCellUtils,
} from "../../spreadGame/mechanics/events/visualizeCellProps";
import { CollisionEvent } from "../events";
import { formatDescription } from "../utils";
import { CreatePerk, getPerkValue } from "./perk";

const name = "Membrane";
const defaultValues = [10];
const defaultValue = 0;

const alreadyAbsorbed = (event: CollisionEvent): number => {
    if (event.finished) return 0;
    else {
        return event.partialCollisions.reduce(
            (prev, curr) => prev + curr.data.bubble.unitsLost,
            0
        );
    }
};

const attachPropTemplate = (cellId: number, prop: VisualizeCellProps) => {
    const res: AttachProps<TimedProps<VisualizeCellProps>> = {
        entity: { type: "Cell", id: cellId },
        perkName: name,
        triggerType: "CapturedCell",
        props: {
            expirationInMs: "Never",
            value: prop,
        },
    };
    return res;
};

export const MembranePerk: CreatePerk<number> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: name,
            defaultValue: defaultValue,
            values: values,
            description: (lvl) =>
                "The first " +
                formatDescription(values, (val) => val.toString(), "/") +
                " units of every attacking enemy bubble die to the membrane before doing damage.",
            triggers: [
                {
                    type: "BeforeFightEvent",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<CellFightProps>>[] => {
                        const playerId = trigger.before.other.val.playerId;
                        const val = getPerkValue(
                            game,
                            name,
                            playerId,
                            values,
                            defaultValue
                        );
                        if (
                            trigger.before.other.type !== "Cell" ||
                            val === defaultValue
                        )
                            return [];

                        const existingFightEvent = game.eventHistory.find(
                            (ev): ev is HistoryEntry<CollisionEvent> =>
                                ev.data.type === "CollisionEvent" &&
                                !ev.data.finished &&
                                ev.data.before.bubble.id ===
                                    trigger.before.bubble.id &&
                                ev.data.before.other.type ===
                                    trigger.before.other.type &&
                                ev.data.before.other.val.id ===
                                    trigger.before.other.val.id
                        );
                        const absorbed =
                            existingFightEvent === undefined
                                ? 0
                                : alreadyAbsorbed(existingFightEvent.data);
                        const props: CellFightProps = {
                            ...cellFightUtils.default,
                            membraneAbsorption: Math.max(val - absorbed, 0),
                        };
                        return [
                            {
                                entity: null,
                                perkName: name,
                                triggerType: "BeforeFightEvent",
                                props: {
                                    expirationInMs: "Never",
                                    value: props,
                                },
                            },
                        ];
                    },
                },
                {
                    type: "StartGame",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<VisualizeCellProps>>[] => {
                        const res: AttachProps<
                            TimedProps<VisualizeCellProps>
                        >[] = game.players.flatMap((pl) => {
                            const val = getPerkValue(
                                game,
                                name,
                                pl.id,
                                values,
                                defaultValue
                            );

                            const props: VisualizeCellProps = {
                                ...visualizeCellUtils.default,
                                membraneAbsorption: val,
                            };
                            return game.cells.flatMap((c) => {
                                if (c.playerId === pl.id)
                                    return [attachPropTemplate(c.id, props)];
                                else return [];
                            });
                        });
                        return res;
                    },
                },
                {
                    type: "CapturedCell",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<VisualizeCellProps>>[] => {
                        const playerId = trigger.afterPlayerId;
                        const val = getPerkValue(
                            game,
                            name,
                            playerId,
                            values,
                            defaultValue
                        );

                        const props: VisualizeCellProps = {
                            ...visualizeCellUtils.default,
                            membraneAbsorption: val,
                        };
                        return [attachPropTemplate(trigger.cellId, props)];
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
                    units: 45,
                },
                {
                    id: 1,
                    playerId: 1,
                    position: [400, 100],
                    radius: unitsToRadius(50),
                    units: 50,
                },
                {
                    id: 2,
                    playerId: 1,
                    position: [100, 400],
                    radius: unitsToRadius(50),
                    units: 50,
                },
            ],
            players: 2,
        },
        players: [
            { id: 0, skills: [{ name: name, level: 1 }] },
            { id: 1, skills: [] },
        ],
        perks: [
            {
                name: name,
                data: { type: "number", val: defaultValues },
            },
        ],
        moveHistory: [
            {
                timestamp: 0,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 1, senderIds: [1], receiverId: 0 },
                },
            },
            {
                timestamp: 0,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 1, senderIds: [2], receiverId: 0 },
                },
            },
        ],
    },
};
