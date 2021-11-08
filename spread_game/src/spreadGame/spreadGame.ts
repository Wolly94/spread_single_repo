import { CellData, ClientGameState } from "../messages/inGame/clientGameState";
import { GameSettings } from "../messages/inGame/gameServerMessages";
import SpreadReplay, { HistoryEntry, Move } from "../messages/replay/replay";
import {
    AfterCollisionState,
    BeforeCollisionState,
    combinedCollisionEvents,
    createCollisionEvent,
    DefeatedBubbleEvent,
    CollisionEvent,
    finishCollisionEvent,
    latestDistance,
    SpreadGameEvent,
    getCapturedCellEvent,
    getDefeatedBubbleEvents,
    CapturedCellEvent,
    ReinforcedCellEvent,
    getReinforcedCellEvent,
    DefendedCellEvent,
    processFinishedCollisionEvent,
} from "../skilltree/events";
import {
    allPerks,
    backupFromPerk,
    GeneralPerk,
    perkFromBackUp,
} from "../skilltree/perks/perk";
import Bubble from "./bubble";
import Cell from "./cell";
import { radiusToUnits, unitsToRadius } from "./common";
import { distance } from "./entites";
import { SpreadMap } from "./map/map";
import basicMechanics from "./mechanics/basicMechanics";
import bounceMechanics from "./mechanics/bounceMechanics";
import {
    calculateBubbleUnits,
    SpreadGameMechanics,
} from "./mechanics/commonMechanics";
import { conquerCellUtils } from "./mechanics/events/conquerCell";
import { CreateBubbleEvent } from "./mechanics/events/createBubble";
import { defendCellUtils } from "./mechanics/events/defendCell";
import {
    AttachProps,
    Entity,
    NewSpreadGameEvent,
    SpreadGameProps,
    TimedProps,
} from "./mechanics/events/definitions";
import {
    BeforeFightEvent,
    BubbleFightProps,
    bubbleFightUtils,
    CellFightProps,
    cellFightUtils,
} from "./mechanics/events/fight";
import { GrowthEvent, growthUtils } from "./mechanics/events/growth";
import { MoveEvent, moveUtils } from "./mechanics/events/move";
import {
    isRaisableEffect,
    isRaisableEvent,
    RaiseEventProps,
} from "./mechanics/events/raiseEvent";
import {} from "./mechanics/events/reinforceCell";
import { SendUnitsEvent, sendUnitsUtils } from "./mechanics/events/sendUnits";
import {
    startGameCellUtils,
    StartGameEvent,
} from "./mechanics/events/startGame";
import { stolenPerksUtils } from "./mechanics/events/stolenPerk";
import { TimeStepEvent } from "./mechanics/events/timeStep";
import {
    VisualizeBubbleProps,
    visualizeBubbleUtils,
} from "./mechanics/events/visualizeBubbleProps";
import {
    VisualizeCellProps,
    visualizeCellUtils,
} from "./mechanics/events/visualizeCellProps";
import {
    VisualizeGameProps,
    visualizeGameUtils,
} from "./mechanics/events/visualizeGameProps";
import scrapeOffMechanics from "./mechanics/scrapeOffMechanics";
import Player, { dataFromPlayer, playerFromData } from "./player";

const getMechanics = (settings: GameSettings): SpreadGameMechanics => {
    if (settings.mechanics === "basic") {
        return basicMechanics;
    } else if (settings.mechanics === "scrapeoff") {
        return scrapeOffMechanics;
    } else if (settings.mechanics === "bounce") {
        return bounceMechanics;
    } else throw Error("unregistered mechanics");
};

export interface SpreadGameState {
    cells: Cell[];
    bubbles: Bubble[];
    players: Player[];
    timePassed: number;
}

export interface SpreadGameInteraction {
    applyMove: (move: Move) => void;
}

