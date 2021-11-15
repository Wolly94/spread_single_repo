import Puppeteer from "puppeteer";
import { delay } from "./helper/baseHelper";
import {
    clickButtonDisconnect,
    clickButtonDownloadReplay,
    clickButtonSelectMap,
    clickButtonStartGame,
} from "./helper/lobbyHelper";
import { getLatestUrl } from "./helper/pageHelper";
import {
    baseClientUrl,
    clickButtonPlayAi,
    waitForFirstPage,
    launchPuppeteer,
} from "./helper/rootHelper";

describe("single player", () => {
    let browser: Puppeteer.Browser;
    let page: Puppeteer.Page;

    const baseUrl = baseClientUrl();

    beforeAll(async () => {
        browser = await launchPuppeteer();
        page = await browser.newPage();
    });

    it("play ai", async () => {
        await waitForFirstPage(page, baseUrl);

        await clickButtonPlayAi(page);
        expect(await getLatestUrl(browser)).not.toBe(baseUrl);

        await clickButtonSelectMap(page);
        await clickButtonStartGame(page);
        await delay(100); // wait until rendered
        await clickButtonDownloadReplay(page);
        await clickButtonDisconnect(page);

        //expect(await getLatestUrl(browser)).toBe(baseUrl);
    });

    afterAll(() => {
        browser.close();
    });
});
