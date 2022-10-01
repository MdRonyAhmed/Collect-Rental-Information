const json2csv = require("json2csv").Parser;
const fs = require("fs");
const custom_function = require("./custom_function");

function writeToFile (data, path) {  
    const json = JSON.stringify(data, null, 2)
  
    fs.writeFile(path, json, (err) => {
      if (err) {
        console.error(err)
        throw err
      }
  
      console.log('Saved data to file.')
    })
  }

async function myForEach(arr, myCallBack, myString) {

  for (let i = 0; i < arr.length; i++) {

      await myCallBack(arr[i], index = i, arr, myString, () => {
          

      })

  }
}

let ads_info = [];
let report_all = [];

async function store_data(ads,report){
    await myForEach(ads,async(element,index,arr)=>{
      await ads_info.push(element);
    },ads)

    await myForEach(report,async(element,index,arr)=>{
      report_all.push(element);
    },report)

}
function filter_array(test_array) {
  var index = -1,
      arr_length = test_array ? test_array.length : 0,
      resIndex = -1,
      result = [];

  while (++index < arr_length) {
      var value = test_array[index];

      if (value) {
          result[++resIndex] = value;
      }
  }

  return result;
}
async function save_csv(arr_ads,arr_report){
  let today = await custom_function.get_date();

  arr_ads = filter_array(arr_ads);
  arr_report = filter_array(arr_report);
 
  const j2c = new json2csv();
  const ads_details = j2c.parse(arr_ads);
  
  const j2csv2= new json2csv();
  var report = j2csv2.parse(arr_report);

  await fs.writeFileSync(`./datasets/Rental_Details(${today}).csv`, ads_details, "utf-8");
  await fs.writeFileSync(`./datasets/Report(${today}).csv`,report,"utf-8");


}

async function save_file(arr_adds,report,website,type="file"){   
  let today = await custom_function.get_date();
  
  if(type == "file"){
    await writeToFile(arr_adds, `./datasets/ads_details_json/Rental_Details_${website}.json`);
    await writeToFile(report, `./datasets/report_json/Report_${website}.json`);
  }else{
    await writeToFile(arr_adds, `./datasets/Rental_Details(${today}).json`);
    await writeToFile(report, `./datasets/Report(${today}).json`);
  }
  
    
}

module.exports = {save_file,store_data,save_csv};