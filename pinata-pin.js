require('dotenv').config();

const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const pinata = pinataSDK(process.env.PERSONAL_PINATA_PUBLIC_KEY, process.env.PERSONAL_PINATA_SECRET_KEY);
const args = process.argv;

/*pinata.testAuthentication().then((result) => {
    //handle successful authentication here
    console.log(result);
}).catch((err) => {
    //handle error here
    console.log(err);
});
*/

async function main(cliArgs){
    //first part handles the pinning from a folder
    const Uploading = cliArgs[2];

    if (Uploading.toLowerCase() == "pin" || Uploading.toLowerCase() == "p"){
    let options = { pinataMetadata: 
        {keyvalues: {
            'number' : 0,
            
        }}, 
        pinataOptions: { cidVersion: 0 }
    };
    let imageNumber = "";
    let readableStreamforFile;
    let offset = Number(cliArgs[3]);
    let limit = Number(cliArgs[4]);
    let paths = cliArgs.slice(5);
    let count = 0;
    
    paths.forEach((folder) => {
        fs.readdirSync(`./${folder}`).forEach((file, index) => {
            imageNumber = Number(file.split('.')[0]);
            
            if(imageNumber<offset || imageNumber > (offset + limit)){
                //console.log(`${imageNumber} not between offset and limit`);
            }
            else{
                count++;
                console.log(`${imageNumber} between offset and limit`);
                console.log(`current ${count}`);
                if(count % 5 == 0){
                    console.log('sleep')
                    sleep.sleep(11);
                }
                /*
                if(index % 10 == 0){
                    sleep.sleep(22);
                }*/
                
                readableStreamforFile = fs.createReadStream(`./${folder}/${file}`);
                options.pinataMetadata.keyvalues.number = imageNumber;
                //options.pinataMetadata.keyvalues.description = `This is image ${imageNumber}`;
                pinata.pinFileToIPFS(readableStreamforFile, options).then((result) => {
                    console.log(result.IpfsHash);
                    
                })
                .catch((err) => {console.log(err);});
            }   
        })
    })
    }
    else if (Uploading.toLowerCase() == "retrieve" || Uploading.toLowerCase() == "r"){
    //getting the image URIs with metadata from the Pinata API and writing them to an output file
    let numbers = cliArgs.slice(3);
    let lower_bound = 1;
    let upper_bound = 10000;
    if (numbers.length==1){
        upper_bound=Math.round(Math.abs(Number(numbers[0])));
    }
    else if(numbers.length >1){
        lower_bound=Math.round(Math.abs(Number(numbers[0])));
        upper_bound=Math.round(Math.abs(Number(numbers[1])));
        if (upper_bound < lower_bound){
            upper_bound=Math.round(Math.abs(Number(numbers[0])));
            lower_bound=Math.round(Math.abs(Number(numbers[1])));
        }
    }
    console.log(lower_bound, upper_bound)
    const metadataFilter = {keyvalues: 
                                {number : 
                                    {value: lower_bound, secondValue: upper_bound, op: 'between'}
                                }
                            }

    const filters = {status : 'pinned',
                    pageLimit: 1000,
                    metadata: metadataFilter
    };
    let metaObject = {};
    pinata.pinList(filters).then((result) => {
        let rowRet = result.rows;
        

        rowRet.sort((a,b) => Number(a.metadata.keyvalues.number) - Number(b.metadata.keyvalues.number)).forEach((obj) =>{
            console.log(`Image Number: ${obj.metadata.keyvalues.number} and URI is ipfs://${obj.ipfs_pin_hash}`);
            /*fs.writeFileSync("pinataoutput.txt", `${obj.metadata.keyvalues.number}__ipfs://${obj.ipfs_pin_hash}\n`,
            {
                encoding: "utf8",
                flag: "a+"
            });*/
            metaObject[obj.metadata.keyvalues.number] = {'image':`ipfs://${obj.ipfs_pin_hash}`}//, 'description' : `${obj.metadata.keyvalues.description}`};

        })
        //console.log(metaObject);
        fs.writeFile('./pinataOutput.json', JSON.stringify(metaObject), 'utf8', (err) => {

            if (err) {
                console.log(`Error writing file: ${err}`);
            } else {
                console.log(`File is written successfully!`);
            }
        
        });

        })
        .catch((err) => {console.log(err);});
    }
    else{
        console.log('wrong first arg');
    }
        
}

main(args);