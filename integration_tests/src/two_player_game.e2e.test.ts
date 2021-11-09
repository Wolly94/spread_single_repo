import Puppeteer from "puppeteer";
import { delay } from "./helper/baseHelper";
import {
    clickButtonDisconnect,
    clickButtonDownloadReplay,
    clickButtonSelectMap,
    clickButtonStartGame,
} from "./helper/lobbyHelper";
import { getLatestUrl } from "./helper/pageHelper";
import { clickButtonPlayAi } from "./helper/rootHelper";

const puppeteer = require("puppeteer");

describe("App asjkdsad", () => {
    let browser: Puppeteer.Browser;
    let page: Puppeteer.Page;

    const baseUrl = "http://localhost:3000/";

    beforeAll(async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
    });

    it("play ai", async () => {
        await page.goto(baseUrl);

        await clickButtonPlayAi(page);
        expect(await getLatestUrl(browser)).not.toBe(baseUrl);

        await clickButtonSelectMap(page);
        await clickButtonStartGame(page);
        await delay(100); // wait until rendered
        await clickButtonDownloadReplay(page);
        await clickButtonDisconnect(page);

        expect(await getLatestUrl(browser)).toBe(baseUrl);
    });

    afterAll(() => browser.close());
});
