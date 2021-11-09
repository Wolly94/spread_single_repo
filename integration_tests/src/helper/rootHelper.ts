import { exec, execSync } from "child_process";

import { Page } from "puppeteer";
import { clickButton } from "./baseHelper";

export const clickButtonPlayAi = async (page: Page): Promise<void> =>
    clickButton(page, "Play against AI");

export const baseClientUrl = () =>
    (process.env.CLIENT_BASE_URL || "") +
    ":" +
    (process.env.CLIENT_PORT || "") +
    "/";
