const puppeteer = require('puppeteer');
const collect_data = require("./dataCollect_Kijji.js");
const fs = require("fs");
const save_file = require("./SaveOutput.js");
const next_page_link = require("./collect_page_link_kijiji");
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

    const cookiesString = fs.readFileSync('./loggin_session/login_session_kijiji.json', 'utf8');
    let cookie = JSON.parse(cookiesString);

    var cities = await require("fs").readFileSync("CityList.csv", "utf8");
    cities = await cities.split("\n");
    let details = [];
    let report = [];

    await console.log(cities);

    await custom_function.myForEach(cities, async (element, index, arr) => {

        let city_arr = element.split(",")
        let city = city_arr[0];
        let province = city_arr[1];

        if (province.includes('British Columbia')) {
            province = 'BC'
        }

        primary_url = "https://www.kijiji.ca/"
        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: minimal_args
            //executablePath: '/usr/bin/chromium-browser'
        });

        user_agent = ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"]

        try {

            const page = await browser.newPage();
            // page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36");
            await page.setUserAgent(user_agent[0]);

            await page.goto(primary_url, { waitUntil: 'networkidle2' })


            await custom_function.sleep(500);


            await page.waitForXPath(`//a[contains(text(),'${city}')]`, { timeout: 1500 });
            city_link = await Promise.all((await page.$x(`//a[contains(text(),'${city}')]`)).map(async item => await (await item.getProperty('href')).jsonValue()));

            await page.setCookie.apply(page);
            await page.goto(city_link[0], { waitUntil: 'networkidle2' });

            await custom_function.sleep(600)

            await page.waitForXPath("//button[contains(text(), 'All categories')]");
            await custom_function.click_xpath(page, "//button[contains(text(), 'All categories')]");

            await custom_function.sleep(500);

            await page.waitForXPath("//div[contains(text(), 'Real Estate')]")
            await custom_function.click_xpath(page, "//div[contains(text(), 'Real Estate')]");

            await page.waitForSelector('button[type="submit"]');
            await page.click('button[type="submit"]');

            await custom_function.sleep(600);

            await page.waitForXPath("//div[contains(text(), 'For Rent')]");
            await custom_function.click_xpath(page, "//div[contains(text(), 'For Rent')]");


            await page.waitForSelector("#mainPageContent > div.layout-3.new-real-estate-srp > div:nth-child(1) > div");
            await custom_function.sleep(2000);

            let page_links = await next_page_link.get_next_page_links(page);
            await console.log(page_links);
            let cookies = [];
            let all_hrefs = [];

            cookies = await page.cookies();

            await custom_function.myForEach(page_links, async (page_link, index, arr) => {

                await page.setCookie.apply(page, cookies);
                await page.goto(page_link, { waitUntil: 'networkidle2' });

                let i = 0;
                cookies = await page.cookies();

                console.log("done1")


                while (i < 2) {
                    console.log('start collecting links');
                    let hrefs = [];
                    await custom_function.autoScroll(page);
                    await custom_function.sleep(1000);
                    await page.waitForSelector("#mainPageContent > div.layout-3.new-real-estate-srp > div.col-2.new-real-estate-srp > main > div:nth-child(2) > div.bottom-bar");
                    await console.log("Loading Done");
                    // await page.evaluate(() => window.stop());

                    hrefs = await Promise.all((await page.$x('//a[@class="title "]')).map(async item => await (await item.getProperty('href')).jsonValue()));

                    await console.log(" Link collected");
                    await custom_function.myForEach(hrefs, async (elements, index, arr) => {
                        all_hrefs.push(elements);
                    }, hrefs);

                    next_page = await custom_function.get_data(page, "//a[@title='Next']", 'href')

                    if (next_page.length != 0) {
                        await page.goto(next_page[0]);
                    } else {
                        break;
                    }

                    await console.log("Wait For Navigate");
                    await custom_function.sleep(2500);
                    // await page.waitForNavigation();
                    await i++;
                }

                await custom_function.sleep(1000);

            }, page_links);

            await console.log(all_hrefs.length);

            all_hrefs = await [...new Set(all_hrefs)];

            await console.log(all_hrefs.length);

            let page2 = " ";
            let ads_count = 0;
            let ads_report = {};

            await custom_function.myForEach(all_hrefs, async (elem, index, arr) => {

                try {
                    await custom_function.sleep(1000)

                    page2 = await browser.newPage();
                    await page2.setUserAgent(user_agent[0]);
                    await page2.setDefaultNavigationTimeout(0);
                    await page2.setCookie.apply(page2, cookies);
                    ads_count = ads_count + await collect_data.dataCollect(page2, elem, city, details);

                } catch (e) {

                    console.log("something wrong", e);
                    await page2.close();

                }

            }, all_hrefs);


            ads_report.CityName = city;
            ads_report.Province = province;
            ads_report.Kijji = ads_count;
            await report.push(ads_report);
        } catch (e) {
            console.log(e.toString());

        }
        await browser.close();

    }, cities)

    await save_file.save_file(details, report, "1Kijiji");
    await custom_function.sleep(2000);
    await console.log('complete');
};
home();
// module.exports = {home};