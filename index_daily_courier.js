const puppeteer = require('puppeteer');
const collect_data = require("./dataCollect_daily_courier.js");
const save_file = require("./SaveOutput.js");
const custom_function = require("./custom_function");
const minimal_args = [
    '--autoplay-policy=user-gesture-required',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
];


async function home () {
    let details = [];
    let report = [];
    let primary_url = ["http://classifieds.kelownadailycourier.ca/bc/shared-accommodation-north/search?",
        "http://classifieds.kelownadailycourier.ca/bc/apartments-for-rent-south/search?",
        "http://classifieds.kelownadailycourier.ca/bc/suites-for-rent-south/search?"];

    let all_products_link = [];

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: minimal_args
    });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36");

    await custom_function.myForEach(primary_url, async (element, index, arr) => {
        await page.goto(element);
        try {
            await custom_function.sleep(2000);

            try {
                await page.waitForXPath('//div[@class="post-summary-title"]/a');
            } catch {

            }
            let product_links = await custom_function.get_data(page, '//div[@class="post-summary-title"]/a', 'href');

            await custom_function.myForEach(product_links, async (elm, indx, arr) => {
                await all_products_link.push(elm);
            }, product_links)

        } catch (e) {
            await console.log(e);
        }

    }, primary_url)

    details = await collect_data.dataCollect(browser, all_products_link);

    let ads_report = {};
    ads_report.CityName = "Kelowna";
    ads_report.Province = "BC";
    ads_report['DailyCourier'] = await details.length;
    await report.push(ads_report);

    await save_file.save_file(details, report, "DailyCourier");

    await browser.close();
};
home();
// module.exports = {home};