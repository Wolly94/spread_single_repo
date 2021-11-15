module.exports = {
    launch: {
        dumpio: true,
        product: "chrome",
        ignoreHTTPSErrors: true,
        //executablePath: "/usr/bin/chromium-browser",
        args: [
            "--headless",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
        ],
    },
    browserContext: "default",
};
