import { HistoryEntry } from "../../messages/replay/replay";
import Cell from "../../spreadGame/cell";
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
import { SpreadGameEvent } from "../events";
import { formatDescription } from "../utils";
import { CreatePerk, getPerkValue } from "./perk";

const name = "Preparation";
const defaultValues: [number, number][] = [
    [1, 50],
    [2, 100],
];
const defaultValue: [number, number] = [0, 0];

const latestMoveTimeStamp = (
    cell: Cell,
    eventHistory: HistoryEntry<SpreadGameEvent>[]
): number => {
    const lastAttackSent = eventHistory
        .filter(
            (ev) =>
                ev.data.type === "SendBubbleEvent" &&
                ev.data.sender.id === cell.id
        )
        .slice(-1)[0];
    const lastConquered = eventHistory
        .filter(
            (ev) =>
                ev.data.type === "CapturedCell" &&
                ev.data.cellId === cell.id &&
                ev.data.beforePlayerId !== ev.data.afterPlayerId // this is unneccessary
        )
        .slice(-1)[0];
    const latestTimeStamp = Math.max(
        lastAttackSent === undefined ? 0 : lastAttackSent.timestamp,
        lastConquered === undefined ? 0 : lastConquered.timestamp
    );
    return latestTimeStamp;
};

const attachPropTemplate = (
    cellId: number,
    prop: VisualizeCellProps | CellFightProps
) => {
    const res: AttachProps<TimedProps<CellFightProps | VisualizeCellProps>> = {
        entity: { type: "Cell", id: cellId },
        perkName: name,
        triggerType: "TimeStep",
        props: {
            expirationInMs: "Never",
            value: prop,
        },
    };
    return res;
};

export const PreparationPerk: CreatePerk<[number, number]> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: name,
            values: values,
            defaultValue: defaultValue,
            description: (lvl) =>
                "Raises combat abilities of your cells by " +
                formatDescription(
                    values,
                    (val) => val[0].toString() + "%",
                    "/"
                ) +
                " for each second that cell did not send an attack, capped at " +
                formatDescription(
                    values,
                    (val) => val[1].toString() + "%",
                    "/"
                ) +
                ".",
            triggers: [
                {
                    type: "TimeStep",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<
                        TimedProps<VisualizeCellProps | CellFightProps>
                    >[] => {
                        const res: AttachProps<
                            TimedProps<VisualizeCellProps | CellFightProps>
                        >[] = game.players.flatMap((p) => {
                            const val = getPerkValue(
                                game,
                                name,
                                p.id,
                                values,
                                defaultValue
                            );
                            return game.cells
                                .filter((cell) => cell.playerId === p.id)
                                .flatMap((cell) => {
                                    const idleInMs =
                                        game.timePassed -
                                        latestMoveTimeStamp(
                                            cell,
                                            game.eventHistory
                                        );
                                    const combatModifier = Math.min(
                                        (val[0] * idleInMs) / 1000,
                                        val[1]
                                    );
                                    const prop1: VisualizeCellProps = {
                                        ...visualizeCellUtils.default,
                                        combatAbilityModifier: combatModifier,
                                    };
                                    const prop2: CellFightProps = {
                                        ...cellFightUtils.default,
                                        combatAbilityModifier: combatModifier,
                                    };
                                    return [
                                        attachPropTemplate(cell.id, prop1),
                                        attachPropTemplate(cell.id, prop2),
                                    ];
                                });
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
                    position: [200, 200],
                    radius: unitsToRadius(204),
                    units: 204,
                },
                {
                    id: 1,
                    playerId: 1,
                    position: [400, 100],
                    radius: unitsToRadius(100),
                    units: 100,
                },
            ],
            players: 2,
        },
        players: [
            { id: 0, skills: [] },
            { id: 1, skills: [{ name: name, level: 2 }] },
        ],
        perks: [
            {
                name: name,
                data: { type: "number_number", val: defaultValues },
            },
        ],
        moveHistory: [
            {
                timestamp: 2000,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 0, senderIds: [0], receiverId: 1 },
                },
            },
        ],
    },
};