export interface SpreadGameFunctions {
    step: (ms: number) => void;
    toClientGameState: (playerId: number | null) => ClientGameState;
    getReplay: () => SpreadReplay;
}

export type SpreadGame = SpreadGameState &
    SpreadGameFunctions &
    SpreadGameInteraction;

export class SpreadGameImplementation implements SpreadGame {
    map: SpreadMap;
    gameSettings: GameSettings;
    cells: Cell[];
    bubbles: Bubble[];
    players: Player[];
    pastMoves: HistoryEntry<Move>[];
    mechanics: SpreadGameMechanics;
    timePassed: number;
    eventHistory: HistoryEntry<SpreadGameEvent>[];
    perks: GeneralPerk[];
    attachedProps: AttachProps<TimedProps<SpreadGameProps>>[];

    constructor(
        map: SpreadMap,
        gameSettings: GameSettings,
        players: Player[],
        perks?: GeneralPerk[]
    ) {
        //const players = getPlayerIds(map);
        this.gameSettings = gameSettings;
        this.mechanics = getMechanics(gameSettings);
        this.map = map;
        this.cells = map.cells.map((mapCell) => {
            const cell: Cell = {
                id: mapCell.id,
                playerId: mapCell.playerId,
                position: mapCell.position,
                radius: mapCell.radius,
                units: mapCell.units,
            };
            return cell;
        });
        this.bubbles = [];
        this.players = players;
        this.timePassed = 0;
        this.pastMoves = [];
        this.eventHistory = [];
        this.perks = perks === undefined ? allPerks : perks;
        this.attachedProps = [];

        this.triggerStart();
    }

    copy() {
        const rep = this.getReplay();
        const copied = SpreadGameImplementation.fromReplay(rep);
        copied.bubbles = this.bubbles.map((b) => {
            return { ...b };
        });
        copied.cells = this.cells.map((c) => {
            return { ...c };
        });
        copied.attachedProps = this.attachedProps.map((ap) => {
            return { ...ap };
        });
        copied.eventHistory = this.eventHistory.map((ev) => {
            return { ...ev };
        });
        copied.pastMoves = this.pastMoves;
        copied.timePassed = this.timePassed;
        return copied;
    }

    triggerStart() {
        const startEvent: StartGameEvent = {
            type: "StartGame",
        };
        const props = this.handleEvent(startEvent);
        this.cells = this.cells.map((cell) => {
            const attProps = this.fromAttachedProps({
                type: "Cell",
                id: cell.id,
            });
            const startCellProps = startGameCellUtils.collect(
                attProps.concat(props)
            );
            return {
                ...cell,
                units: cell.units + startCellProps.additionalUnits,
            };
        });
    }

    static fromReplay(replay: SpreadReplay) {
        const perks = replay.perks
            .map((data) => perkFromBackUp(data))
            .filter((p): p is GeneralPerk => p !== null);
        const spreadGame = new SpreadGameImplementation(
            replay.map,
            replay.gameSettings,
            replay.players.map(playerFromData),
            perks
        );
        return spreadGame;
    }

    attachProps(props: AttachProps<TimedProps<SpreadGameProps>>[]) {
        const res = props.flatMap((prop) => {
            const existingIndex = this.attachedProps.findIndex(
                (ap) =>
                    ap.perkName === prop.perkName &&
                    ap.props.value.type === prop.props.value.type &&
                    ap.triggerType === prop.triggerType &&
                    ap.entity?.type === prop.entity?.type &&
                    ap.entity?.id === prop.entity?.id
            );
            if (existingIndex >= 0) {
                this.attachedProps[existingIndex] = prop;
                return [];
            } else if (prop.entity !== null) {
                this.attachedProps.push(prop);
                return [];
            } else {
                return [prop.props.value];
            }
        });
        return res;
    }

