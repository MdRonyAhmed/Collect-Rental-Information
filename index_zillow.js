const puppeteer = require('puppeteer');
const json2csv = require("json2csv").Parser;
const custom_function = require("./custom_function.js");
const collect_data = require("./collect_data_zillow");
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


async function home(){

  primary_url = "https://www.zillow.com/";

  //Read City Name
  var cities = await require("fs").readFileSync("CityList.csv", "utf8");
  cities = await cities.split("\n");

  let all_ads_details = [];
  let report = [];

  for (let j = 0; j < cities.length; j++) {
    let all_ads_link = [];

    try{
      let i = 1;
      let city_arr = cities[j].split(",")
      let city = city_arr[0];
      let provience = city_arr[1];

      if (provience.includes('British Columbia')) {
        provience = 'BC'
      }

      let url = await primary_url + (city.replace(/\s/g , "-")).toLocaleLowerCase() + '-' + provience.toLocaleLowerCase() + '/rentals';

      while (i <= 3) {

        let browser = await puppeteer.launch({
          headless: true,
          defaultViewport: null,
          // args: minimal_args
          // executablePath: '/opt/google/chrome/chrome'
        });

        try {

        console.log(url);
        let page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36");
        await page.goto(url);
        await custom_function.sleep(1000);
        await page.waitForSelector("div[class='list-card-top']");

        await custom_function.autoScroll(page);
        await custom_function.sleep(1000);
        const hrefs = await custom_function.get_data(page, "//div[@class='list-card-top']/a", 'href');
        await custom_function.myForEach(hrefs, async (element, index, arr) => {
            await all_ads_link.push(element)
        }, hrefs)

        let next_page = `Page ${i + 1}`
        let next_page_link = await custom_function.get_data(page, `//a[@title='${next_page}']`, 'href')

        if (next_page_link.length != 0) {
          url = next_page_link[0];
        } else {
          await browser.close();
          break;
        }
        i++;
        await browser.close();

        }catch (e){
          i++;
          await browser.close();
          console.log('Somethign wrong!!!!!!!!     ',e);
        }
      }

      if (all_ads_link.length != 0) {

        await console.log(all_ads_link.length);
        all_ads_link = await [...new Set(all_ads_link)];
        await console.log(all_ads_link.length);
        let ads_count = 0;
        let ads_report = {};

        await custom_function.myForEach(all_ads_link, async (elem, index, arr) => {
          try {
            await custom_function.sleep(1000)
            ads_count = ads_count + await collect_data.data_collect(elem, all_ads_details, city);
          } catch (e) {
            console.log("something wrong", e);
          }

        }, all_ads_link);

        ads_report.CityName = city;
        ads_report.Province = provience;
        ads_report.Zillow = ads_count;
        await report.push(ads_report);
      }
    }
    catch (e){
      console.log('Somethign wrong! ',e);
    }
  }

  await save_file.save_file(all_ads_details, report, "zillow");
  await custom_function.sleep(2000);
 
};
home();
// module.exports = {home};