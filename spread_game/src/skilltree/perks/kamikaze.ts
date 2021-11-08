import { unitsToRadius } from "../../spreadGame/common";
import {
    ConquerCellProps,
    conquerCellUtils,
} from "../../spreadGame/mechanics/events/conquerCell";
import {
    AttachProps,
    TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import { formatDescription } from "../utils";
import { CreatePerk, getPerkValue } from "./perk";

const name = "Kamikaze";
const defaultValues: number[] = [0.8, 0.5];
const defaultValue = 1;

export const KamikazePerk: CreatePerk<number> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: name,
            defaultValue: defaultValue,
            values: values,
            description: (lvl) =>
                "When a cell is lost only " +
                formatDescription(values, (val) => val.toString() + "%", "/") +
                " of the conquering army remains.",
            triggers: [
                {
                    type: "CapturedCell",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<ConquerCellProps>>[] => {
                        const val = getPerkValue(
                            game,
                            name,
                            trigger.beforePlayerId,
                            values,
                            defaultValue
                        );
                        const props: ConquerCellProps = {
                            ...conquerCellUtils.default,
                            unitsInPercentToRemain: val,
                        };
                        return [
                            {
                                entity: null,
                                perkName: name,
                                triggerType: name,
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
                    radius: 50,
                    units: 50,
                },
                {
                    id: 1,
                    playerId: 1,
                    position: [400, 100],
                    radius: unitsToRadius(100),
                    units: 200,
                },
            ],
            players: 2,
        },
        players: [
            { id: 0, skills: [{ name: name, level: 1 }] },
            { id: 1, skills: [] },
        ],
        perks: [{ name: name, data: { type: "number", val: [0.5] } }],
        moveHistory: [
            {
                timestamp: 0,
                data: {
                    type: "sendunitsmove",
                    data: { playerId: 1, senderIds: [1], receiverId: 0 },
                },
            },
        ],
    },
};
