const json2csv = require("json2csv").Parser;
const fs = require("fs");
const CSVToJSON = require('csvtojson');


async function myForEach(arr, myCallBack, myString) {

     for (let i = 0; i < arr.length; i++) {
 
         await myCallBack(arr[i], index = i, arr, myString, () => {
            
 
         })
 
     }
}

async function writeToFile (data, path) {  
     const json = JSON.stringify(data, null, 2)
   
     fs.writeFile(path, json, (err) => {
       if (err) {
         console.error(err)
         throw err
       }
   
       console.log('Saved data to file.')
     })
}

(async () =>{

     let check_arr = [];
     let output = [];

     // convert users.csv file to JSON array
     await CSVToJSON().fromFile('kijiji_Rental_info_all.csv')
     .then(async (rows) => {
          
          await myForEach(rows,async(element,index,arr)=>{
               if(check_arr.includes(element.Link) == false){

                    await output.push(element);
                    await check_arr.push(element.Link);

               }
               

          },rows)
     })


     

     await console.log(output.length);
     await console.log(output);

   
     const j2cp = new json2csv();
     const csv = j2cp.parse(output);
 
     await fs.appendFileSync("./kijiji_RentalInfo_all.csv", csv, "utf-8");

     await writeToFile(output, "./kijiji_RentalInfo_all.json")

})();
