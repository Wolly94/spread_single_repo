import puppeteer from "puppeteer";

import { Page } from "puppeteer";
import { clickButton } from "./baseHelper";

export const clickButtonPlayAi = async (page: Page): Promise<void> =>
    clickButton(page, "Play against AI");

export const baseClientUrl = () =>
    "http://" +
    (process.env.CLIENT_BASE_URL || "") +
    ":" +
    (process.env.CLIENT_PORT || "") +
    "/";

export const launchPuppeteer = async () => {
    const browser = await puppeteer.launch({
        args: [
            "--headless",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
        ],
    });
    return browser;
};

export const waitForFirstPage = async (page: Page, url: string) => {
    return await page.goto(url, { waitUntil: "networkidle0" });
};
