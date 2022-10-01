const puppeteer = require('puppeteer');
const json2csv = require("json2csv").Parser;
const fs = require("fs");
const collect_data = require("./dataCollect_fb.js");
const custom_function = require("./custom_function");
const login = require('./login');

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

    for (let i = 0; i < cities.length; i++) {

        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: ({ width: 1550, height: 900 }),
            args: minimal_args
        });
        let city = cities[i].split(",")
        let location = city[0];
        let province = city[1];
        let cookie = '';

        console.log(location);

        info = {};
        const page = await browser.newPage();

        page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36");
        try {

            try {
                cookie = await custom_function.read_cookies('./loggin_session/fb_session.json')
            } catch { }
            await page.setDefaultNavigationTimeout(0);

            if (cookie != '') {
                await page.setCookie.apply(page, cookie)
            }
            await page.goto('https://www.facebook.com/marketplace/category/propertyrentals');

            await custom_function.sleep(1500);
            await console.log(await login.check_login_status(page));

            if (await login.check_login_status(page) == false) {
                await login.login(page);
                await custom_function.save_cookies(page, './loggin_session/fb_session.json');
            }
            await custom_function.sleep(3000);
            await custom_function.save_cookies(page, './loggin_session/fb_session.json');

            await page.waitForSelector("div[class='buofh1pr']", { timeout: 3000 })

            console.log("find");
            await custom_function.click_xpath(page, '//span[contains(text(),"Sort by")]');
            await custom_function.sleep(500);
            await custom_function.click_xpath(page, '//span[contains(text(),"Newest first")]');
            await custom_function.sleep(1500);
            await page.click("div[class='buofh1pr']>span")
            console.log("click");

            try {
                await page.waitForSelector('input[aria-label="Enter a city"]');

                let searchInput = await page.$('input[aria-label="Enter a city"]');
                await searchInput.click({ clickCount: 3 });
                await searchInput.press('Backspace');

                await page.type('input[aria-label="Enter a city"]', cities[i], { delay: 50 });
                await console.log('Location Input Complete');
                await page.click('input[aria-label="Enter a city"]');
                await custom_function.sleep(1000);

            } catch {
                await page.waitForSelector('input[aria-label="Enter a town or city"]');
                let searchInput = await page.$('input[aria-label="Enter a town or city"]');
                await searchInput.click({ clickCount: 3 });
                await searchInput.press('Backspace');

                await page.type('input[aria-label="Enter a town or city"]', cities[i], { delay: 50 });
                await console.log('Location Input Complete');
                await page.click('input[aria-label="Enter a town or city"]');
                await custom_function.sleep(1000);
            }


            await page.waitForXPath(`//span[contains(text(),'${location}')]`)
            await custom_function.click_xpath(page, `//span[contains(text(),"City")]/parent::*/preceding-sibling::*/*[contains(text(),'${location}')]`)

            await custom_function.sleep(150);

            await custom_function.click_xpath(page, `//span[contains(text(),"Radius")]/ancestor::div[3]`);
            await custom_function.sleep(500);

            await page.waitForXPath(`//div[@role='option']//span[contains(text(),'2')]`);
            await custom_function.click_xpath(page, `//div[@role='option']//span[contains(text(),'2')]`);

            // const elements_selectLocation = await page.$x(`//span[contains(text(),'${location}')]`);
            // await elements_selectLocation[0].click();

            // const apply_btn = await page.$x("//span[contains(text(), 'Apply')]");

            // await apply_btn[0].click();

            await custom_function.click_xpath(page, "//span[contains(text(), 'Apply')]")

            await custom_function.sleep(1500);

            console.log("complete");


            // await page.type(String.fromCharCode(13));


            await custom_function.sleep(1000);

            let j = 0;
            while (j < 15) {
                // await custom_function.autoScroll(page);
                await page.evaluate(() => {
                    window.scrollBy(0, 3000);
                });
                j++;
                await custom_function.sleep(2000);
            }

            // await page.evaluate( () => {
            //     window.scrollBy(0, 1500);
            //   });

            await custom_function.sleep(500);

            const cookies = await page.cookies();

            await fs.writeFile('canvas-session-fb.json', JSON.stringify(cookies, null, 2), function (err) {
                if (err) throw err;
                console.log('completed write of cookies');
            });

            const hrefs = await Promise.all((await page.$x('//a[@class="oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 nc684nl6 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl gmql0nx0 p8dawk7l"]')).map(async item => await (await item.getProperty('href')).jsonValue()));

            console.log(hrefs);



            let result = [];

            await custom_function.myForEach(hrefs, async (element, index, arr) => {
                let details = {};
                details.Link = await element;

                result.push(details);

            }, hrefs);


            await console.log(result);
            const j2cp = new json2csv();
            const csv = j2cp.parse(result);

            await fs.writeFileSync("./RentalAds_link_Fb.csv", csv, "utf-8");

            await custom_function.sleep(1000);

            await browser.close();


            await collect_data.dataCollect(location, province);


        } catch (e) {
            await browser.close();
            console.log(e.toString());
        }
    }

    await collect_data.save_file();

}

home();
// module.exports = {home};
