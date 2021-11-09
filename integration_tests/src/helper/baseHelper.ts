import { Page } from "puppeteer"

export async function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export const clickButton = async (page: Page, buttonText: string): Promise<void> => {
    const [button] = await page.$x(
        "//button[contains(., '" + buttonText + "')]"
    );
    const buttons = await page.$x("//button");
    if (!button) {
        throw new Error("button not found with label: '" + buttonText+"'")
    }
    await button.click();
};