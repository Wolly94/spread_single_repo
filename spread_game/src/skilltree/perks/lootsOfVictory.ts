import { unitsToRadius } from "../../spreadGame/common";
import {
    DefendCellProps,
    defendCellUtils,
} from "../../spreadGame/mechanics/events/defendCell";
import {
    AttachProps,
    TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import { formatDescription } from "../utils";
import { CreatePerk, getPerkValue } from "./perk";

const name = "Loots of Victory";
const defaultValues: number[] = [5, 10];
const defaultValue = 0;
export const LootsOfVictoryPerk: CreatePerk<number> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: name,
            values: values,
            defaultValue: defaultValue,
            description: (lvl) =>
                "For every successful defense the cell gains + " +
                formatDescription(values, (val) => val.toString(), "/") +
                " population.",
            triggers: [
                {
                    type: "DefendedCell",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<DefendCellProps>>[] => {
                        const val = getPerkValue(
                            game,
                            name,
                            trigger.defenderPlayerId,
                            values,
                            defaultValue
                        );
                        const props: DefendCellProps = {
                            ...defendCellUtils.default,
                            additionalUnits: val,
                        };
                        return [
                            {
                                entity: null,
                                perkName: name,
                                triggerType: "DefendedCell",
                                props: {
                                    expirationInMs: "Never",
                                    value: props,
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
                    radius: unitsToRadius(45),
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
            { id: 0, skills: [{ name: name, level: 2 }] },
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
                timestamp: 25,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 1, senderIds: [2], receiverId: 0 },
                },
            },
        ],
    },
};
