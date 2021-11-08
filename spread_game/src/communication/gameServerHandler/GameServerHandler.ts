import {
  GameClientMessageData,
  isClientLobbyMessage,
} from "../../messages/inGame/gameClientMessages";
import { GameServerMessage } from "../../messages/inGame/gameServerMessages";
import { ServerCommunication } from "../ServerCommunication";
import { PlayerData } from "./common";
import { InGame } from "./inGame";
import LobbyImplementation, { Lobby } from "./lobby";

export class GameServerHandler {
  state: Lobby | InGame;
  serverCommunication: ServerCommunication<
    GameServerMessage,
    GameClientMessageData
  >;

  constructor() {
    this.serverCommunication = new ServerCommunication(this.onMessageReceive);
    this.state = new LobbyImplementation();
  }

  connectClient(
    token: string,
    playerData: PlayerData,
    sendToClient: (msg: GameServerMessage) => void
  ) {
    this.serverCommunication.connectClient({
      token: token,
      sendToClient: sendToClient,
    });

    if (this.state.type === "lobby") {
      const msgToSend = this.state.onConnect(token, playerData);
      if (msgToSend !== null) {
        this.serverCommunication.sendMessageToClient(msgToSend, token);
        this.updateClients();
      }
    } else if (this.state.type === "ingame") {
      const [updateAll, seatMessage, lobbyStateMessage] = this.state.onConnect(
        token,
        playerData
      );
      if (lobbyStateMessage !== null)
        this.serverCommunication.sendMessageToClient(lobbyStateMessage, token);
      if (seatMessage !== null)
        this.serverCommunication.sendMessageToClient(seatMessage, token);
      if (updateAll) this.updateClients();
    }
  }

  disconnectClient(token: string) {
    this.serverCommunication.disconnectClient(token);
  }

  updateClients() {
    if (this.state.type === "lobby") {
      const msgToAll = this.state.updateClientsMessage();
      this.serverCommunication.sendMessageToClients(msgToAll);
    }
  }

  onMessageReceive(message: GameClientMessageData, token: string) {
    const cl = this.serverCommunication.clients.find(
      (cl) => cl.token === token
    );
    if (cl === undefined) return;
    if (isClientLobbyMessage(message) && this.state.type === "lobby") {
      if (message.type === "startgame") {
        const inGame = this.state.startGame();
        if (inGame !== null) {
          this.state = inGame;
          this.state.startGame((msg) =>
            this.serverCommunication.sendMessageToClients(msg)
          );
          this.updateClients();
        }
      } else {
        const [updateAll, toSender] = this.state.onReceiveMessage(
          token,
          message
        );
        if (toSender !== null) {
          this.serverCommunication.sendMessageToClient(toSender, token);
        }
        if (updateAll) this.updateClients();
      }
    } else if (!isClientLobbyMessage(message) && this.state.type === "ingame") {
      const toSender = this.state.onReceiveMessage(token, message);
      if (toSender !== null)
        this.serverCommunication.sendMessageToClient(toSender, token);
    }
  }
}
