const puppeteer = require('puppeteer');
const collect_data = require("./dataCollect_rentals.js");
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
    let primary_url = "https://rentals.ca/";

    await console.log(cities);

    await custom_function.myForEach(cities, async (element, index, arr) => {

        let city_arr = element.split(",")
        let city = city_arr[0];
        let province = city_arr[1];
        let all_adds_link = [];

        let url = primary_url + city.replace(/\s+/g, '-').toLowerCase() + '?sort=updated';

        if (province.includes('British Columbia')) {
            province = 'BC'
        }
        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: minimal_args
        });
        try {
            const page = await browser.newPage();
            await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36");
            await page.goto(url);

            let adds_link = await custom_function.get_data(page, '//a[@class="listing-card__details-link"]', 'href');

            await custom_function.myForEach(adds_link, async (elem, indx, arr) => {
                await all_adds_link.push(elem);
            }, adds_link)

            let next_page = await custom_function.get_data(page, "//*[contains(text(),'Next')]", 'href');

            if (next_page.length != 0 && !next_page[0].includes('#')) {
                let next_page_url = next_page[0];
                let i = 0;
                while (i < 3) {
                    const browser_new = await puppeteer.launch({
                        headless: true,
                        defaultViewport: null,
                        // args: minimal_args
                    });
                    const page_new = await browser_new.newPage();
                    await page_new.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36");
                    await page_new.goto(next_page_url);
                    await custom_function.sleep(1000);

                    await page_new.waitForXPath('//a[@class="listing-card__details-link"]');

                    let adds_link_new = await custom_function.get_data(page_new, '//a[@class="listing-card__details-link"]', 'href');

                    await custom_function.myForEach(adds_link_new, async (elem, indx, arr) => {
                        await all_adds_link.push(elem);
                    }, adds_link_new)

                    let next_page_new = await custom_function.get_data(page_new, "//*[contains(text(),'Next')]", 'href');
                    await console.log(next_page_new);

                    if (next_page_new.length != 0 && next_page_new[0].includes('#')) {
                        await browser_new.close();
                        break;
                    } else {
                        next_page_url = next_page_new[0];
                    }
                    await custom_function.sleep(1000);
                    await browser_new.close();
                    await i++;
                }
            }

        } catch (e) {
            await console.log(e);
        }

        await console.log(all_adds_link);
        let ads_details_city = await collect_data.data_collect(all_adds_link);
        await custom_function.myForEach(ads_details_city, async (elm, indx, arr) => {
            await details.push(elm);
        }, ads_details_city)


        let ads_report = {};
        ads_report.CityName = city;
        ads_report.Province = province;
        ads_report.Rentals = ads_details_city.length;
        await report.push(ads_report);

        await browser.close();

    }, cities)

    await save_file.save_file(details, report, "Rentals");
    await custom_function.sleep(2000);
    await process.exit();
    
};
home();
// module.exports = {home};