    // attaches every prop that is supposed to be attached
    // and returns all other props
    handleEvent(event: NewSpreadGameEvent) {
        const props = this.perks.flatMap((perk) => {
            return perk.triggers.flatMap((tr) => {
                if (tr.type === "StartGame" && event.type === "StartGame") {
                    return tr.getValue(event, this);
                } else if (isRaisableEffect(tr) && isRaisableEvent(event)) {
                    if (tr.type === "StolenPerk" && event.type === "StolenPerk")
                        return tr.getValue(event, this);
                    else if (tr.type === "Infect" && event.type === "Infect")
                        return tr.getValue(event, this);
                    else return [];
                } else if (
                    tr.type === "TimeStep" &&
                    event.type === "TimeStep"
                ) {
                    return tr.getValue(event, this);
                } else if (tr.type === "Growth" && event.type === "Growth") {
                    return tr.getValue(event, this);
                } else if (tr.type === "Move" && event.type === "Move") {
                    return tr.getValue(event, this);
                } else if (
                    tr.type === "CapturedCell" &&
                    event.type === "CapturedCell"
                )
                    return tr.getValue(event, this);
                else if (
                    tr.type === "DefendedCell" &&
                    event.type === "DefendedCell"
                )
                    return tr.getValue(event, this);
                else if (
                    tr.type === "ReinforcedCell" &&
                    event.type === "ReinforcedCell"
                )
                    return tr.getValue(event, this);
                else if (tr.type === "SendUnits" && event.type === "SendUnits")
                    return tr.getValue(event, this);
                else if (
                    tr.type === "BeforeFightEvent" &&
                    event.type === "BeforeFightEvent"
                )
                    return tr.getValue(event, this);
                else if (
                    tr.type === "CreateBubble" &&
                    event.type == "CreateBubble"
                ) {
                    return tr.getValue(event, this);
                } else return [];
            });
        });
        const remProps = this.attachProps(props);
        remProps
            .filter(
                (prop): prop is RaiseEventProps => prop.type === "RaiseEvent"
            )
            .map((raiseProp) => this.handleEvent(raiseProp.event));
        if (event.type === "DefendedCell") {
            const fromAttachedProps = this.fromAttachedProps({
                type: "Cell",
                id: event.cellId,
            });
            const defendProps = defendCellUtils.collect(
                fromAttachedProps.concat(remProps)
            );
            const index = this.cells.findIndex((c) => c.id === event.cellId);
            if (index < 0) throw new Error("Cell not found");
            this.cells[index] = {
                ...this.cells[index],
                units: this.cells[index].units + defendProps.additionalUnits,
            };
        } else if (event.type === "CapturedCell") {
            const fromAttachedProps = this.fromAttachedProps({
                type: "Cell",
                id: event.cellId,
            });
            const conquerProps = conquerCellUtils.collect(
                fromAttachedProps.concat(remProps)
            );
            const index = this.cells.findIndex((c) => c.id === event.cellId);
            if (index < 0) throw new Error("Cell not found");
            this.cells[index] = {
                ...this.cells[index],
                units:
                    this.cells[index].units *
                        conquerProps.unitsInPercentToRemain +
                    conquerProps.additionalUnits,
            };
        }
        return remProps;
    }

    runReplay(replay: SpreadReplay, ms: number) {
        const movesToDo = replay.moveHistory.filter(
            (mv) =>
                mv.timestamp >= this.timePassed &&
                mv.timestamp < this.timePassed + ms
        );
        const finalTime = Math.min(this.timePassed + ms, replay.lengthInMs);
        while (this.timePassed < finalTime) {
            movesToDo.forEach((mv) => {
                if (mv.timestamp === this.timePassed) {
                    this.applyMove(mv.data);
                }
            });
            this.step(replay.gameSettings.updateFrequencyInMs);
        }
    }

    getReplay() {
        const rep: SpreadReplay = {
            map: this.map,
            gameSettings: this.gameSettings,
            moveHistory: this.pastMoves,
            players: this.players.map((pl) => dataFromPlayer(pl)),
            lengthInMs: this.timePassed,
            perks: this.perks.map((p) => backupFromPerk(p)),
        };
        return rep;
    }

