//import puppeteer from "puppeteer";
const puppeteer = require("puppeteer");

describe("App asjkdsad", () => {
    let browser;
    let page;

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
            "//div[@class='elements']/button[contains(., '" + buttonText + "')]"
        );
        expect(button.textContent).toContain(button);

        //await page.waitForSelector(".App-welcome-text");
        //const text = await page.$eval(".App-welcome-text", (e) => e.textContent);
        //expect(text).toContain("Edit src/App.js and save to reload.");
    });

    afterAll(() => browser.close());
});
