const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const custom_function = require("./custom_function");
const dataCollect = require("./collect_data_Real_Property_management.js");
const save_file = require("./SaveOutput.js");

const primary_url = "http://www.rpmexecutives.ca/listing-grid/?orderBy=createDate&sortOrder=DESC&minPrice=500&maxPrice=10000&location=";
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

async function home(){

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

        let url = `${primary_url}${city.toLowerCase()}`;
        let next_page_url = [];

        await axios.get(url, headers)
            .then(async (response) => {
                const $ = await cheerio.load(response['data']);
                const row = 'h3[class="entry-title"]>a';
                await $(row).each((childIdx, childelem) => {
                    all_adds_link.push($(childelem).attr('href'))
                })

                const next_page = 'ul[class="pagination"]>li>a'
                await $(next_page).each((childIdx, childelem) => {
                    let next_page_link = $(childelem).attr('href');
                    if (next_page_link != undefined && !next_page_url.includes(next_page_link)) {
                        next_page_url.push($(childelem).attr('href'));
                    }
                })

            }
            )
        await custom_function.myForEach(next_page_url, async (elem, indx, arr) => {
            await axios.get(elem, headers)
                .then(async (response) => {
                    const $ = await cheerio.load(response['data']);
                    const row = 'h3[class="entry-title"]>a';
                    await $(row).each((childIdx, childelem) => {
                        all_adds_link.push($(childelem).attr('href'))
                    })
                }
                )
        }, next_page_url)

        await console.log(all_adds_link.length);

        let add_details = await dataCollect.dataCollect(all_adds_link,city);
        let ads_report = {};
        await console.log(add_details);
        await console.log(element, add_details.length)

        ads_report.CityName = city_arr[0];
        ads_report.Province = province;
        ads_report.Real_Property_management =await add_details.length;
        await report.push(ads_report);

        await custom_function.myForEach(add_details,async(el,indx,arr) =>{
            await all_adds_info.push(el);
        },add_details);


    }, cities)

    await save_file.save_file(all_adds_info, report, "Real_Property_management");

};
home();
// module.exports = {home};