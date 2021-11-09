import Puppeteer from "puppeteer";
import { getLatestPage } from "./helper/pageHelper";

const puppeteer = require("puppeteer");

describe("App asjkdsad", () => {
    let browser: Puppeteer.Browser;
    let page: Puppeteer.Page;

    beforeAll(async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
    });

    it("contains buttons", async () => {
        await page.goto("http://localhost:3000");
        //await page.evaluate(() => {
        //    [...document.querySelectorAll('.elements button')]
        //        .find(element => element.textContent === 'Play against AI').click();
        //});
        const buttonText = "Play against AI";
        const [button] = await page.$x(
            "//button[contains(., '" + buttonText + "')]"
        );

        await button.click();
        var json = await button.getProperties();

        var currentPage = await getLatestPage(browser);
        var x = await currentPage.content();
        var y = 10;
        //expect(button.textContent).toContain(buttonText);

        //await page.waitForSelector(".App-welcome-text");
        //const text = await page.$eval(".App-welcome-text", (e) => e.textContent);
        //expect(text).toContain("Edit src/App.js and save to reload.");
    });

    afterAll(() => browser.close());
});
