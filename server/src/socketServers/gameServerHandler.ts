import SpreadGameServer from "./GameServer/gameServer";

class AllGameServerHandler {
    gameServers: [number, SpreadGameServer | null][];
    shutdownCallback: (() => void) | null;

    constructor(lowerPortBound: number, upperPortBound: number) {
        this.gameServers = Array.from(
            { length: upperPortBound - lowerPortBound + 1 },
            (_, i) => [lowerPortBound + i, null]
        );
        this.shutdownCallback = null;
    }

    closeClients() {
        this.gameServers
            .map((val) => val[1])
            .filter((gs): gs is SpreadGameServer => gs !== null)
            .forEach((gs) => gs.close());
    }

    setShutdownCallback = (shutdownCallback: () => void) => {
        this.shutdownCallback = shutdownCallback;
    };

    getGameServers = () => {
        const gss = this.gameServers
            .map((val) => val[1])
            .filter((gs): gs is SpreadGameServer => gs !== null);
        return gss;
    };

    createGameServer = () => {
        const index = this.gameServers.findIndex((val) => val[1] === null);
        if (index >= 0) {
            const port = this.gameServers[index][0];
            const gameServer = new SpreadGameServer(port, () =>
                this.shutDown(port)
            );
            gameServer.open();
            this.gameServers[index] = [port, gameServer];
            return gameServer.creationResponse();
        } else return null;
    };

    shutDown = (port: number) => {
        const index = this.gameServers.findIndex((gs) => gs[0] === port);
        if (index >= 0) {
            this.gameServers[index][1]?.shutdown();
            this.gameServers[index][1] = null;
        }

        if (this.shutdownCallback !== null) this.shutdownCallback();
    };
}

export default AllGameServerHandler;
