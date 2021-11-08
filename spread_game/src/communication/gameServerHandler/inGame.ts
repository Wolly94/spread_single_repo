import AiClient from "../../ai/aiClient";
import { GreedyAi } from "../../ai/greedyAi";
import { ClientInGameMessage } from "../../messages/inGame/clientInGameMessage";
import { SkilledPerkData } from "../../messages/inGame/clientLobbyMessage";
import {
    GameSettings,
    GameStateMessage,
    GameServerMessage,
    LobbyStateMessage,
    SetPlayerIdMessage,
    ClientLobbyPlayer,
    ClientAiPlayer,
    ClientHumanPlayer,
    ClientObserver,
    SkillData,
    SkillTreeData,
} from "../../messages/inGame/gameServerMessages";
import { GetReplayMessage } from "../../messages/replay/clientReplayMessages";
import {
    HistoryEntry,
    Move,
    SendUnitsMove,
} from "../../messages/replay/replay";
import { SendReplayMessage } from "../../messages/replay/serverReplayMessages";
import { SkillTree, skillTreeMethods } from "../../skilltree/skilltree";
import { Player, SpreadGameImplementation } from "../../spreadGame";
import { SpreadMap } from "../../spreadGame/map/map";
import { SpreadGame } from "../../spreadGame/spreadGame";
import { SeatedPlayer, AiPlayer, idFromToken, PlayerData } from "./common";

interface InGameState {
    type: "ingame";
    map: SpreadMap;
    gameSettings: GameSettings;
    seatedPlayers: SeatedPlayer[];
    aiClients: AiClient[]; // last reference to these clients, to be deleted when finishing game
    gameState: SpreadGame;
    intervalId: NodeJS.Timeout | null;
}

interface InGameFunctions {
    startGame: (updateCallback: (msg: GameStateMessage) => void) => void;
    stop: () => void;
    onReceiveMessage: (
        token: string,
        message: ClientInGameMessage | GetReplayMessage
    ) => SendReplayMessage | null;
    onConnect: (
        token: string,
        playerData: PlayerData
    ) => [boolean, GameServerMessage | null, LobbyStateMessage | null];
}

export type InGame = InGameState & InGameFunctions;

class InGameImplementation implements InGame {
    type: "ingame" = "ingame";
    map: SpreadMap;
    gameSettings: GameSettings;
    seatedPlayers: SeatedPlayer[];
    aiClients: AiClient[];
    gameState: SpreadGameImplementation;
    intervalId: NodeJS.Timeout | null;
    moveHistory: HistoryEntry<Move>[];
    skillTree: SkillTree;

    constructor(
        map: SpreadMap,
        settings: GameSettings,
        seatedPlayers: SeatedPlayer[],
        skillTree: SkillTree
    ) {
        this.skillTree = skillTree;
        this.intervalId = null;
        this.map = map;
        this.gameSettings = settings;
        const players: Player[] = seatedPlayers.map((sp) => {
            return { id: sp.playerId, skills: sp.skilledPerks };
        });
        const perks = skillTreeMethods.toPerks(skillTree);
        if (settings.mechanics === "basic") {
            this.gameState = new SpreadGameImplementation(
                map,
                settings,
                players,
                perks
            );
        } else if (settings.mechanics === "scrapeoff") {
            this.gameState = new SpreadGameImplementation(
                map,
                settings,
                players,
                perks
            );
        } else if (settings.mechanics === "bounce") {
            this.gameState = new SpreadGameImplementation(
                map,
                settings,
                players,
                perks
            );
        } else throw Error("unregistered mechanics");
        this.moveHistory = [];
        this.seatedPlayers = seatedPlayers;

        this.aiClients = this.seatedPlayers
            .filter((sp): sp is AiPlayer => {
                return sp.type === "ai";
            })
            .map((sp) => {
                const ai = new GreedyAi(settings, map, players, sp.playerId);
                const aiClient = new AiClient(ai);
                return aiClient;
            });
    }

