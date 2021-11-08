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
import { formatDescription } from "../utils";
import { CreatePerk, getPerkValue } from "./perk";

const name = "BaseDefense";
const defaultValue = 0;
const defaultValues = [10, 20, 30];

const attachProps = (
    val: number,
    cellId: number
): AttachProps<TimedProps<CellFightProps | VisualizeCellProps>>[] => {
    const resTempl: AttachProps<TimedProps<CellFightProps>> = {
        entity: {
            type: "Cell",
            id: cellId,
        },
        perkName: name,
        triggerType: "CapturedCell",
        props: {
            expirationInMs: "Never",
            value: {
                ...cellFightUtils.default,
                combatAbilityModifier: val,
            },
        },
    };
    const visProps: AttachProps<TimedProps<VisualizeCellProps>> = {
        ...resTempl,
        props: {
            ...resTempl.props,
            value: {
                ...visualizeCellUtils.default,
                combatAbilityModifier: val,
            },
        },
    };
    return [resTempl, visProps];
};

export const BaseDefensePerk: CreatePerk<number> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: name,
            defaultValue: defaultValue,
            values: values,
            description: (lvl) =>
                "Raises combat abilities of your cells by " +
                formatDescription(values, (val) => val.toString() + "%", "/") +
                ".",
            triggers: [
                {
                    type: "CapturedCell",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<
                        TimedProps<CellFightProps | VisualizeCellProps>
                    >[] => {
                        const playerId = trigger.afterPlayerId;
                        const val = getPerkValue(
                            game,
                            name,
                            playerId,
                            values,
                            defaultValue
                        );
                        return attachProps(val, trigger.cellId);
                    },
                },
                {
                    type: "StartGame",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<
                        TimedProps<CellFightProps | VisualizeCellProps>
                    >[] => {
                        const res = game.players.flatMap((p) => {
                            const val = getPerkValue(
                                game,
                                name,
                                p.id,
                                values,
                                defaultValue
                            );
                            return game.cells
                                .filter((c) => c.playerId === p.id)
                                .flatMap((c) => attachProps(val, c.id));
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
                    radius: 50,
                    units: 50,
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
            {
                timestamp: 1000,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 0, senderIds: [0], receiverId: 1 },
                },
            },
        ],
    },
};
