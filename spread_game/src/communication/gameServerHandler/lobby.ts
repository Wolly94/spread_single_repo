import {
    ClientLobbyMessage,
    SkilledPerkData,
} from "../../messages/inGame/clientLobbyMessage";
import {
    ClientAiPlayer,
    ClientHumanPlayer,
    ClientLobbyPlayer,
    ClientLobbyState,
    ClientObserver,
    GameServerMessage,
    GameSettings,
    LobbyStateMessage,
    ServerLobbyMessage,
    SetPlayerIdMessage,
    SkillData,
    SkillTreeData,
} from "../../messages/inGame/gameServerMessages";
import {
    defaultSkillTree,
    SkillTree,
    skillTreeMethods,
} from "../../skilltree/skilltree";
import { getPlayerIds, SpreadMap } from "../../spreadGame/map/map";
import {
    AiPlayer,
    HumanPlayer,
    PlayerData,
    RegisteredToken,
    remainingSeats,
    SeatedPlayer,
} from "./common";
import InGameImplementation, { InGame } from "./inGame";

export interface LobbyState {
    type: "lobby";
    map: SpreadMap | null;
    seatedPlayers: SeatedPlayer[];
    unseatedPlayers: RegisteredToken[];
    gameSettings: GameSettings;
}

interface LobbyFunctions {
    unseatPlayer: (token: string) => void;
    onReceiveMessage: (
        token: string,
        msg: ClientLobbyMessage
    ) => [boolean, GameServerMessage | null];
    //getOpenGame: () => OpenGame;
    onConnect: (
        token: string,
        playerData: PlayerData
    ) => GameServerMessage | null;
    updateClientsMessage: () => LobbyStateMessage;
    startGame: () => InGame | null;
}

export type Lobby = LobbyState & LobbyFunctions;

class LobbyImplementation implements Lobby {
    type: "lobby" = "lobby";
    map: SpreadMap | null;
    gameSettings: GameSettings;
    seatedPlayers: SeatedPlayer[];
    unseatedPlayers: RegisteredToken[];
    skillTree: SkillTree;

    constructor() {
        this.map = null;
        this.gameSettings = { mechanics: "basic", updateFrequencyInMs: 25 };
        this.seatedPlayers = [];
        this.unseatedPlayers = [];
        this.skillTree = defaultSkillTree;
    }

    startGame() {
        if (this.map !== null) {
            // maybe clients were created faster than they could be added to the game
            const inGame = new InGameImplementation(
                this.map,
                this.gameSettings,
                this.seatedPlayers,
                this.skillTree
            );
            return inGame;
        } else return null;
    }

    // returns tuple whose first element determines wether clients need an update,
    // and the second argument only to the sender
    onReceiveMessage(
        token: string,
        message: ClientLobbyMessage
    ): [boolean, ServerLobbyMessage | null] {
        if (message.type === "setmap") {
            const value = message.data;
            const toSender = this.setMap(token, value);
            return [true, toSender];
        } else if (message.type === "takeseat") {
            const playerId = message.data.playerId;
            const newSeatMessage = this.takeSeat(token, playerId);
            return [true, newSeatMessage];
        } else if (message.type === "clearseat") {
            const playerId = message.data.playerId;
            this.clearSeat(token, playerId);
            return [true, null];
        } else if (message.type === "seatai") {
            const playerId = message.data.playerId;
            this.seatAi(token, playerId);
            return [true, null];
        } else if (message.type === "gamesettings") {
            this.gameSettings = message.data;
            return [true, null];
        } else if (message.type === "setskilledperks") {
            this.setSkillTree(token, message.data);
            return [true, null];
        } else if (message.type === "setaiskilledperks") {
            this.setAiSkillTree(
                token,
                message.data.skilledPerkData,
                message.data.playerId
            );
            return [true, null];
        } else {
            return [false, null];
        }
    }

    setAiSkillTree(
        token: string,
        skilledPerkData: SkilledPerkData[],
        playerId: number
    ) {
        const pIndex = this.seatedPlayers.findIndex(
            (sp) => sp.type === "ai" && sp.playerId === playerId
        );
        if (pIndex < 0) return;

        const skilledPerks = skillTreeMethods.toSkilledPerks(skilledPerkData);
        this.seatedPlayers[pIndex].skilledPerks = skilledPerks;
    }

    setSkillTree(token: string, skilledPerkData: SkilledPerkData[]) {
        const pIndex = this.seatedPlayers.findIndex(
            (sp) => sp.type === "human" && sp.token === token
        );
        if (pIndex < 0) return;

        const skilledPerks = skillTreeMethods.toSkilledPerks(skilledPerkData);
        this.seatedPlayers[pIndex].skilledPerks = skilledPerks;
    }

    updateClientsMessage() {
        const clientSkillTree: SkillTreeData = {
            skills: this.skillTree.skills.map(
                (sk): SkillData => {
                    return {
                        name: sk.name,
                        perks: sk.perks.map((p) => {
                            return { name: p.name };
                        }),
                    };
                }
            ),
        };
        // later add list of unseatedPlayers to lobby and inGame to let them also be displayed on website
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
        const observers: ClientObserver[] = this.unseatedPlayers.map((usp) => {
            return { name: usp.playerData.name };
        });
        const state: ClientLobbyState = {
            map: this.map,
            players,
            observers: observers,
            gameSettings: this.gameSettings,
            skillTree: clientSkillTree,
        };
        const msg: LobbyStateMessage = {
            type: "lobbystate",
            data: state,
        };
        return msg;
    }

