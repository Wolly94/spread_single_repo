import { Page } from "puppeteer";
import { clickButton } from "./baseHelper";

export const clickButtonSelectMap = async (page: Page): Promise<void> =>
    clickButton(page, "Select Map");

export const clickButtonStartGame = async (page: Page): Promise<void> =>
    clickButton(page, "Start Game");

export const clickButtonDownloadReplay = async (page: Page): Promise<void> =>
    clickButton(page, "Download Replay");

export const clickButtonDisconnect = async (page: Page): Promise<void> =>
    clickButton(page, "Disconnect");