    isRunning() {
        return this.intervalId !== null;
    }

    stop() {
        if (this.intervalId !== null) clearInterval(this.intervalId);
    }

    onConnect(
        token: string,
        playerData: PlayerData
    ): [boolean, GameServerMessage | null, LobbyStateMessage | null] {
        let updateAll = false;
        let toSender: GameServerMessage | null = null;
        const index = this.seatedPlayers.findIndex(
            (sp) => sp.type === "human" && sp.token === token
        );
        if (index < 0) {
            updateAll = false;
        } else {
            updateAll = true;
            const playerIdMessage: SetPlayerIdMessage = {
                type: "playerid",
                data: {
                    playerId:
                        index >= 0 ? this.seatedPlayers[index].playerId : null,
                },
            };
            toSender = playerIdMessage;
        }

        const clientSkillTree: SkillTreeData = {
            skills: this.skillTree.skills.map((sk): SkillData => {
                return {
                    name: sk.name,
                    perks: sk.perks.map((p) => {
                        return { name: p.name };
                    }),
                };
            }),
        };
        const players: ClientLobbyPlayer[] = this.seatedPlayers.map((sp) => {
            const skilledPerks = skillTreeMethods.toSkilledPerkData(
                sp.skilledPerks
            );
            if (sp.type === "ai") {
                const aip: ClientAiPlayer = {
                    type: "ai",
                    playerId: sp.playerId,
                    skilledPerks: skilledPerks,
                };
                return aip;
            } else {
                const clp: ClientHumanPlayer = {
                    type: "human",
                    name: sp.playerData.name,
                    playerId: sp.playerId,
                    skilledPerks: skilledPerks,
                };
                return clp;
            }
        });
        const observers: ClientObserver[] = [];
        const lobbyStateMessage: LobbyStateMessage = {
            type: "lobbystate",
            data: {
                skillTree: clientSkillTree,
                map: this.map,
                players: players,
                observers: observers,
                gameSettings: this.gameSettings,
            },
        };
        return [updateAll, toSender, lobbyStateMessage];
    }

    onReceiveMessage(
        token: string,
        message: ClientInGameMessage | GetReplayMessage
    ): SendReplayMessage | null {
        if (message.type === "sendunits" && this.isRunning()) {
            const playerId = idFromToken(token, this.seatedPlayers);
            if (playerId != null) {
                const value = message.data;
                const move: SendUnitsMove = {
                    type: "sendunitsmove",
                    data: {
                        playerId: playerId,
                        senderIds: value.senderIds,
                        receiverId: value.receiverId,
                    },
                };
                this.gameState.applyMove(move);
                console.log("message received and attack sent: " + message);
            }
            return null;
        } else if (message.type === "getreplay") {
            const rep = this.gameState.getReplay();
            const mess: SendReplayMessage = {
                type: "sendreplay",
                data: rep,
            };
            return mess;
        } else return null;
    }

    startGame(
        updateCallback: (msg: GameStateMessage, playerId: number | null) => void
    ) {
        const ms = this.gameSettings.updateFrequencyInMs;
        this.intervalId = setInterval(() => {
            if (this.gameState !== null) {
                this.gameState.step(ms);
                this.gameState.players.forEach((pl) => {
                    const message = this.getGameStateMessage(pl.id);
                    updateCallback(message, pl.id);
                });
                this.applyAiMoves();
            }
        }, ms);
    }

    applyAiMoves() {
        //const data = this.gameState.toClientGameState(null);
        this.aiClients.forEach((aiCl) => {
            const copied = this.gameState.copy();
            const move = aiCl.getMove(copied);
            if (move != null) {
                this.gameState.applyMove(move);
            }
        });
    }

    getGameStateMessage(playerId: number | null): GameStateMessage {
        const data = this.gameState.toClientGameState(playerId);
        const message: GameStateMessage = {
            type: "gamestate",
            data: data,
        };
        return message;
    }
}

export default InGameImplementation;