    clearAiSeat(playerId: number): AiPlayer | null {
        let seatedIndex = this.seatedPlayers.findIndex(
            (sp) => sp.playerId === playerId
        );
        if (seatedIndex >= 0) {
            if (this.seatedPlayers[seatedIndex].type === "ai") {
                const ai = this.seatedPlayers.splice(seatedIndex, 1)[0];
                // to make compiler happy:
                if (ai.type === "ai") return ai;
                else return null;
            }
        }
        return null;
    }

    takeSeat(token: string, playerId: number) {
        const ai = this.clearAiSeat(playerId);

        const seatedIndex = this.seatedPlayers.findIndex(
            (sp) => sp.type === "human" && sp.token === token
        );
        const unseatedIndex = this.unseatedPlayers.findIndex(
            (usp) => usp.token === token
        );
        if (seatedIndex < 0 && unseatedIndex < 0) {
            return null;
        } else if (seatedIndex >= 0) {
            if (ai !== null) {
                ai.playerId = this.seatedPlayers[seatedIndex].playerId;
                this.seatedPlayers[seatedIndex].playerId = playerId;
                this.seatedPlayers.push(ai);
            } else {
                this.seatedPlayers[seatedIndex].playerId = playerId;
            }
        } else if (unseatedIndex >= 0) {
            this.seatedPlayers.push({
                type: "human",
                token: token,
                playerId: playerId,
                playerData: this.unseatedPlayers[unseatedIndex].playerData,
                skilledPerks: [],
            });
        }
        const setPlayerIdMessage: SetPlayerIdMessage = {
            type: "playerid",
            data: {
                playerId: playerId,
            },
        };
        return setPlayerIdMessage;
    }

    clearSeat(token: string, playerId: number) {
        this.clearAiSeat(playerId);
    }

    seatAi(token: string, playerId: number) {
        const seatedIndex = this.seatedPlayers.findIndex(
            (sp) => sp.playerId === playerId
        );
        if (seatedIndex < 0) {
            const ai: AiPlayer = {
                playerId: playerId,
                type: "ai",
                skilledPerks: [],
            };
            this.seatedPlayers.push(ai);
        }
    }

    remainingLobbySeats() {
        if (this.map === null) {
            return [];
        }
        return remainingSeats(this.map, this.seatedPlayers);
    }

    seatPlayer(token: string) {
        const seatedIndex = this.seatedPlayers.findIndex(
            (sp) => sp.type === "human" && sp.token === token
        );
        if (seatedIndex >= 0) return null;
        const unseatedIndex = this.unseatedPlayers.findIndex(
            (usp) => usp.token === token
        );
        if (unseatedIndex < 0) return null;

        const remSeats = this.remainingLobbySeats();
        if (remSeats.length === 0) return null;
        const playerId = remSeats[0];
        const newSeated: SeatedPlayer = {
            type: "human",
            playerId: playerId,
            token: token,
            playerData: this.unseatedPlayers[unseatedIndex].playerData,
            skilledPerks: [],
        };
        this.seatedPlayers.push(newSeated);
        this.unseatedPlayers.splice(unseatedIndex, 1);
        const message: SetPlayerIdMessage = {
            type: "playerid",
            data: {
                playerId: playerId,
            },
        };
        return message;
    }

    unseatPlayer(token: string) {
        const index = this.seatedPlayers.findIndex(
            (sp) => sp.type === "human" && sp.token === token
        );
        if (index >= 0) {
            const sp = this.seatedPlayers[index];
            if (sp.type === "human")
                this.unseatedPlayers.push({
                    token: token,
                    playerData: sp.playerData,
                });
            this.seatedPlayers = this.seatedPlayers.splice(index, 1);
        }
        this.updateClientsMessage();
    }

    onConnect(token: string, playerData: PlayerData) {
        this.unseatedPlayers.push({ token: token, playerData: playerData });
        const seatMessage = this.seatPlayer(token);
        return seatMessage;
    }

    setMap(token: string, map: SpreadMap) {
        this.map = map;
        const currentlySeated = [...this.seatedPlayers];
        this.unseatedPlayers.push(
            ...this.seatedPlayers
                .filter((sp): sp is HumanPlayer => sp.type === "human")
                .map((sp) => {
                    return { playerData: sp.playerData, token: sp.token };
                })
        );
        this.seatedPlayers = [];
        currentlySeated.forEach((sp) => {
            if (sp.type === "human") this.seatPlayer(sp.token);
        });
        const playerIds = getPlayerIds(map);
        const openIds = Array.from(playerIds).filter(
            (pid) => !this.seatedPlayers.some((sp) => sp.playerId === pid)
        );
        let toSenderMessage = null;
        if (openIds.length === playerIds.size) {
            toSenderMessage = this.seatPlayer(token);
        }
        openIds.forEach((pid) => this.seatAi(token, pid));
        return toSenderMessage;
    }
}

export default LobbyImplementation;
