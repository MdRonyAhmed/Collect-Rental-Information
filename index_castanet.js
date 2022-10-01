const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const custom_function = require("./custom_function");
const dataCollect = require("./collect_data_castanet");
const save_file = require("./SaveOutput.js");

const primary_url = "https://classifieds.castanet.net";
let headers = {
    headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:82.0) Gecko/20100101 Firefox/82.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
    },
};

const location_id = [['4', 'Kelowna'], ['56', 'West Kelowna'], ['58', 'Lake Country'], ['55', 'Peachland'], ['49', 'Penticton']];
let report = [];
let all_adds_info = [];

async function home() {

    await custom_function.myForEach(location_id, async (elem, indx, arr) => {

        try {
            let id = elem[0];
            let city_name = elem[1];
            const all_adds_link = [];
            let url = "https://classifieds.castanet.net/search/?rent_ptype=88&rent_location=" + id + "&perpage=50";

            await axios.get(url)
                .then(async (response) => {
                    const $ = await cheerio.load(response['data']);
                    const row = "a[class='prod_container featured']";
                    const row2 = "a[class='prod_container']"
                    await $(row).each((childIdx, childelem) => {
                        all_adds_link.push(primary_url + $(childelem).attr('href'))
                    })

                    await $(row2).each((childIdx, childelem) => {
                        all_adds_link.push(primary_url + $(childelem).attr('href'))
                    })
                }
                )

            let add_details = await dataCollect.dataCollect_castanet(all_adds_link);
            let ads_report = {};
            await console.log(add_details);
            await console.log(city_name, add_details.length)

            ads_report.CityName = await city_name;
            ads_report.Province = "BC";
            ads_report.Castanet = await add_details.length;
            await report.push(ads_report);

            await custom_function.myForEach(add_details, async (el, indx, arr) => {
                await all_adds_info.push(el);
            }, add_details);

        } catch (e) {
            await console.log(e);
        }
    }, location_id)

    await save_file.save_file(all_adds_info, report, "Castanet");

};

home();
// module.exports = {home};