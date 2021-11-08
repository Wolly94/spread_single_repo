import Bubble, { createBubble, getNewBubbleIndex } from "../bubble";
import { approaching, centerOverlap, fight } from "./commonMechanics";

test("approaching", () => {
    const setupBubble = (
        position: [number, number],
        direction: [number, number]
    ) => {
        return createBubble({
            id: 0,
            position: position,
            targetId: 0,
            targetPos: [0, 0],
            units: 10,
            creationTime: 0,
            direction: direction,
            motherId: 0,
            playerId: 0,
        });
    };
    const position1: [number, number] = [100, 0];
    const position2: [number, number] = [0, 100];
    const direcitons1: [number, number][] = [
        [1, 0],
        [0, 1],
        [-1, 1],
    ];
    const results: boolean[] = [false, true, true];
    direcitons1.forEach((dir, index) => {
        const b1 = setupBubble(position1, dir);
        const b2 = setupBubble(position2, [0, 0]);
        const approach = approaching(b1, b2);
        expect(approach).toBe(results[index]);
    });
});

test("overlapCenter", () => {
    const pos1: [number, number] = [100, 100];
    const pos2: [number, number] = [110, 100];
    const b1 = createBubble({
        id: 0,
        position: pos1,
        direction: [0, 0],
        units: 50,
        targetPos: [1000, 1000],
        targetId: 0,
        motherId: 0,
        playerId: 0,
        creationTime: 0,
    });
    const b2 = createBubble({
        id: 1,
        position: pos2,
        direction: [0, 0],
        units: 50,
        targetPos: [1000, 1000],
        targetId: 0,
        motherId: 0,
        playerId: 0,
        creationTime: 0,
    });
    const overl = centerOverlap(b1, b2);
    expect(overl).toBe(40);
});

test("fight with modifiers", () => {
    const aUnits = [50, 50, 50];
    const dUnits = [40, 50, 60];
    const am = 11 / 10;
    const dm = 12 / 10;
    const rNeutral = [10, 0, -10];
    const rPlusAttack = [15 / am, 5 / am, -5];
    const rPlusDefense = [2, -10 / dm, -22 / dm];
    aUnits.forEach((att, index) => {
        const def = dUnits[index];
        const fneutral = fight(
            att,
            def,
            { combatAbilityModifier: 0, type: "BubbleFightProps" },
            { combatAbilityModifier: 0, type: "BubbleFightProps" }
        );
        const fPlusAttack = fight(
            att,
            def,
            { combatAbilityModifier: (am-1)*100, type: "BubbleFightProps" },
            { combatAbilityModifier: 0, type: "BubbleFightProps" }
        );
        const fPlusDefense = fight(
            att,
            def,
            { combatAbilityModifier: 0, type: "BubbleFightProps" },
            { combatAbilityModifier: (dm-1)*100, type: "BubbleFightProps" }
        );
        expect(fneutral).toBeCloseTo(rNeutral[index]);
        expect(fPlusAttack).toBeCloseTo(rPlusAttack[index]);
        expect(fPlusDefense).toBeCloseTo(rPlusDefense[index]);
    });
});
