import SpreadReplay from "../../messages/replay/replay";
import { SpreadMap } from "../../spreadGame/map/map";
import {
    AttachProps,
    TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import {
    GrowthProps,
    growthUtils,
} from "../../spreadGame/mechanics/events/growth";
import { formatDescription } from "../utils";
import { Perk, CreatePerk, getPerkValue } from "./perk";

const name = "FertileGrounds";
const defaultValues = [6, 12, 18];
const defaultValue = 0;

const getReturnValue = (cellId: number, additionalGrowth: number) => {
    const props: GrowthProps = {
        ...growthUtils.default,
        additionalGrowthInPercent: additionalGrowth,
    };
    const res: AttachProps<TimedProps<GrowthProps>> = {
        entity: { type: "Cell", id: cellId },
        perkName: name,
        triggerType: "Conquer",
        props: {
            expirationInMs: "Never",
            value: props,
        },
    };
    return res;
};

export const FertileGroundsPerk: CreatePerk<number> = {
    name: name,
    createFromValues: (values = defaultValues) => {
        return {
            name: name,
            displayName: "Fertile Grounds",
            defaultValue: defaultValue,
            values: values,
            description: (lvl) =>
                "Growth is increased by " +
                formatDescription(values, (val) => val.toString() + "%", "/") +
                ".",
            triggers: [
                {
                    type: "CapturedCell",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<GrowthProps>>[] => {
                        const playerId = trigger.beforePlayerId;
                        const cellId = trigger.cellId;
                        const val = getPerkValue(
                            game,
                            name,
                            playerId,
                            values,
                            defaultValue
                        );

                        return [getReturnValue(cellId, val)];
                    },
                },
                {
                    type: "StartGame",
                    getValue: (
                        trigger,
                        game
                    ): AttachProps<TimedProps<GrowthProps>>[] => {
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
                                .map((cell) => {
                                    return getReturnValue(cell.id, val);
                                });
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
                    units: 20,
                },
                {
                    id: 1,
                    playerId: 1,
                    position: [400, 100],
                    radius: 50,
                    units: 20,
                },
            ],
            players: 2,
        },
        players: [
            { id: 0, skills: [{ name: name, level: 3 }] },
            { id: 1, skills: [] },
        ],
        perks: [{ name: name, data: { type: "number", val: [10, 20, 30] } }],
        moveHistory: [],
    },
};
