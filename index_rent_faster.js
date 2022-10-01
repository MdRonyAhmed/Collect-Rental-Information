const puppeteer = require('puppeteer');
const collect_data = require("./collect_data_rent_faster.js");
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


async function home(){

    var cities = await require("fs").readFileSync("CityList.csv", "utf8");
    cities = await cities.split("\n");
    let details = [];
    let report = [];
    let primary_url = "https://www.rentfaster.ca/bc/";

    await console.log(cities);

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1300, height: 948 },
        args: minimal_args
    });

    await custom_function.myForEach(cities, async (element, index, arr) => {

        let city_arr = element.split(",")
        let city = city_arr[0];
        let province = city_arr[1];
        let all_adds = [];


        let url = primary_url + city.replace(/\s+/g, '-').toLowerCase() + '/rentals/';
        if (province.includes('British Columbia')) {
            province = 'BC'
        }

        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36");
        page.goto(url);
        await custom_function.sleep(10000);
        await page.evaluate(() => window.stop());

        try {
            await custom_function.sleep(560);
            
            // await page.click('div[class="listing-preview-wrap ng-scope"]');
            let adds_length = await custom_function.get_data(page, '//*[@class="image"]');
            await console.log(adds_length.length);


            await custom_function.myForEach(adds_length, async (elem, indx, arr) => {

                await page.waitForXPath(`//div[@class="listing-preview-wrap ng-scope"][${indx + 1}]`);
                await custom_function.click_xpath(page, `//div[@class="listing-preview-wrap ng-scope"][${indx + 1}]`);

                let ads_details = await collect_data.dataCollect(page,city);
                await all_adds.push(ads_details);

                await page.goBack();
                await custom_function.sleep(1500);
            }, adds_length)

        } catch (e) {
            await console.log(e);
        }

        await console.log(all_adds);
        await custom_function.myForEach(all_adds, async (elm, indx, arr) => {
            await details.push(elm);
        }, all_adds)


        let ads_report = {};
        ads_report.CityName = city;
        ads_report.Province = province;
        ads_report.RentFaster = all_adds.length;
        await report.push(ads_report);

        await custom_function.sleep(5000);
        await page.close();

    }, cities)

    await save_file.save_file(details, report, "RentFaster");
    await custom_function.sleep(2000);
    await browser.close();
};
home();
// module.exports = {home};
