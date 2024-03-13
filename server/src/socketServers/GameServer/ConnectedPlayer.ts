import WebSocket from "ws";
import { PlayerData } from "../../registration/registrationHandler";

export interface ConnectedPlayer {
    token: string;
    socket: WebSocket;
    playerData: PlayerData;
}