    applyMove(move: Move) {
        if (move.type === "sendunitsmove") {
            this.sendUnits(
                move.data.playerId,
                move.data.senderIds,
                move.data.receiverId
            );
        }
    }

    run(ms: number, updateFrequencyInMs: number) {
        if (ms <= 0) return;
        else {
            this.step(updateFrequencyInMs);
            this.run(ms - updateFrequencyInMs, updateFrequencyInMs);
        }
    }

    step(ms: number) {
        const stepEvent: TimeStepEvent = {
            type: "TimeStep",
            ms: ms,
        };
        this.handleEvent(stepEvent);
        this.bubbles = this.bubbles.map((bubble) => {
            const moveEvent: MoveEvent = {
                type: "Move",
                bubble: bubble,
            };
            const props = this.handleEvent(moveEvent);
            const moveProps = moveUtils.collect(
                this.fromAttachedProps({
                    type: "Bubble",
                    id: bubble.id,
                }).concat(props)
            );
            return this.mechanics.move(bubble, ms, moveProps);
        });
        this.cells = this.cells.map((cell) => {
            const growthEvent: GrowthEvent = {
                type: "Growth",
                cell: cell,
            };
            const props = this.handleEvent(growthEvent);
            const growthProps = growthUtils.collect(
                this.fromAttachedProps({ type: "Cell", id: cell.id }).concat(
                    props
                )
            );
            return this.mechanics.grow(cell, ms, growthProps);
        });
        this.collideBubblesWithCells();
        this.collideBubblesWithBubbles();
        this.checkForFinishedFights();
        this.timePassed += ms;
    }

