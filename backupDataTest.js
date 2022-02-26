const fs = require('fs');
const startTime = 1630468947;
let index = 0;
let runs = 40;
let deviceIMEI = "100000000000023"

fs.readFile('./backupData.json', 'utf8', (err, data) => {

    if (err) {
        console.log(`Error reading file from disk: ${err}`);
    } else {

        // parse JSON string to JSON object
        const dataObj = JSON.parse(data);

       const timestamps = dataObj['timestamps'];
       while(index < 400 && timestamps[index]< startTime){
           index++;
       }
       console.log(index);
       timestamp = timestamps[index+runs-1];
       recordsData = dataObj[deviceIMEI].slice(index, index+runs);
       console.log(timestamp)
       console.log(recordsData);
    }

});