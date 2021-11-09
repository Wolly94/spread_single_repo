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

export const runClient = () => {
    return execSync("./client/run_client.sh " + process.env.CLIENT_PORT?.toString());
}
        //(error, stdout, stderr) => {
        //    if (error) {
        //        console.log(`error: ${error.message}`);
        //        return;
        //    }
        //    if (stderr) {
        //        console.log(`stderr: ${stderr}`);
        //        return;
        //    }
        //    console.log(`stdout: ${stdout}`);
        //}
