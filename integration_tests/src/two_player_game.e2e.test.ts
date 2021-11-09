import Puppeteer from "puppeteer";
import { delay } from "./helper/baseHelper";
import {
    clickButtonDisconnect,
    clickButtonDownloadReplay,
    clickButtonSelectMap,
    clickButtonStartGame,
} from "./helper/lobbyHelper";
import { getLatestUrl } from "./helper/pageHelper";
import { baseClientUrl, clickButtonPlayAi } from "./helper/rootHelper";

import puppeteer from "puppeteer";

describe("two players", () => {
    let browser: Puppeteer.Browser;
    let page: Puppeteer.Page;
    let page2: Puppeteer.Page;

    const baseUrl = baseClientUrl();

    beforeAll(async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        page2 = await browser.newPage();
    });

    it("play ai", async () => {
        await page.goto(baseUrl);
        await page2.goto(baseUrl); // but with differen port!

        // TODO implement rest
    });

    afterAll(() => {
        browser.close();
    });
});
