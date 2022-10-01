const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const custom_function = require("./custom_function");
const dataCollect = require("./collect_data_lmpmgmt");
const save_file = require("./SaveOutput.js");

const primary_url = "https://lmpmgmt.ca/";
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

    var cities = await require("fs").readFileSync("CityList.csv", "utf8");
    cities = await cities.split("\n");
    let all_adds_info = [];
    let report = [];

    await custom_function.myForEach(cities, async (element, index, arr) => {

        const all_adds_link = [];
        let city_arr = element.split(",")
        let city = city_arr[0].replace(/\s+/g, '-');
        let province = city_arr[1];

        if (province.includes('British Columbia')) {
            province = 'BC'
        }

        let url = `${primary_url}${city.toLowerCase()}-properties`;
        await console.log(url)
        try {
            await axios.get(url)
                .then(async (response) => {
                    const $ = await cheerio.load(response['data']);
                    const row = 'div[class="our-prop"]>a';
                    await $(row).each((childIdx, childelem) => {
                        all_adds_link.push($(childelem).attr('href'))
                    })

                }
                )

            await console.log(all_adds_link.length);

            let add_details = await dataCollect.dataCollect(all_adds_link,city);
            let ads_report = {};
            await console.log(add_details);
            await console.log(element, add_details.length)

            ads_report.CityName = await city;
            ads_report.Province = province;
            ads_report.lmpmgmt =await add_details.length;
            await report.push(ads_report);

            await custom_function.myForEach(add_details,async(el,indx,arr) =>{
                await all_adds_info.push(el);
            },add_details);
        } catch {

        }


    }, cities)

    await save_file.save_file(all_adds_info, report, "lmpmgmt");

};

home();
// module.exports = {home};