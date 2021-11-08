import { SpreadGameImplementation } from ".";
import { HistoryEntry } from "../messages/replay/replay";
import { CollisionEvent } from "../skilltree/events";
import { BaseAttackPerk } from "../skilltree/perks/baseAttack";
import { getPerkByName, SkilledPerk } from "../skilltree/skilltree";
import Bubble from "./bubble";
import Cell from "./cell";
import { SpreadMap } from "./map/map";
import { defaultSpeed } from "./mechanics/basicMechanics";

const createMapHelper = (cells: Cell[]): SpreadMap => {
    return {
        height: 1000,
        width: 1000,
        players: 10,
        cells: cells,
    };
};

const calculatedCollisionTimeInMs = (b1: Bubble, b2: Bubble) => {
    const distance = Math.sqrt(
        (b1.position[0] - b2.position[0]) ** 2 +
            (b1.position[1] - b2.position[1]) ** 2
    );
    return (distance / 2 / defaultSpeed) * 1000;
};

test("cell collision", () => {
    const cells: Cell[] = [
        { id: 0, playerId: 0, position: [100, 100], radius: 50, units: 50 },
        { id: 1, playerId: 1, position: [400, 500], radius: 50, units: 50 },
    ];
    const gameState = new SpreadGameImplementation(
        createMapHelper(cells),
        {
            mechanics: "basic",
            updateFrequencyInMs: 50,
        },
        [
            { id: 0, skills: [] },
            { id: 1, skills: [] },
        ]
    );
    gameState.sendUnits(0, [0], 1);
    expect(gameState.bubbles.length).toBe(1);
    gameState.run(10000, 25);
    expect(gameState.bubbles.length).toBe(0);
    const sendUnitsEvent = gameState.eventHistory.find(
        (ev) => ev.data.type === "SendBubbleEvent"
    );
    const fightEvent: CollisionEvent | undefined = gameState.eventHistory.find(
        (ev): ev is HistoryEntry<CollisionEvent> =>
            ev.data.type === "CollisionEvent"
    )?.data;
    const defeatBubbleEvent = gameState.eventHistory.find(
        (ev) => ev.data.type === "DefeatedBubble"
    );
    const collisionEvent = gameState.eventHistory.find(
        (ev) => ev.data.type === "CollisionEvent"
    );
    expect(sendUnitsEvent?.timestamp).not.toBe(undefined);
    expect(fightEvent?.finished).toBe(true);
    expect(defeatBubbleEvent?.timestamp).not.toBe(undefined);
    expect(collisionEvent).not.toBe(undefined);
    expect(gameState.eventHistory.length).toBe(4);
});

test("bubble collision", () => {
    const cells: Cell[] = [
        { id: 0, playerId: 0, position: [100, 100], radius: 50, units: 50 },
        { id: 1, playerId: 1, position: [400, 500], radius: 50, units: 50 },
    ];
    const gameState = new SpreadGameImplementation(
        createMapHelper(cells),
        {
            mechanics: "basic",
            updateFrequencyInMs: 50,
        },
        [
            { id: 0, skills: [] },
            { id: 1, skills: [] },
        ]
    );
    gameState.sendUnits(0, [0], 1);
    gameState.sendUnits(1, [1], 0);
    expect(gameState.bubbles.length).toBe(2);
    const b1 = gameState.bubbles[0];
    const b2 = gameState.bubbles[1];
    const ms = calculatedCollisionTimeInMs(b1, b2);
    gameState.run(5000, 25);
    expect(gameState.bubbles.length).toBe(0);
    const sendUnitsEvent = gameState.eventHistory.find(
        (ev) => ev.data.type === "SendBubbleEvent"
    );
    const fightEvent: CollisionEvent | undefined = gameState.eventHistory.find(
        (ev): ev is HistoryEntry<CollisionEvent> =>
            ev.data.type === "CollisionEvent"
    )?.data;
    const defeatBubbleEvent = gameState.eventHistory.find(
        (ev) => ev.data.type === "DefeatedBubble"
    );
    const fightEvents = gameState.eventHistory.filter(
        (ev) => ev.data.type === "CollisionEvent"
    );
    expect(
        gameState.eventHistory.filter(
            (ev) => ev.data.type === "SendBubbleEvent"
        ).length
    ).toBe(2);
    expect(
        gameState.eventHistory.filter((ev) => ev.data.type === "CollisionEvent")
            .length
    ).toBe(1);
    expect(
        gameState.eventHistory.filter((ev) => ev.data.type === "DefeatedBubble")
            .length
    ).toBe(2);
    expect(gameState.eventHistory.length).toBe(5);
});

test("bubble collision with attack modifier", () => {
    const cells: Cell[] = [
        { id: 0, playerId: 0, position: [100, 100], radius: 50, units: 50 },
        { id: 1, playerId: 1, position: [400, 500], radius: 50, units: 50 },
    ];
    const baseAttackPerk = getPerkByName(BaseAttackPerk.name);
    expect(baseAttackPerk).not.toBe(null);
    const skills: SkilledPerk[] =
        baseAttackPerk !== null ? [{ level: 1, perk: baseAttackPerk }] : [];
    const gameState = new SpreadGameImplementation(
        createMapHelper(cells),
        {
            updateFrequencyInMs: 50,
            mechanics: "basic",
        },
        [
            {
                id: 0,
                skills: skills,
            },
            { id: 1, skills: [] },
        ]
    );
    gameState.sendUnits(0, [0], 1);
    gameState.sendUnits(1, [1], 0);
    expect(gameState.bubbles.length).toBe(2);
    const b1 = gameState.bubbles[0];
    const b2 = gameState.bubbles[1];
    const ms = calculatedCollisionTimeInMs(b1, b2);
    gameState.step(ms);
    expect(gameState.bubbles.length).toBe(1);
    const remBubble = gameState.bubbles[0];
    expect(remBubble.playerId).toBe(0);
});
