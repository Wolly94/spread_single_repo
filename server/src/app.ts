import cors from "cors";
import express from "express";
import { Server } from "http"
import { registerUser } from "./registration/registrationHandler";
import FindGameServer from "./socketServers/findGameServer";
import AllGameServerHandler from "./socketServers/gameServerHandler";
import { baseUrl } from "./socketServers/socketServer";

export interface App {
    close: () => void,
    server: Server
}

export const createAndStartServer = (
    portToListen: number,
    findGameServerPort: number,
    lowerPortForGames: number,
    upperPortForGames: number
): App => {
    if (upperPortForGames - lowerPortForGames < 0)
        throw new Error("Not enough ports given.");

    const allGameServerHandler = new AllGameServerHandler(
        lowerPortForGames,
        upperPortForGames
    );

    const findGameServer = new FindGameServer(
        findGameServerPort,
        allGameServerHandler
    );
    allGameServerHandler.setShutdownCallback(() =>
        findGameServer.updateClients()
    );

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get("/", (req, res) => {
        res.send({ message: "test 2 jenkins" });
    });

    app.post("/create-game", (req, res) => {
        const data = allGameServerHandler.createGameServer();
        if (data === null) res.send({ message: "Couldnt create game server" });
        else res.send(data);
    });

    app.get("/find-game", (req, res) => {
        const data = findGameServer.getUrlResponse();
        res.send(data);
    });

    app.get("/token", (req, res) => {
        const token = registerUser();
        res.send({ token });
    });

    const server = app.listen(portToListen, () => {
        console.log(
            `web api listening on ${baseUrl()}:${portToListen}\n` +
                `find games websocket listening on ${baseUrl()}:${findGameServerPort}\n` +
                `available game ports on ${baseUrl()}:${lowerPortForGames} to ${baseUrl()}:${upperPortForGames}`
        );
    });

    const shutdownFunction = () => {
        findGameServer.close();
        allGameServerHandler.closeClients();
        server.close();
    };

    return {
        close: shutdownFunction,
        server
    };
};
