import Bubble, { createBubble } from "../bubble";
import basicMechanics from "./basicMechanics";

test("collide 50 vs 25 units", () => {
    const u1 = 50;
    const u2 = 25;
    const b1 = createBubble({
        id: 0,
        playerId: 0,
        position: [0, 0],
        direction: [0, 0],
        units: u1,
        targetId: 0,
        targetPos: [1000, 1000],
        motherId: 0,
        creationTime: 0,
    });
    const b2 = createBubble({
        id: 1,
        playerId: 1,
        position: [0, 0],
        direction: [0, 0],
        units: u2,
        targetId: 0,
        targetPos: [1000, 1000],
        motherId: 0,
        creationTime: 0,
    });
    const res = basicMechanics.collideBubble(
        b1,
        b2,
        { combatAbilityModifier: 1.0, type: "BubbleFightProps" },
        { combatAbilityModifier: 1.0, type: "BubbleFightProps" }
    );
    expect(res[0]).not.toBe(null);
    expect(res[1]).toBe(null);
    if (res[0] === null) {
        expect(true).toBe(false);
    } else {
        expect(res[0].units).toBe(u1 - u2);
    }
});

test("collide 50 vs 50 units", () => {
    const u1 = 50;
    const u2 = 50;
    const b1 = createBubble({
        id: 0,
        playerId: 0,
        position: [0, 0],
        direction: [0, 0],
        units: u1,
        targetId: 0,
        targetPos: [1000, 1000],
        motherId: 0,
        creationTime: 0,
    });
    const b2 = createBubble({
        id: 1,
        playerId: 1,
        position: [0, 0],
        direction: [0, 0],
        units: u2,
        targetId: 0,
        targetPos: [1000, 1000],
        motherId: 0,
        creationTime: 0,
    });
    const res = basicMechanics.collideBubble(
        b1,
        b2,
        { combatAbilityModifier: 1.0, type: "BubbleFightProps" },
        { combatAbilityModifier: 1.0, type: "BubbleFightProps" }
    );
    expect(res[0]).toBe(null);
    expect(res[1]).toBe(null);
});

test("collide 25 vs 50 units", () => {
    const u1 = 25;
    const u2 = 50;
    const b1 = createBubble({
        id: 0,
        playerId: 0,
        position: [0, 0],
        direction: [0, 0],
        units: u1,
        targetId: 0,
        targetPos: [1000, 1000],
        motherId: 0,
        creationTime: 0,
    });
    const b2 = createBubble({
        id: 1,
        playerId: 1,
        position: [0, 0],
        direction: [0, 0],
        units: u2,
        targetId: 0,
        targetPos: [1000, 1000],
        motherId: 0,
        creationTime: 0,
    });
    const res = basicMechanics.collideBubble(
        b1,
        b2,
        { combatAbilityModifier: 1.0, type: "BubbleFightProps" },
        { combatAbilityModifier: 1.0, type: "BubbleFightProps" }
    );
    expect(res[0]).toBe(null);
    expect(res[1]).not.toBe(null);
    if (res[1] === null) {
        expect(true).toBe(false);
    } else {
        expect(res[1].units).toBe(u2 - u1);
    }
});
