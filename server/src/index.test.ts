import UrlResponse from "spread_game/dist/messages/general/urlResponse";
import request from "supertest";
import { createAndStartServer, App } from "./app";

describe("parameters for creating app", () => {
    let app: App;

    afterEach(() => {
        if (app !== undefined) app.close();
    });

    test("too few ports should throw on creation", () => {
        let didThrow = false;
        try {
            app = createAndStartServer(8000, 8001, 8002, 8001);
        } catch {
            didThrow = true;
        }

        expect(didThrow).toBe(true);
    });

    test("successfully runs on enough ports", async () => {
        const availableGamePorts = 2;
        app = createAndStartServer(
            8000,
            8001,
            8002,
            8002 + availableGamePorts - 1
        );
        const response = await request(app.server)
            .post("/create-game")
            .send({});
        const responseBody: UrlResponse = response.body;

        expect(response.statusCode).toBe(200);
        expect(responseBody.url).toBe("ws://localhost:8002/");
    });

    test("more games than game ports", async () => {
        app = createAndStartServer(8000, 8001, 8002, 8003);
        const response1 = await request(app.server)
            .post("/create-game")
            .send({});
        const response2 = await request(app.server)
            .post("/create-game")
            .send({});
        const response3 = await request(app.server)
            .post("/create-game")
            .send({});

        expect(response1.statusCode).toBe(200);
        expect(response2.statusCode).toBe(200);
        expect(response3.statusCode).toBe(400);
    });
});
