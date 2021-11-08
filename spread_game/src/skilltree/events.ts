import { HistoryEntry } from "../messages/replay/replay";
import Bubble from "../spreadGame/bubble";
import Cell from "../spreadGame/cell";
import { distance } from "../spreadGame/entites";

export interface CollisionData {
    unitsLost: number;
    position: [number, number];
    beforePlayerId: number | null;
    afterPlayerId: number | null;
}

export interface PartialCollision {
    bubble: CollisionData;
    other: CollisionData;
}

const fromCollisionStates = (
    before: BeforeCollisionState,
    after: AfterCollisionState
): PartialCollision => {
    const attacker: CollisionData = {
        beforePlayerId: before.bubble.playerId,
        afterPlayerId: after.bubble === null ? null : after.bubble.playerId,
        position: before.bubble.position,
        unitsLost:
            before.bubble.units -
            (after.bubble !== null ? after.bubble.units : 0),
    };

    const defender: CollisionData = {
        beforePlayerId: before.other.val.playerId,
        afterPlayerId:
            after.other.val === null ? null : after.other.val.playerId,
        position: before.other.val.position,
        unitsLost:
            before.other.val.units -
            (after.other.val !== null ? after.other.val.units : 0),
    };
    return { bubble: attacker, other: defender };
};

export type BeforeCollisionOtherState =
    | { type: "Bubble"; val: Bubble }
    | { type: "Cell"; val: Cell };

export interface BeforeCollisionState {
    bubble: Bubble;
    other: BeforeCollisionOtherState;
}

export type AfterCollisionOtherState =
    | { type: "Bubble"; val: Bubble | null }
    | { type: "Cell"; val: Cell };

export interface AfterCollisionState {
    bubble: Bubble | null;
    other: AfterCollisionOtherState;
}

export interface CollisionEvent {
    type: "CollisionEvent";
    before: BeforeCollisionState;
    after: AfterCollisionState; // if !finished, then this holds data of current state
    finished: boolean;
    partialCollisions: HistoryEntry<PartialCollision>[];
}

export const getFinishTime = (ev: CollisionEvent) => {
    if (!ev.finished || ev.partialCollisions.length === 0) return null;
    const latestColl = ev.partialCollisions.slice(-1)[0];
    return latestColl.timestamp;
};

export const latestDistance = (event: CollisionEvent): number => {
    const latestState = event.partialCollisions.slice(-1)[0].data;
    return distance(latestState.bubble.position, latestState.other.position);
};

export const collisionEventFinished = (event: CollisionEvent) => {
    return event.finished;
};

export const finishCollisionEvent = (event: CollisionEvent) => {
    event.finished = true;
    return event;
};

export const entitiesApproached = (
    before: PartialCollision,
    after: PartialCollision
): boolean => {
    const newDist = distance(after.bubble.position, after.other.position);
    const latestDist = distance(before.bubble.position, before.other.position);
    return latestDist > newDist;
};

export const createCollisionEvent = (
    beforeFight: BeforeCollisionState,
    afterFight: AfterCollisionState,
    timePassed: number
): CollisionEvent => {
    const partialFight = fromCollisionStates(beforeFight, afterFight);
    const finished =
        afterFight.bubble === null ||
        (afterFight.other.type === "Bubble" && afterFight.other.val === null);
    return {
        type: "CollisionEvent",
        partialCollisions: [{ timestamp: timePassed, data: partialFight }],
        after: afterFight,
        before: beforeFight,
        finished: finished,
    };
};

// either modifies FightEvent in place or creates a new one
export const combinedCollisionEvents = (
    collisionEvent: CollisionEvent,
    beforeCollision: BeforeCollisionState,
    afterCollision: AfterCollisionState,
    timePassed: number
): boolean => {
    const partialCollision = fromCollisionStates(
        beforeCollision,
        afterCollision
    );
    const latestState = collisionEvent.partialCollisions.slice(-1)[0].data;
    if (
        entitiesApproached(latestState, partialCollision) &&
        !collisionEventFinished(collisionEvent)
    ) {
        collisionEvent.partialCollisions.push({
            timestamp: timePassed,
            data: partialCollision,
        });
        collisionEvent.after = afterCollision;
        if (
            afterCollision.bubble === null ||
            (afterCollision.other.type === "Bubble" &&
                afterCollision.other.val === null)
        ) {
            finishCollisionEvent(collisionEvent);
        }
        return true;
    } else {
        finishCollisionEvent(collisionEvent);
        return false;
    }
};

export interface SendBubbleEvent {
    type: "SendBubbleEvent";
    sender: Cell;
    receiver: Cell;
}

// this is an intermediate event that can happen any time during a collision event
export interface CapturedCellEvent {
    type: "CapturedCell";
    cellId: number;
    beforePlayerId: number | null;
    afterPlayerId: number;
}

export const getCapturedCellEvent = (
    beforeCollision: BeforeCollisionState,
    afterCollision: AfterCollisionState
): CapturedCellEvent | null => {
    if (
        beforeCollision.other.type === "Cell" &&
        afterCollision.other.type === "Cell" &&
        afterCollision.other.val.playerId !== null &&
        beforeCollision.other.val.playerId !== afterCollision.other.val.playerId
    ) {
        return {
            afterPlayerId: afterCollision.other.val.playerId,
            beforePlayerId: beforeCollision.other.val.playerId,
            cellId: beforeCollision.other.val.id,
            type: "CapturedCell",
        };
    } else return null;
};

