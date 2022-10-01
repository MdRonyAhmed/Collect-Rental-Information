const puppeteer = require('puppeteer');
const json2csv = require("json2csv").Parser;
const fs = require("fs");
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
        let ads_details_city = [];
        let url = "https://www.propertymanagementkelowna.com/available-properties/?location="
        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: minimal_args,
        });
        let city = cities[i].split(",")
        let location = city[0];
        let province = city[1];
        let ads_url = [];
        const page = await browser.newPage();

        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36");
        try {
            url = url + location
            await page.setDefaultNavigationTimeout(0);
            await page.goto(url);
            // await page.waitForNetworkIdle();
            // await custom_function.sleep(5000)
            // await page.waitForSelector('div[class="list_item"]', { timeout: 3000 });


            let title_arr = [];
            let no_match = [];
            while (1) {
                title_arr = await custom_function.get_data(page, '//div[@class="card-property-title"]');
                let no_match = await custom_function.get_data(page, "//*[contains(text(),'No match')]");

                if (title_arr.length != 0 || no_match.length != 0) {
                    break;
                }
                await custom_function.sleep(800);
            }

            if (no_match.length != 0) {
                await browser.close();
                continue;
            }

            let address_arr = await custom_function.get_data(page, '//div[@class="card-property-address card-property-address-top"]');
            let price_arr = await custom_function.get_data(page, '//span[@class="card-property-price"]/span');
            let bed_arr = await custom_function.get_data(page, "//span[contains(text(),'bd')]/span");
            let bath_arr = await custom_function.get_data(page, "//span[contains(text(),'ba')]/span");
            let available_date_arr = await custom_function.get_data(page, '//div[@class="card-property-date"]');
            let description_arr = await custom_function.get_data(page, '//p[@class="card-property-description"]');
            let house_size_arr = await custom_function.get_data(page, '//div[@class="card-property-area"]');

            for (let i = 0; i < title_arr.length; i++) {
                try {

                    if (price_arr[i] == '' || price_arr[i] == ' ' || price_arr[i] == undefined) {
                        price_arr[i] = '$0';
                    }

                    if (await custom_function.add_check_price(price_arr[i]) == false) {
                        let info = {};

                        await page.waitForSelector(`div[class="list_item"]:nth-child(${i + 1})`)
                        await page.click(`div[class="list_item"]:nth-child(${i + 1})`);
                        await console.log('Clicked On Add');
                        await custom_function.sleep(1000);
                        await ads_url.push(page.url());
                        let dwelling_type = '';
                        let pet = '';
                        let smoking = '';
                        let backgroundImage = '';

                        try {
                            dwelling_type = await custom_function.get_data(page, "//*[text()='Building Type']/following-sibling::dd[1]");
                        } catch {

                        };
                        try {
                            smoking = await custom_function.get_data(page, "//*[text()='Smoking']/following-sibling::dd[1]");
                        } catch {

                        };
                        try {
                            pet = await custom_function.get_data(page, "//*[text()='Pets']/following-sibling::dd[1]");
                        } catch {
                            pet = ['No']
                        };

                        try {
                            backgroundImage = await page.evaluate(el => window.getComputedStyle(el).backgroundImage, await page.$('div.property-gallery-main > div > div'));
                            backgroundImage = backgroundImage.split('"')
                            backgroundImage = backgroundImage[1];
                        } catch (e) {
                            await console.log(e);
                        };

                        if (dwelling_type[0].includes('Apartment')) {
                            dwelling_type[0] = 'Apartment';
                        } else if (dwelling_type[0] == 'Condos') {
                            dwelling_type[0] = 'Condo';
                        } else if (dwelling_type[0] == 'Houses') {
                            dwelling_type[0] = 'House';
                        } else if (dwelling_type[0] == 'Room') {
                            dwelling_type[0] = 'Shared';
                        } else if (dwelling_type[0] == 'Townhome') {
                            dwelling_type[0] = 'Townhouse';
                        } else if (dwelling_type[0].includes('Duplex')) {
                            dwelling_type[0] = 'Duplex';
                        } else if (dwelling_type[0] == 'Townhouses') {
                            dwelling_type[0] = 'Townhouse';
                        } else if (dwelling_type[0] == 'Partial House Lower Suite') {
                            dwelling_type[0] = 'Suite';
                        } else if (dwelling_type[0] == 'Upper') {
                            dwelling_type[0] = 'Main Floor'
                        } else if (dwelling_type[0] == 'Lower') {
                            dwelling_type[0] = 'Suite'
                        } else if (dwelling_type[0] == '' || dwelling_type[0] == ' ' || dwelling_type[0] == undefined) {
                            dwelling_type[0] = 'Suite'
                        }

                        if (bed_arr[i] == '' || bed_arr[i] == ' ' || bed_arr[i] == undefined || bed_arr[i] == 'NaN' || bed_arr[i] == 'none' || bed_arr[i] == 0 || bed_arr[i] == '0') {
                            bed_arr[i] = 'Bachelor';
                        }
                        if (bath_arr[i] == '' || bath_arr[i] == ' ' || bath_arr[i] == undefined || bath_arr[i] == 'NaN') {
                            bath_arr[i] = 1;
                        }

                        if(parseInt(price_arr[i].replace(/[^\d.-]/g,'')) <= 1000  && dwelling_type[0] == "House" ){
                            dwelling_type[0] = "Shared";
                        }else if(parseInt(price_arr[i].replace(/[^\d.-]/g,'')) <= 2000  && dwelling_type[0] == "House" ){
                            dwelling_type[0] = "Suite";
                        }

                        info.Add_link = page.url();
                        info.Title = title_arr[i];
                        info.Address = await custom_function.remove_duplicate(address_arr[i]);
                        info.Price = price_arr[i].replace('$','');
                        info.Dwelling_Type = dwelling_type[0];
                        info.Bedrooms = bed_arr[i];
                        info.Bathrooms = bath_arr[i];
                        info.Pet_Friendly = pet[0];
                        info.Furnished = "No";
                        info.Smoking_Permitted = smoking[0];
                        info.Date_Available = available_date_arr[i];
                        info.House_Size = house_size_arr[i];
                        info.Description = description_arr[i];
                        info[`More Info1`] = "Please contact the Landlord to confirm availability";
                        info[`Picture 1`] = backgroundImage;
                        info.city = location;

                        await console.log(info);
                        await ads_details_city.push(info);
                        await page.goto(url);
                    }
                } catch (e) {
                    console.log(e);
                }
                await custom_function.sleep(1500);
            }

        } catch (e) {
            console.log("No ads found");
        }

        await console.log(ads_details_city.length);
        await custom_function.myForEach(ads_details_city, async (elm, indx, arr) => {
            await details.push(elm);
        }, ads_details_city)


        let ads_report = {};
        ads_report.CityName = location;
        ads_report.Province = province;
        ads_report.Vantage_West = ads_details_city.length;
        await report.push(ads_report);

        await browser.close();
    }

    await save_file.save_file(details, report, "Vantage_West");

}

home();
// module.exports = {home};