    collideBubblesWithBubbles() {
        const fightResults: [BeforeCollisionState, AfterCollisionState][] = [];
        var remainingBubbles: (Bubble | null)[] = [];
        this.bubbles.forEach((bubble) => {
            var currentBubble: Bubble | null = bubble;
            remainingBubbles = remainingBubbles.map((bubble2) => {
                if (
                    currentBubble !== null &&
                    bubble2 !== null &&
                    this.mechanics.collidesWithBubble(bubble2, currentBubble)
                ) {
                    const beforeFight: BeforeCollisionState = {
                        bubble: { ...bubble2 },
                        other: { type: "Bubble", val: { ...currentBubble } },
                    };
                    const beforeEvent: BeforeFightEvent = {
                        type: "BeforeFightEvent",
                        before: beforeFight,
                    };
                    const props = this.handleEvent(beforeEvent);
                    const bubbleFightProps: BubbleFightProps =
                        bubbleFightUtils.collect(
                            this.fromAttachedProps({
                                type: "Bubble",
                                id: currentBubble.id,
                            }).concat(props)
                        );
                    const bubble2FightProps: BubbleFightProps =
                        bubbleFightUtils.collect(
                            this.fromAttachedProps({
                                type: "Bubble",
                                id: bubble2.id,
                            }).concat(props)
                        );

                    const [rem1, rem2] = this.mechanics.collideBubble(
                        bubble2,
                        currentBubble,
                        bubble2FightProps,
                        bubbleFightProps
                    );
                    const afterFight: AfterCollisionState = {
                        bubble: rem1,
                        other: { type: "Bubble", val: rem2 },
                    };
                    fightResults.push([beforeFight, afterFight]);
                    currentBubble = rem2;
                    return rem1;
                } else {
                    return bubble2;
                }
            });
            if (currentBubble != null) {
                remainingBubbles.push(currentBubble);
            }
        });
        this.bubbles = remainingBubbles.filter((b): b is Bubble => b !== null);
        fightResults.forEach(([before, after]) =>
            this.processFight(before, after)
        );
    }
    checkForFinishedFights() {
        this.eventHistory = this.eventHistory.map((ev) => {
            if (ev.data.type === "CollisionEvent" && !ev.data.finished) {
                let returnEvent = { ...ev.data };
                const eventData = ev.data;
                const currentAttacker = this.bubbles.find(
                    (b) => b.id === eventData.before.bubble.id
                );
                const currentDefender =
                    eventData.before.other.type === "Cell"
                        ? this.cells.find(
                              (c) => c.id === eventData.before.other.val.id
                          )
                        : this.bubbles.find(
                              (b) => b.id === eventData.before.other.val.id
                          );
                if (
                    currentAttacker === undefined ||
                    currentDefender === undefined
                ) {
                    // attacker or defender got killed by someone else
                    finishCollisionEvent(returnEvent);
                } else if (
                    latestDistance(eventData) <
                    distance(currentAttacker.position, currentDefender.position)
                ) {
                    // they are moving away from each other
                    finishCollisionEvent(returnEvent);
                }
                return { ...ev, data: returnEvent };
            } else return ev;
        });
    }
    // this either adds a FightEvent or a PartialFightEvent or modifies a PartialFightEvent in the event history
    processFight(before: BeforeCollisionState, after: AfterCollisionState) {
        const eventsToAdd: SpreadGameEvent[] = [];
        let existingPartialCollisionEvent: CollisionEvent | undefined =
            this.eventHistory.find(
                (ev): ev is HistoryEntry<CollisionEvent> =>
                    ev.data.type === "CollisionEvent" &&
                    !ev.data.finished &&
                    ev.data.before.bubble.id === before.bubble.id &&
                    ev.data.before.other.type === before.other.type &&
                    ev.data.before.other.val.id === before.other.val.id
            )?.data;
        if (
            existingPartialCollisionEvent !== undefined &&
            combinedCollisionEvents(
                existingPartialCollisionEvent,
                before,
                after,
                this.timePassed
            )
        ) {
        } else {
            const newEvent = createCollisionEvent(
                before,
                after,
                this.timePassed
            );
            existingPartialCollisionEvent = newEvent;
            eventsToAdd.push(newEvent);
        }

        const newEvents = processFinishedCollisionEvent(
            existingPartialCollisionEvent
        );
        newEvents.forEach((ev) => {
            this.handleEvent(ev);
            eventsToAdd.push(ev);
        });
        const capturedCellEvent: CapturedCellEvent | null =
            getCapturedCellEvent(before, after);
        if (capturedCellEvent !== null) {
            this.handleEvent(capturedCellEvent);
            eventsToAdd.push(capturedCellEvent);
        }

        eventsToAdd.forEach((ev) =>
            this.eventHistory.push({ data: ev, timestamp: this.timePassed })
        );
    }
    collideBubblesWithCells() {
        const fightResults: [BeforeCollisionState, AfterCollisionState][] = [];
        var remainingBubbles: Bubble[] = [];
        this.bubbles.forEach((bubble) => {
            var currentBubble: Bubble | null = bubble;
            this.cells = this.cells.map((cell) => {
                if (
                    currentBubble != null &&
                    (currentBubble.motherId !== cell.id ||
                        currentBubble.playerId !== cell.playerId) &&
                    this.mechanics.collidesWithCell(bubble, cell)
                ) {
                    const beforeFight: BeforeCollisionState = {
                        bubble: { ...currentBubble },
                        other: { type: "Cell", val: { ...cell } },
                    };
                    const beforeEvent: BeforeFightEvent = {
                        type: "BeforeFightEvent",
                        before: beforeFight,
                    };
                    const props = this.handleEvent(beforeEvent);
                    const bubbleFightProps: BubbleFightProps =
                        bubbleFightUtils.collect(
                            this.fromAttachedProps({
                                type: "Bubble",
                                id: currentBubble.id,
                            }).concat(props)
                        );
                    const cellFightProps: CellFightProps =
                        cellFightUtils.collect(
                            this.fromAttachedProps({
                                type: "Cell",
                                id: cell.id,
                            }).concat(props)
                        );
                    let [newCurrentBubble, newCell] =
                        this.mechanics.collideCell(
                            currentBubble,
                            cell,
                            bubbleFightProps,
                            cellFightProps
                        );
                    const afterFight: AfterCollisionState = {
                        bubble:
                            newCurrentBubble !== null
                                ? { ...newCurrentBubble }
                                : null,
                        other: { type: "Cell", val: { ...newCell } },
                    };
                    fightResults.push([beforeFight, afterFight]);

                    //if (cell.playerId === currentBubble.playerId) {
                    //    const reinforceEvent: ReinforceCellEvent = {
                    //        type: "ReinforcedCell",
                    //        before: {
                    //            cell: { ...beforeFight.other.val },
                    //            bubble: { ...beforeFight.bubble },
                    //        },
                    //        after: {
                    //            cell: { ...newCell },
                    //            bubble:
                    //                afterFight.bubble !== null
                    //                    ? { ...afterFight.bubble }
                    //                    : null,
                    //        },
                    //    };
                    //    eventsToProcess.push(reinforceEvent);
                    //} else if (newCell.playerId !== cell.playerId) {
                    //    const conquerEvent: ConquerCellEvent = {
                    //        type: "CapturedCell",
                    //        before: { cell: { ...cell } },
                    //        after: { cell: { ...newCell } },
                    //    };
                    //    eventsToProcess.push(conquerEvent);
                    //} else {
                    //    /* if (newCell.playerId === cell.playerId) { */
                    //    const defendEvent: DefendedCellEvent = {
                    //        type: "DefendedCell",
                    //        before: {
                    //            cell: { ...beforeFight.other.val },
                    //            bubble: { ...beforeFight.bubble },
                    //        },
                    //        after: {
                    //            cell: { ...newCell },
                    //            bubble:
                    //                afterFight.bubble !== null
                    //                    ? { ...afterFight.bubble }
                    //                    : null,
                    //        },
                    //    };
                    //    eventsToProcess.push(defendEvent);
                    //}
                    currentBubble = newCurrentBubble;
                    //if (event !== null) eventsToAdd.push(event);
                    return newCell;
                } else {
                    return cell;
                }
            });
            if (currentBubble != null) {
                remainingBubbles.push(currentBubble);
            }
        });
        this.bubbles = remainingBubbles;
        fightResults.forEach(([before, after]) =>
            this.processFight(before, after)
        );
    }
    fromAttachedProps(entity: Entity) {
        const result = this.attachedProps
            .filter(
                (prop) =>
                    (prop.props.expirationInMs === "Never" ||
                        prop.props.expirationInMs >= this.timePassed) &&
                    prop.entity?.type === entity.type &&
                    prop.entity.id === entity.id
            )
            .map((prop) => prop.props.value);
        return result;
    }
    sendUnits(playerId: number, senderIds: number[], receiverId: number) {
        const eventsToAdd: SpreadGameEvent[] = [];
        const player = this.players.find((p) => p.id == playerId);
        if (player == undefined) return false;
        const targetCell = this.cells.find((c) => c.id == receiverId);
        if (targetCell == undefined) return false;
        const sentIds: number[] = [];
        this.cells = this.cells.map((sender) => {
            if (
                senderIds.some((id) => id === sender.id) &&
                sender.playerId === playerId &&
                sender.id !== receiverId
            ) {
                const event: SendUnitsEvent = {
                    sender: sender,
                    target: targetCell,
                    type: "SendUnits",
                };
                const unsavedProps = this.handleEvent(event);
                const fromAttachedProps = this.fromAttachedProps({
                    type: "Cell",
                    id: sender.id,
                });
                const sendUnitsProps = sendUnitsUtils.collect(
                    fromAttachedProps.concat(unsavedProps)
                );
                const [remCell, bubble] = this.mechanics.sendBubble(
                    sender,
                    targetCell,
                    this.timePassed,
                    sendUnitsProps
                );
                if (bubble !== null) {
                    const createBubbleEvent: CreateBubbleEvent = {
                        sendUnitsEvent: event,
                        after: { bubble: bubble, sender: remCell },
                        type: "CreateBubble",
                    };
                    this.handleEvent(createBubbleEvent);

                    this.bubbles.push(bubble);
                    eventsToAdd.push({
                        type: "SendBubbleEvent",
                        sender: sender,
                        receiver: targetCell,
                    });
                    sentIds.push(sender.id);
                }
                return remCell;
            } else {
                return sender;
            }
        });
        this.pastMoves.push({
            timestamp: this.timePassed,
            data: {
                type: "sendunitsmove",
                data: {
                    receiverId: targetCell.id,
                    senderIds: sentIds,
                    playerId: playerId,
                },
            },
        });
        this.eventHistory = this.eventHistory.concat(
            eventsToAdd.map((ev) => {
                return { timestamp: this.timePassed, data: ev };
            })
        );
    }

