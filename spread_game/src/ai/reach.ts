import { GameSettings } from "../messages/inGame/gameServerMessages";
import { HistoryEntry } from "../messages/replay/replay";
import { CollisionEvent } from "../skilltree/events";
import { SkilledPerk } from "../skilltree/skilltree";
import { SpreadGameImplementation } from "../spreadGame";
import Cell from "../spreadGame/cell";
import { radiusToUnits, unitsToRadius } from "../spreadGame/common";
import { SpreadMap } from "../spreadGame/map/map";
import basicMechanics from "../spreadGame/mechanics/basicMechanics";
import { sendUnitsUtils } from "../spreadGame/mechanics/events/sendUnits";

export type ReachType =
    | { type: "basic"; durationInMs: number; maxSendableUnits: number }
    | { type: "scratch"; durationInMs: number; maxReceivableUnits: number }
    | { type: "bounce"; durationInMs: number; absoluteUnitLoss: number };

export interface AttackerData {
    effectiveAttackers: number;
    durationInMs: number;
}

export const getAttackerData = (
    attackers: number,
    reachType: ReachType | null
): AttackerData => {
    var effectiveAttackers: number = 0;
    if (reachType?.type === "scratch") {
        effectiveAttackers = Math.max(attackers, reachType.maxReceivableUnits);
    } else if (reachType?.type === "basic") {
        if (attackers >= reachType.maxSendableUnits) effectiveAttackers = 0;
        else effectiveAttackers = attackers;
    } else if (reachType?.type === "bounce") {
        effectiveAttackers = Math.max(
            0,
            attackers - reachType.absoluteUnitLoss
        );
    }
    if (reachType === null) return { effectiveAttackers: 0, durationInMs: 0 };
    else {
        return {
            effectiveAttackers: effectiveAttackers,
            durationInMs: reachType.durationInMs,
        };
    }
};

const maxSendableUnits = (cell: Cell): number => {
    const dummyCell: Cell = {
        id: -1,
        playerId: 0,
        position: [-100, -100],
        radius: 50,
        units: 50,
    };
    const [newCell, newBubble] = basicMechanics.sendBubble(
        { ...cell, units: radiusToUnits(cell.radius) * 10, playerId: 0 },
        dummyCell,
        0,
        sendUnitsUtils.default
    );
    return newBubble === null ? 0 : newBubble.units;
};

export const reachByUnit = (
    map: SpreadMap,
    settings: GameSettings,
    skills: SkilledPerk[],
    senderId: number,
    receiverId: number,
    unitsToSend: number
): { duration: number | "Infinity"; receivedUnits: number } => {
    const players = [{ id: 0, skills: skills }];
    const newMap = {
        ...map,
        cells: map.cells.map((c) => {
            if (c.id === senderId)
                return {
                    ...c,
                    playerId: 0,
                    units: unitsToSend * 2,
                };
            else return { ...c, units: 1000000, playerId: null };
        }),
    };
    const game = new SpreadGameImplementation(
        newMap,
        settings,
        players,
        skills.map((sk) => sk.perk)
    );
    game.sendUnits(0, [senderId], receiverId);
    const bubbleId = game.bubbles.find(() => true)?.id;
    while (game.bubbles.length === 1) {
        game.step(settings.updateFrequencyInMs);
    }
    const expectedEvent = game.eventHistory
        .filter(
            (ev): ev is HistoryEntry<CollisionEvent> =>
                ev.data.type === "CollisionEvent"
        )
        .find(
            (ev) =>
                ev.data.before.bubble.id === bubbleId &&
                ev.data.before.other.type === "Cell" &&
                ev.data.before.other.val.id === receiverId
        );
    if (expectedEvent === undefined)
        return { duration: "Infinity", receivedUnits: 0 };
    else {
        const afterUnits =
            expectedEvent.data.after.other.type === "Cell"
                ? expectedEvent.data.after.other.val.units
                : 0;
        const unitDiff = expectedEvent.data.before.other.val.units - afterUnits;
        return { duration: game.timePassed, receivedUnits: unitDiff };
    }
};

export const reach = (
    map: SpreadMap,
    settings: GameSettings,
    skills: SkilledPerk[],
    senderId: number,
    receiverId: number
): ReachType | null => {
    const senderCell = map.cells.find((c) => c.id === senderId);
    if (senderCell === undefined) return null;
    const maxSendUnits = maxSendableUnits({ ...senderCell });
    if (settings.mechanics === "basic") {
        var currentUnitsToSend = maxSendUnits;
        while (currentUnitsToSend >= 0) {
            const r = reachByUnit(
                map,
                settings,
                skills,
                senderId,
                receiverId,
                currentUnitsToSend
            );
            if (r.duration === "Infinity") currentUnitsToSend -= 1;
            else
                return {
                    type: "basic",
                    durationInMs: r.duration,
                    maxSendableUnits: currentUnitsToSend,
                };
        }
        return null;
    } else if (settings.mechanics === "scrapeoff") {
        var currentUnitsToSend = maxSendUnits;
        const r = reachByUnit(
            map,
            settings,
            skills,
            senderId,
            receiverId,
            currentUnitsToSend
        );
        if (r.duration === "Infinity") return null;
        else
            return {
                type: "scratch",
                durationInMs: r.duration,
                maxReceivableUnits: r.receivedUnits,
            };
    } else if (settings.mechanics === "bounce") {
        var maxBounced = -1;
        var maxDuration = -1;
        var unitsInPercentToSend = 0.1;
        while (unitsInPercentToSend <= 1) {
            var currentUnitsToSend = maxSendUnits * unitsInPercentToSend;
            const r = reachByUnit(
                map,
                settings,
                skills,
                senderId,
                receiverId,
                currentUnitsToSend
            );
            if (r.duration !== "Infinity") {
                maxBounced = Math.max(
                    maxBounced,
                    currentUnitsToSend - r.receivedUnits
                );
                maxDuration = Math.max(maxDuration, r.duration);
            }
            unitsInPercentToSend += 0.1;
        }
        if (maxBounced < 0) return null;
        else {
            return {
                type: "bounce",
                durationInMs: maxDuration,
                absoluteUnitLoss: Math.round(maxBounced),
            };
        }
    }
    return null;
};
