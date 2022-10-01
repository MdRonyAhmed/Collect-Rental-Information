const custom_function = require("./custom_function");
const save_output = require("./SaveOutput");
const fs = require('fs');

async function combine_file(path) {

    let combined_arr = [];
    let file_list = await custom_function.read_dir(path);
    while (1) {
        if (file_list.length != 0) {
            break;
        }
        await custom_function.sleep(400);
    }
    await custom_function.myForEach(file_list, async (file_name, index, arr) => {
        await console.log(file_name);

        let json_aray = await fs.readFileSync(file_name);
        let aray = await JSON.parse(json_aray);
        combined_arr = await combined_arr.concat(aray);
        await custom_function.sleep(200);
        // await fs.unlinkSync(file_name);

    });

    return combined_arr;


}

function groupBy(array, key) {
    return array.reduce((prev, current) => {
        (prev[current[key]] = prev[current[key]] || []).push(current);
        return prev;
    }, {});
}


function get_new_objects(array) {
    // Group by objects by name
    const groups = groupBy(array, 'CityName');
    
    // Iterate through groups and merge the list of objects together 
    const result = Object.values(groups).map(group => group.reduce((prev, current) => {
        return {...prev, ...current};
    }));

    return result;
}

(async () => {


    let ads_details =await combine_file("./datasets/ads_details_json");
    let report =await combine_file("./datasets/report_json");

    let report1 = await get_new_objects(report);    
    await save_output.save_csv(ads_details,report1);  
    // await save_output.save_file(ads_details,report1,"combine","combine");    

})();