const puppeteer = require('puppeteer');
const json2csv = require("json2csv").Parser;
const fs = require("fs");
const collect_data = require("./dataCollect_associated.js");
const custom_function = require("./custom_function");
const save_file = require("./SaveOutput.js");


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


async function home() {

    var cities = await require("fs").readFileSync("CityList.csv", "utf8");
    cities = await cities.split("\n");
    report = [];
    details = [];

    for (let i = 0; i < cities.length; i++) {

        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: minimal_args
        });
        let city = cities[i].split(",")
        let location = city[0];
        location = location.replace(" ",'-');
        let province = city[1];
        let all_adds_link = [];


        console.log(location);
        info = {};
        const page = await browser.newPage();

        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36");
        try {

            await page.setDefaultNavigationTimeout(0);
            await page.goto('https://associatedpm.ca/residential-property-listings/');
            await custom_function.sleep(1000);

            await page.waitForSelector('div[id="advanced_city"]', { timeout: 3000 })
            await page.click('div[id="advanced_city"]');
            await custom_function.sleep(1500);

            await page.click(`li[data-value="${location.toLowerCase()}"]`);
            await custom_function.sleep(1000);
            let i = 2;
            while (1) {
                let ads_link = await custom_function.get_data(page, '//div[@class="property-unit-information-wrapper"]/h4/a', 'href');
                await ads_link.forEach((link) => {
                    all_adds_link.push(link);
                });

                let next_page = await custom_function.get_data(page, `//a[@data-future="${i}"]`, 'href');
                await console.log(next_page);

                if (next_page.length == 0 || next_page[0] == ' ' || next_page[0] == undefined) {
                    break;
                } else {
                    await page.goto(next_page[0]);
                    await custom_function.sleep(1500);
                }
                await i++;
            }

        } catch (e) {
            console.log("No ads found");
        }

        await console.log(all_adds_link.length);

        let ads_details_city = await collect_data.dataCollect(browser,all_adds_link);
        await custom_function.myForEach(ads_details_city, async (elm, indx, arr) => {
            await details.push(elm);
        }, ads_details_city)


        let ads_report = {};
        ads_report.CityName = city[0];
        ads_report.Province = province;
        ads_report.Associated = ads_details_city.length;
        await report.push(ads_report);

        await browser.close();
    }

    await save_file.save_file(details, report, "Associated");

}

home();
// module.exports = {home};