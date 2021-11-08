import UrlResponse from "spread_game/dist/messages/general/urlResponse";
import WebSocket from "ws";

export const baseUrl = () => {
    return process.env.BASE_URL;
}

export const baseWebsocketUrl = () => {
    return "ws://"+baseUrl();
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === "development") {
        return "ws://localhost";
    } else if (nodeEnv === "production") {
        return "ws://3.128.245.168";
    } else {
        return "ws://localhost";
    }
};

abstract class SocketServer<TSenderMessage, TReceiverMessage> {
    socket: WebSocket.Server;
    url: string;
    port: number;
    tokenClients: Map<string, WebSocket>;

    // later allow connecting other players and read data like skills accordingly
    constructor(port: number) {
        // const port = nextPort()
        this.socket = new WebSocket.Server({ port });
        this.url = baseWebsocketUrl() + ":" + port.toString() + "/";
        this.tokenClients = new Map();
        this.port = port;
    }

    // socket now accepts connections from clients
    open() {
        this.socket.on("connection", (socketClient, req) => {
            const token = req.url?.replace("/?token=", "");
            if (token !== undefined) {
                if (this.tokenClients.has(token)) {
                    const cli = this.tokenClients.get(token);
                    if (cli !== undefined) {
                        cli.close();
                    }
                    this.tokenClients.set(token, socketClient);
                }
                this.onConnect(socketClient, token);
                console.log("connected with url: ", req.url);
                console.log("client Set length: ", this.socket.clients.size);
                // gets fired when server receives message from client
                socketClient.on("message", (message) => {
                    const m: TReceiverMessage = JSON.parse(
                        message.valueOf().toString()
                    );
                    this.onReceiveMessage(socketClient, m, token);
                });
                // gets fired on close
                socketClient.on("close", () => {
                    this.onDisconnect(socketClient, token);
                    this.tokenClients.delete(token);
                    console.log("closed");
                    console.log(
                        "Number of clients: ",
                        this.socket.clients.size
                    );
                });
            } else {
                socketClient.close();
            }
        });
    }

    sendMessageToClients(message: TSenderMessage) {
        const json = JSON.stringify(message);
        this.socket.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(json);
            }
        });
    }

    sendMessageToClient(client: WebSocket, message: TSenderMessage) {
        const json = JSON.stringify(message);
        if (client.readyState === WebSocket.OPEN) {
            client.send(json);
        }
    }

    abstract onReceiveMessage(
        client: WebSocket,
        message: TReceiverMessage,
        token: string
    ): void;

    abstract onConnect(client: WebSocket, token: string): void;

    abstract onDisconnect(client: WebSocket, token: string): void;

    creationResponse() {
        const resp: UrlResponse = {
            url: this.url,
        };
        return resp;
    }
}

export default SocketServer;
