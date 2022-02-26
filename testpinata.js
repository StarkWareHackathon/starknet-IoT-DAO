require('dotenv').config();

const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const pinata = pinataSDK(process.env.PERSONAL_PINATA_PUBLIC_KEY, process.env.PERSONAL_PINATA_SECRET_KEY);

async function uploadImagePinata(file){
    //first part handles the pinning from a folder
    
    let options = { 
        pinataOptions: { cidVersion: 0 }
    };
  
    let readableStreamforFile;
               
    readableStreamforFile = fs.createReadStream(`./${file}`);
                
    //options.pinataMetadata.keyvalues.description = `This is image ${imageNumber}`;
    const result = await pinata.pinFileToIPFS(readableStreamforFile, options)
                          .catch((err) => {console.log(err);});
    
    console.log(`${result.IpfsHash}`)
                
  }

  uploadImagePinata('uploads/avatar.png')