export interface ReinforcedCellEvent {
    type: "ReinforcedCell";
    bubbleId: number;
    cellId: number;
    playerId: number;
    unitsTransferred: number;
    collisionEvent: CollisionEvent;
}

export interface DefendedCellEvent {
    type: "DefendedCell";
    bubbleId: number;
    cellId: number;
    defenderPlayerId: number | null;
    attackerPlayerId: number;
    unitsDefeated: number;
    collisionEvent: CollisionEvent;
}

export interface DefeatedBubbleEvent {
    type: "DefeatedBubble";
    unitsDefeated: number;
    defeaterPlayerId: number | null;
    other: AfterCollisionOtherState;
    collisionEvent: CollisionEvent;
}

// After collision ended and bubble is defeated from this event and the owner of the cell after collision is
// not the same as the owner of the bubble, then there is an "DefendedCellEvent"
export const getDefendedCellEvent = (
    event: CollisionEvent
): DefendedCellEvent | null => {
    if (!event.finished) return null;
    if (event.after.other.type !== "Cell") return null;
    if (event.after.bubble !== null) return null;

    const bubbleId = event.before.bubble.id;
    const cellId = event.before.other.val.id;
    const attackerPlayerId = event.before.bubble.playerId;
    const defenderPlayerId = event.after.other.val.playerId;
    if (defenderPlayerId === attackerPlayerId) return null;

    if (event.partialCollisions.length === 0) return null;
    var index = event.partialCollisions.length - 1;
    while (
        index >= 0 &&
        event.partialCollisions[index].data.other.beforePlayerId ===
            defenderPlayerId &&
        event.partialCollisions[index].data.other.afterPlayerId ===
            defenderPlayerId
    ) {
        index -= 1;
    }
    const defenderPartialCollisions = event.partialCollisions.slice(index + 1);
    const unitsDefeated = defenderPartialCollisions.reduce(
        (prev, curr) => prev + curr.data.bubble.unitsLost,
        0
    );

    if (defenderPartialCollisions.length === 0 || unitsDefeated === 0)
        return null;

    return {
        type: "DefendedCell",
        cellId: cellId,
        bubbleId: bubbleId,
        defenderPlayerId: defenderPlayerId,
        attackerPlayerId: attackerPlayerId,
        unitsDefeated: unitsDefeated,
        collisionEvent: event,
    };
};

export const getReinforcedCellEvent = (
    event: CollisionEvent
): ReinforcedCellEvent | null => {
    if (!event.finished) return null;
    if (event.before.other.type !== "Cell") return null;
    if (event.after.bubble !== null) return null;

    const bubbleId = event.before.bubble.id;
    const cellId = event.before.other.val.id;
    const fromPlayerId = event.before.bubble.playerId;
    const reinforceCollisions = event.partialCollisions.filter(
        (pc) =>
            pc.data.other.beforePlayerId === fromPlayerId &&
            pc.data.other.beforePlayerId === pc.data.other.afterPlayerId
    );
    if (reinforceCollisions.length === 0) return null;
    const timestamp = reinforceCollisions.slice(-1)[0].timestamp;
    const transferredUnits = reinforceCollisions.reduce(
        (prev, curr) => prev + curr.data.bubble.unitsLost,
        0
    );
    if (transferredUnits === 0) return null;

    return {
        type: "ReinforcedCell",
        bubbleId: bubbleId,
        cellId: cellId,
        playerId: fromPlayerId,
        unitsTransferred: transferredUnits,
        collisionEvent: event,
    };
};

export const getDefeatedBubbleEvents = (
    event: CollisionEvent
): DefeatedBubbleEvent[] => {
    if (!event.finished) return [];
    if (event.after.bubble !== null && event.after.other.val !== null)
        return [];

    const res: [number, number] = [0, 0];
    const [defUnits1, defUnits2] = event.partialCollisions.reduce(
        (prev, curr) => {
            return [
                prev[0] + curr.data.bubble.unitsLost,
                prev[1] + curr.data.other.unitsLost,
            ];
        },
        res
    );

    const defeatedBubbleEvents: DefeatedBubbleEvent[] = [];
    const after = event.after;
    if (after.bubble === null) {
        defeatedBubbleEvents.push({
            type: "DefeatedBubble",
            defeaterPlayerId: event.before.other.val.playerId,
            unitsDefeated: defUnits1,
            other: after.other,
            collisionEvent: event,
        });
    }
    if (after.other.type === "Bubble" && after.other.val === null) {
        defeatedBubbleEvents.push({
            type: "DefeatedBubble",
            defeaterPlayerId: event.before.bubble.playerId,
            unitsDefeated: defUnits2,
            other: { type: "Bubble", val: after.bubble },
            collisionEvent: event,
        });
    }
    return defeatedBubbleEvents;
};

export const processFinishedCollisionEvent = (
    event: CollisionEvent
): (ReinforcedCellEvent | DefendedCellEvent | DefeatedBubbleEvent)[] => {
    if (!event.finished) return [];
    const reinf = getReinforcedCellEvent(event);
    const defend = getDefendedCellEvent(event);
    const defeat = getDefeatedBubbleEvents(event);
    const result: (
        | ReinforcedCellEvent
        | DefendedCellEvent
        | DefeatedBubbleEvent
    )[] = [];
    if (reinf !== null) result.push(reinf);
    if (defend !== null) result.push(defend);
    return result.concat(defeat);
};

export type SpreadGameEvent =
    | CollisionEvent
    | SendBubbleEvent
    | CapturedCellEvent
    | ReinforcedCellEvent
    | DefendedCellEvent
    | DefeatedBubbleEvent;
