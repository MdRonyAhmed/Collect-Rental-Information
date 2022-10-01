const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const custom_function = require("./custom_function");
const dataCollect = require("./dataCollect_usedvictoria.js");
const save_file = require("./SaveOutput.js");

const primary_url = "https://www.usedvictoria.com";
let headers = {
    headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:82.0) Gecko/20100101 Firefox/82.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        "property-categories": "apartment,condo,house,room"
    },
};

async function home() {

    let all_adds_link = [];
    let report = [];

    for (let i = 1; i <= 2; i++) {
        let url = primary_url + '/apartment-rentals?page=1';
        await axios.get(url, headers)
            .then(async (response) => {
                const $ = await cheerio.load(response['data']);
                const row = 'a[class="ad-list-item-link col h6 text-regular"]';
                await $(row).each((childIdx, childelem) => {
                    all_adds_link.push(primary_url + $(childelem).attr('href'));
                })
            }
            )
    }

    await console.log(all_adds_link.length);

    let add_details = await dataCollect.dataCollect(all_adds_link, "Victoria");
    let ads_report = {};
    await console.log(add_details.length);

    ads_report.CityName = "Victoria";
    ads_report.Province = "BC";
    ads_report.usedvictoria = await add_details.length;
    await report.push(ads_report);

    await save_file.save_file(add_details, report, "usedvictoria");

};
home();
// module.exports = {home};