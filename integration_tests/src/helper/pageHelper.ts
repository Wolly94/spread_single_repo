import puppeteer from "puppeteer";

export const getLatestPage = async (
    browser: puppeteer.Browser
): Promise<puppeteer.Page> => {
    const pages = await browser.pages();
    if (pages.length === 0) throw new Error("No pages found!");

    const result = pages[pages.length - 1];
    return result;
};

export const getLatestUrl = async (
    browser: puppeteer.Browser
): Promise<string> => {
    const page = await getLatestPage(browser);
    return page.url();
};
