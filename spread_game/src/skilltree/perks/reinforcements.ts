import { SpreadMap } from "../../spreadGame/map/map";
import {
    AttachProps,
    TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import {
    StartGameCellProps,
    startGameCellUtils,
} from "../../spreadGame/mechanics/events/startGame";
import { formatDescription } from "../utils";
import { CreatePerk, getPerkValue } from "./perk";

const name = "Reinforcements";
const defaultValues = [9, 15];
const defaultValue = 0;

export const ReinforcementsPerk: CreatePerk<number> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: name,
            defaultValue: defaultValue,
            values: defaultValues,
            description: (lvl) =>
                "At the beginning, every friendly cell starts with +" +
                formatDescription(values, (val) => val.toString(), "/") +
                " population.",
            triggers: [
                {
                    type: "StartGame",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<StartGameCellProps>>[] => {
                        const res = game.players.flatMap((pl) => {
                            const val = getPerkValue(
                                game,
                                name,
                                pl.id,
                                values,
                                defaultValue
                            );
                            const res2 = game.cells
                                .filter((cell) => cell.playerId === pl.id)
                                .map(
                                    (
                                        cell
                                    ): AttachProps<
                                        TimedProps<StartGameCellProps>
                                    > => {
                                        return {
                                            entity: {
                                                type: "Cell",
                                                id: cell.id,
                                            },
                                            perkName: name,
                                            triggerType: "StartGame",
                                            props: {
                                                expirationInMs: "Never",
                                                value: {
                                                    ...startGameCellUtils.default,
                                                    additionalUnits: val,
                                                },
                                            },
                                        };
                                    }
                                );
                            return res2;
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
                    radius: 50,
                    units: 10,
                },
                {
                    id: 1,
                    playerId: 1,
                    position: [400, 400],
                    radius: 50,
                    units: 10,
                },
            ],
            players: 2,
        },
        players: [
            { id: 0, skills: [{ name: name, level: 3 }] },
            { id: 1, skills: [] },
        ],
        perks: [{ name: name, data: { type: "number", val: defaultValues } }],
        moveHistory: [],
    },
};
