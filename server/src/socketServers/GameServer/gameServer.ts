import ClientMessage from "spread_game/dist/messages/clientMessage";
import { OpenGame } from "spread_game/dist/messages/findGame/findGameServerMessages";
import { GameClientMessageData } from "spread_game/dist/messages/inGame/gameClientMessages";
import { GameServerMessage } from "spread_game/dist/messages/inGame/gameServerMessages";
import {
    PlayerData,
    getPlayerData,
} from "../../registration/registrationHandler";
import SocketServer from "../socketServer";
import WebSocket from "ws";
import { GameServerHandler } from "spread_game/dist/communication/gameServerHandler/GameServerHandler";
import { ConnectedPlayer } from "./ConnectedPlayer";

class SpreadGameServer extends SocketServer<
    GameServerMessage,
    ClientMessage<GameClientMessageData>
> {
    connectedPlayers: ConnectedPlayer[];
    gameHandler: GameServerHandler;
    shutdownCallback: () => void;

    // later allow connecting other players and read data like skills accordingly
    constructor(port: number, shutdownCallback: () => void) {
        super(port);
        this.connectedPlayers = [];
        this.shutdownCallback = shutdownCallback;
        this.gameHandler = new GameServerHandler();
    }

    shutdown() {
        if (this.gameHandler.state.type === "ingame") {
            this.gameHandler.state.stop();
        }
        this.socket.close();
        console.log("shutdown game at port " + this.port.toString());
    }

    sendMessageToClientViaToken(token: string, msg: GameServerMessage) {
        const cp = this.connectedPlayers.find(
            (connPlayer) => connPlayer.token === token
        );
        if (cp !== undefined) {
            this.sendMessageToClient(cp.socket, msg);
        }
    }

    onReceiveMessage(
        client: WebSocket,
        message: ClientMessage<GameClientMessageData>
    ) {
        this.gameHandler.onMessageReceive(message.data, message.token);
    }

    onConnect(client: WebSocket, token: string) {
        const index = this.connectedPlayers.findIndex(
            (cp) => cp.token === token
        );
        let playerData: PlayerData;
        if (index < 0) {
            const pData = getPlayerData(token);
            if (pData === null) return;
            playerData = pData;
            this.connectedPlayers.push({
                playerData,
                token,
                socket: client,
            });
        } else {
            playerData = this.connectedPlayers[index].playerData;
        }
        this.gameHandler.connectClient(token, playerData, (msg) =>
            this.sendMessageToClient(client, msg)
        );
    }

    onDisconnect(client: WebSocket, token: string) {
        // TODO move this to gamehandler
        if (this.gameHandler.state.type === "lobby") {
            this.gameHandler.state.unseatPlayer(token);
        }
        this.gameHandler.disconnectClient(token);
        if (this.socket.clients.size === 0) {
            this.shutdownCallback();
        }
    }

    // data to be displayed on 'open games'-screen
    // TODO rework
    toOpenGame() {
        const url = this.url;
        const running = this.gameHandler.state.type === "ingame";

        let players: number;
        let joinedPlayers: number;
        if (
            this.gameHandler.state.type === "lobby" &&
            this.gameHandler.state.map !== null
        ) {
            const remSeats = 100;
            // const remSeats = this.gameHandler.state.remainingLobbySeats()
            players = this.gameHandler.state.map.players;
            joinedPlayers = players - remSeats;
        } else {
            players = 0;
            joinedPlayers = 0;
        }
        const res: OpenGame = {
            url,
            joinedPlayers,
            players,
            running,
        };
        return res;
    }
}

export default SpreadGameServer;