    getSkilledPerk(perkName: string, playerId: number | null) {
        const perk = this.getSkilledPerks(playerId).find(
            (p) => p.perk.name === perkName
        );
        return perk !== undefined ? perk : null;
    }

    toClientGameState(playerId: number | null = null) {
        const gameProps: VisualizeGameProps = visualizeGameUtils.collect(
            this.fromAttachedProps({ type: "Game", id: null })
        );
        const gs: ClientGameState = {
            deadlyEnvironment: gameProps.deadlyEnvironment,
            timePassedInMs: this.timePassed,
            cells: this.cells.map((cell) => {
                const entity: Entity = { type: "Cell", id: cell.id };
                const cellProps: VisualizeCellProps =
                    visualizeCellUtils.collect(this.fromAttachedProps(entity));
                const sendUnitsProps = sendUnitsUtils.collect(
                    this.fromAttachedProps(entity)
                );
                const newBubbleRadius = unitsToRadius(
                    calculateBubbleUnits(cell, sendUnitsProps)
                );
                const hideProps =
                    playerId !== null
                        ? cellProps.hideProps.get(playerId)
                        : undefined;
                const cellData: CellData | null =
                    hideProps === undefined || hideProps.showUnits
                        ? {
                              attackerCombatAbilities: cellProps.rageValue,
                              defenderCombatAbilities:
                                  cellProps.combatAbilityModifier,
                              membraneValue: cellProps.membraneAbsorption,
                              units: cell.units,
                              newBubbleRadius: newBubbleRadius,
                              currentUnitsRadius: Math.min(
                                  unitsToRadius(cell.units),
                                  cell.radius
                              ),
                          }
                        : null;
                return {
                    id: cell.id,
                    playerId: cell.playerId,
                    position: cell.position,
                    radius: cell.radius,
                    data: cellData,
                    infected: cellProps.infected,
                };
            }),
            bubbles: this.bubbles.map((bubble) => {
                const bubbleProps: VisualizeBubbleProps =
                    visualizeBubbleUtils.collect(
                        this.fromAttachedProps({
                            type: "Bubble",
                            id: bubble.id,
                        })
                    );
                return {
                    id: bubble.id,
                    playerId: bubble.playerId,
                    attackCombatAbilities: bubbleProps.combatAbilityModifier,
                    position: bubble.position,
                    radius: bubble.radius,
                    units: bubble.units,
                    infected: bubbleProps.infected,
                };
            }),
        };
        return gs;
    }
    getSkilledPerks(playerId: number | null) {
        const pl = this.players.find((pl) => pl.id === playerId);
        if (pl === undefined) return [];
        const stolenPerks = stolenPerksUtils.collect(
            this.fromAttachedProps({ type: "Player", id: pl.id })
        );
        return pl.skills.concat(stolenPerks.skilledPerks);
    }
}
