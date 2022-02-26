const fs = require('fs');
const startTime = 1630468800;
const secondTime = 1633060800;

let writeObject = {}

let timestamp = Array(400);
let acceleration_1 = Array(400);
let acceleration_2 = Array(400);
let acceleration_3 = Array(400);
let acceleration_4 = Array(400);
for (var i =0; i<400; i++){
    if(i<200){
    timestamp[i] = startTime + 20*i;
    acceleration_1[i] = Math.round(50*Math.random()+10);
    acceleration_2[i] = Math.round(80*Math.random()+20);
    acceleration_3[i] = Math.round(40*Math.random()+5);
    acceleration_4[i] = Math.round(50*Math.random()+10);
    }
    else{
    timestamp[i] = secondTime + 20*i;
    acceleration_1[i] = Math.round(20*Math.random()+5);
    acceleration_2[i] = Math.round(20*Math.random()+10);
    acceleration_3[i] = Math.round(80*Math.random()+20);
    acceleration_4[i] = Math.round(50*Math.random()+10);
    }
}

writeObject['timestamps'] = timestamp;
writeObject['100000000000019'] = acceleration_1;
writeObject['100000000000023'] = acceleration_2;
writeObject['100000000000024'] = acceleration_3;
writeObject['100000000000025'] = acceleration_4;

fs.writeFile('./backupData.json', JSON.stringify(writeObject), 'utf8', (err) => {

    if (err) {
        console.log(`Error writing file: ${err}`);
    } else {
        console.log(`File is written successfully!`);
    }
});