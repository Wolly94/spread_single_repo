import { GameServerMessage, ServerInGameMessage } from "spread_game/dist/messages/inGame/gameServerMessages";
import SocketServer from "../socketServer";
import ClientMessage from "spread_game/dist/messages/clientMessage";
import { GameClientMessageData } from "spread_game/dist/messages/inGame/gameClientMessages";
import { ClientInGameMessage, SendUnitsMessage } from "spread_game/dist/messages/inGame/clientInGameMessage";
import { ConnectedPlayer } from "../GameServer/ConnectedPlayer";
import { GameServerHandler } from "spread_game/dist/communication/gameServerHandler/GameServerHandler";
import { getPlayerData } from "../../registration/registrationHandler";
import { generate2PlayerMap } from "spread_game/dist/spreadGame/map/mapGenerator";

export class SpreadMatchmakingServer extends SocketServer<
    ServerInGameMessage,
    ClientMessage<ClientInGameMessage>
> {
    connectedPlayers: ConnectedPlayer[];
    gameHandler: GameServerHandler;
    missingPlayers: string[];
    shutdownCallback: () => void;

    constructor(port: number, matchedClients: string[], shutdownCallback: () => void) {
        super(port);
        this.connectedPlayers = [];
        this.shutdownCallback = shutdownCallback;
        this.gameHandler = new GameServerHandler();
        this.missingPlayers = matchedClients;
    }

    onReceiveMessage(client: import("ws"), message: ClientMessage<SendUnitsMessage>, token: string): void {
        this.gameHandler.onMessageReceive(message.data, message.token);
    }

    onConnect(client: import("ws"), token: string): void {
        const playerData = getPlayerData(token);
        if (playerData == null) {
            client.close();
            return;
        }

        const missingIndex = this.missingPlayers.findIndex((mp) => mp === token);
        if (missingIndex < 0){
            client.close();
        } else {
            this.connectedPlayers.push({
                socket: client,
                token,
                playerData,
            })
        }

        if (this.missingPlayers.length === 0) {
            const p0Token = this.connectedPlayers[0].token;
            const p1Token = this.connectedPlayers[1].token;
            const map = generate2PlayerMap(1000);
            this.gameHandler.onMessageReceive({type: "setmap", data: map}, p0Token)
            if (this.connectedPlayers.length !== 2) {
                throw new Error("Matchmaking only supported for 2 players!")
            } else {
                this.gameHandler.onMessageReceive({type: "takeseat", data: {playerId: 0}}, p0Token);
                this.gameHandler.onMessageReceive({type: "takeseat", data: {playerId: 1}}, p1Token);
                this.gameHandler.onMessageReceive({type: "startgame", data: {}}, p0Token);
            }
        }
    }

    onDisconnect(client: import("ws"), token: string): void {
        const index = this.connectedPlayers.findIndex(cp => cp.token === token);
        if (index >= 0) {
            this.connectedPlayers = this.connectedPlayers.splice(index, 1);
            this.missingPlayers.push(token);
            // pause?!
        }
    }

    shutdown() {
        if (this.gameHandler.state.type === "ingame") {
            this.gameHandler.state.stop();
        }
        this.socket.close();
        console.log("shutdown game at port " + this.port.toString());
    }
}