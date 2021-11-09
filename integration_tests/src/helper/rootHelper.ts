import { Page } from "puppeteer";
import { clickButton } from "./baseHelper"

export const clickButtonPlayAi = async (page: Page): Promise<void> => 
    clickButton(page, "Play against AI");