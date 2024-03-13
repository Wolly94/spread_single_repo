import { GameServerMessage, ServerInGameMessage } from "spread_game/dist/messages/inGame/gameServerMessages";
import SocketServer from "../socketServer";
import ClientMessage from "spread_game/dist/messages/clientMessage";
import { GameClientMessageData } from "spread_game/dist/messages/inGame/gameClientMessages";
import { ClientInGameMessage, SendUnitsMessage } from "spread_game/dist/messages/inGame/clientInGameMessage";
import { ConnectedPlayer } from "../GameServer/ConnectedPlayer";
import { GameServerHandler } from "spread_game/dist/communication/gameServerHandler/GameServerHandler";
import { getPlayerData } from "../../registration/registrationHandler";

export class SpreadMatchmakingServer extends SocketServer<
    ServerInGameMessage,
    ClientMessage<ClientInGameMessage>
> {
    onReceiveMessage(client: import("ws"), message: ClientMessage<SendUnitsMessage>, token: string): void {
        this.gameHandler.onMessageReceive(message.data, message.token);
    }

    onConnect(client: import("ws"), token: string): void {
        const playerData = getPlayerData(token);
        if (playerData == null) {
            client.close();
            return;
        }

        const missingIndex = this.missingPlayers.findIndex((mp) => mp == token);
        if (missingIndex < 0){
            client.close();
        } else {
            this.connectedPlayers.push({
                socket: client,
                token: token,
                playerData: playerData,
            })
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

    setup() {
        // TODO random map
        //this.gameHandler.onMessageReceive({type: "setmap", })
    }
}