const { defaultProvider, stark } = require('starknet');
const { getSelectorFromName } = stark;
const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
const Web3 = require('web3');
const pinataSDK = require('@pinata/sdk');
const ethWallet = require('ethereumjs-wallet');
const { ethers } = require("ethers");
const { spawn } = require('child_process')
const fs = require('fs');
const fetch = require('cross-fetch');
const CID = require('cids');
const axios = require('axios');
const hex2ascii = require('hex2ascii');
const pinata = pinataSDK(process.env.PERSONAL_PINATA_PUBLIC_KEY, process.env.PERSONAL_PINATA_SECRET_KEY);
const projectID = process.env.PROJECT_ID;
const testNet = process.env.TEST_NET;
const signingKey = process.env.PRIVATE_KEY;
const starknetPrivKey = process.env.SERVER_STARKNET_PRIVATE_KEY;
const starknetNFTAddr = process.env.STARKNET_NFT;
const starknetDAOAddr = process.env.STARKNET_DAO;
const argentAddr_1 = process.env.ARGENT_ADDR_1;
const argentAddr_2 = process.env.ARGENT_ADDR_2;
const argentAddr_3 = process.env.ARGENT_ADDR_3;
const argentAddr_4 = process.env.ARGENT_ADDR_4;

const app = express(); 
const upload = multer({dest: 'uploads/'})

let chainId;
let useLocalData = true;
let initObject = {};

const port = process.env.SERVER_PORT || 6000;

app.use(cors());

app.listen(port, () => console.log(`Listening on port ${port}`));
  
app.get('/nft-store/:address', async (req, res) => {
    const address = req.params.address;
    console.log(address);
    object = await dataFetch(address, true) 

  res.send({success : address, results : object}); 
});

app.get('/labels', async (req, res) => {
  const labelLen= await defaultProvider.callContract({
    contractAddress: starknetDAOAddr,
    entrypoint: "get_label_len",
    calldata: [],
  });
  const maxIndex = parseInt(labelLen.result[0])
  console.log(maxIndex)
  labelsArr = Array(maxIndex)
  const rawCosts= await defaultProvider.callContract({
    contractAddress: starknetDAOAddr,
    entrypoint: "get_costs",
    calldata: [],
  });
  const costs = rawCosts.result.slice(1).map(value => {
    return parseInt(value)
  })
  console.log(costs)
  const rawRatings= await defaultProvider.callContract({
    contractAddress: starknetDAOAddr,
    entrypoint: "get_ratings",
    calldata: ['0'],
  });
  const ratings = rawRatings.result.slice(1).map(value => {
    return parseInt(value)
  })
  console.log(ratings)
  const rawAccLevels= await defaultProvider.callContract({
    contractAddress: starknetDAOAddr,
    entrypoint: "get_acc_levels",
    calldata: ['0'],
  });
  const accLevels = rawAccLevels.result.slice(1).map(value => {
    return parseInt(value)
  })
  console.log(accLevels)
  const rawPenLevels= await defaultProvider.callContract({
    contractAddress: starknetDAOAddr,
    entrypoint: "get_penalty_levels",
    calldata: ['0'],
  });
  const penLevels = rawPenLevels.result.slice(1).map(value => {
    return parseInt(value)
  })
  console.log(penLevels)
  for (index = 1; index<=labelsArr.length; index++){
    const rawLabel= await defaultProvider.callContract({
      contractAddress: starknetDAOAddr,
      entrypoint: "get_label_at_index",
      calldata: [`${index}`],
    });
    console.log(rawLabel.result)
    labelsArr[index-1] = hex2ascii(rawLabel.result[0])
  }
  console.log(labelsArr)
  
  initObject["labels"] = labelsArr;
  initObject["costs"] = costs;
  initObject["ratings"] = ratings;
  initObject["accLevels"] = accLevels;
  initObject["penLevels"] = penLevels;

res.send({success : true, results : initObject}); 
});

//initial check called in useEffect to see if address has registered device
app.get('/init-device-check/:address', async (req, res) => {
  const address = req.params.address;
  let deviceExist = address in addressIMEI;
  if (!deviceExist){
    console.log('no devices')
    return res.send({IMEI : ""})
  }
  else{
    const deviceIMEI = addressIMEI[address];
    return res.send({IMEI : deviceIMEI})
  }
});

//used to render all NFTs for profile
app.get('/user-nfts/:address', async (req, res) => {
  const address = req.params.address;
  console.log(address);
  const callDataString = ethers.BigNumber.from(address)
  const lastTokenId = await defaultProvider.callContract({
    contractAddress: starknetNFTAddr,
    entrypoint: "getLastTokenId",
    calldata: [callDataString.toString()],
  });

  const startResult = await defaultProvider.callContract({
    contractAddress: starknetNFTAddr,
    entrypoint: "getLastTimestamp",
    calldata: [callDataString.toString()],
  });

  //test

  //end test

  //let tokenURIs = [tokenIds.length];
  let tokenURIs = Array(1)
  const start = parseInt(startResult.result[0])
  console.log(start)
  if(start==0){
    return res.send({success: false, results : [], start : 0})
  }
  else{
    const lastTokenURIArr = await defaultProvider.callContract({
      contractAddress: starknetNFTAddr,
      entrypoint: "tokenURI",
      calldata: [`${parseInt(lastTokenId.result[0])}`, '0'],
    });
    tokenURIs[0] = `ipfs://f01701220` + lastTokenURIArr.result[2].slice(2) + lastTokenURIArr.result[3].slice(2)
    console.log(tokenURIs)
    return res.send({success : true, results : tokenURIs, start : start});
  }
});

//used to render all NFTs for all Dao holdings
// app.get('/dao-nfts/:address', async (req, res) => {
//   const address = req.params.address;
//   console.log(address);
//   const round = await DAOInstance.methods.getCurrentRound().call();
//   const members = await DAOInstance.methods.getDAOMembers(round).call();
//   console.log(round)
//   let tokenURIs = [members.length];
//   let currentTokenId;
//   if(members.length==0){
//     return res.send({success: false, results : [], members : []})
//   }
//   else{
//     for (var i =0; i<members.length; i++){
//       currentTokenId = await DAOInstance.methods.currentTokenIdForAddr(round, members[i]).call();
//       console.log(currentTokenId)
//       tokenURIs[i] =  await NFTInstance.methods.tokenURI(currentTokenId).call();
//     }
//     return res.send({success : true, results : tokenURIs, members : members});
//   }
// });

//main mint call
app.get('/mint/:address', async (req, res) => {
  //process query params
  const address = req.params.address;
  const runs = req.query.runs;
  const start = req.query.start;
  const base16IPFS = new CID(req.query.imageuri).toV1().toString('base16')
  const imageURI = `ipfs://${base16IPFS}`;
  console.log(`runs: ${runs} and start : ${start} and URI : ${imageURI}`);
  const callDataString = ethers.BigNumber.from(address)
  const lastTokenId = await defaultProvider.callContract({
    contractAddress: starknetNFTAddr,
    entrypoint: "getLastTokenId",
    calldata: [callDataString.toString()],
  });

  const startResult = await defaultProvider.callContract({
    contractAddress: starknetNFTAddr,
    entrypoint: "getLastTimestamp",
    calldata: [callDataString.toString()],
  });
  const startCheck = parseInt(startResult.result[0])
  if((startCheck !==0  && startCheck > start && yearAgo < start) || !(runs>=100 && runs<=500)){
      return res.send({success : false, reason : "invalid runs number or start"})
    }
  //get info needed for calculating score and message later
  // const labelLen= await defaultProvider.callContract({
  //   contractAddress: starknetDAOAddr,
  //   entrypoint: "get_label_len",
  //   calldata: [],
  // });
  // const maxIndex = parseInt(labelLen.result[0])
  // console.log(maxIndex)
  // labelsArr = Array(maxIndex)
  // const rawCosts= await defaultProvider.callContract({
  //   contractAddress: starknetDAOAddr,
  //   entrypoint: "get_costs",
  //   calldata: [],
  // });
  // const costs = rawCosts.result.slice(1).map(value => {
  //   return parseInt(value)
  // })
  // console.log(costs)
  // const rawRatings= await defaultProvider.callContract({
  //   contractAddress: starknetDAOAddr,
  //   entrypoint: "get_ratings",
  //   calldata: ['0'],
  // });
  // const ratings = rawRatings.result.slice(1).map(value => {
  //   return parseInt(value)
  // })
  // console.log(ratings)
  // const rawAccLevels= await defaultProvider.callContract({
  //   contractAddress: starknetDAOAddr,
  //   entrypoint: "get_acc_levels",
  //   calldata: ['0'],
  // });
  // const accLevels = rawAccLevels.result.slice(1).map(value => {
  //   return parseInt(value)
  // })
  // console.log(accLevels)
  // const rawPenLevels= await defaultProvider.callContract({
  //   contractAddress: starknetDAOAddr,
  //   entrypoint: "get_penalty_levels",
  //   calldata: ['0'],
  // });
  // const penLevels = rawPenLevels.result.slice(1).map(value => {
  //   return parseInt(value)
  // })
  // console.log(penLevels)
  // for (index = 1; index<=labelsArr.length; index++){
  //   const rawLabel= await defaultProvider.callContract({
  //     contractAddress: starknetDAOAddr,
  //     entrypoint: "get_label_at_index",
  //     calldata: [`${index}`],
  //   });
  //   console.log(rawLabel.result)
  //   labelsArr[index-1] = hex2ascii(rawLabel.result[0])
  // }
  // console.log(labelsArr)
  
  costs = initObject.costs;
  ratingLabels = initObject.labels;
  accLevels = initObject.accLevels;
  penLevels = initObject.penLevels;
  ratingLevels = initObject.ratings;
  console.log(penLevels);
  console.log(accLevels);
  console.log(costs);
  console.log(ratingLabels);
  console.log(ratingLevels);
  

//   const nonce = await VerifyInstance.methods.nonces(address).call();

  let recordsData, timestamp;
  let score = 0;
  let index =0;
  let deviceExist = address in addressIMEI;
  if (!deviceExist){
    return res.send({success : false, reason : "not enough records for this"})
  }
  else{
    const deviceIMEI = addressIMEI[address];
    fs.readFile('./backupDataStarknet.json', 'utf8', async (err, data) => {

      if (err) {
          console.log(`Error reading file from disk: ${err}`);
          return res.send({success : false, reason : "error reading json data"})
      } else {
  
          // parse JSON string to JSON object
          const dataObj = JSON.parse(data);
  
          const timestamps = dataObj['timestamps'];
          while(index < 1000 && timestamps[index]< start){
              index++;
          }
          console.log(`index is ${index} and runs is ${runs}`);
          if(index + Number(runs) >= 1000){
            console.log('in here not enough records')
          return res.send({success : false, reason : "not enough records for this"})
          }
          else {
            timestamp = timestamps[index + Number(runs)-1];
            recordsData = dataObj[deviceIMEI].slice(index, index + Number(runs));
          }
          console.log(`at recordsData : length is ${recordsData.length}`)
          
          recordsData.map((record, index) =>{
            if(index<10 || index > 90){
            console.log(score)
          }
            let k = accLevels.length -1;
            let flag = false;
            while(!flag && k >0){
              if(record >= accLevels[k]){
                flag = true;
                score += penLevels[k]
              }
              k--;
            }
         })

          const average = Math.round(score*100/runs)/100;
          console.log(`math avg : ${average}`);
//           const ratingLevels = await DAOInstance.methods.getRatings().call();
//           let ratingLabels = Array(ratingLevels.length);
//           for (let j =0; j<ratingLevels.length; j++){
//             ratingLabels[j] = await DAOInstance.methods.ratingLabels(j + 1).call(); 
//           }
          console.log(ratingLabels);
          console.log(ratingLevels);
          let rating = ratingLabels[ratingLabels.length-1];
          let level = ratingLevels.length;
          let indexLevel = 1;
          let setLevel = false;
          while (indexLevel < ratingLevels.length){
            if(average > ratingLevels[level-indexLevel]){
              level = indexLevel;
              rating = ratingLabels[indexLevel-1];
              indexLevel = ratingLevels.length;
              setLevel = true;
            }
            indexLevel++;
          }
          if(!setLevel){
            rating = ratingLabels[0];
          }

          //create and upload JSON data for token URI
          let tokenJSON = {};
          tokenJSON['name'] = `Starknet DAO NFT #${parseInt(lastTokenId.result[0]) +1} for ${address}`;
          tokenJSON['description'] = "Starknet DAO utilizing verified IoT data from Starknet blockchain";
          tokenJSON['image'] = imageURI;
          tokenJSON['attributes'] = {'score' : score, 'runs' : runs, 'lastTimeStamp' : timestamp, 'average' : average, 'rating' : rating, 'level' : `${level} of ${costs.length}`}

          const tokenFile = await uploadJSONPinata(tokenJSON);
          const tokenURI = `ipfs://${tokenFile.IpfsHash}`;
          const base16Hash = new CID(tokenFile.IpfsHash).toV1().toString('base16');
          console.log(`base 16 hash is ${base16Hash}`);

          //verify with base16Hash.slice(9)
//           let inputArgs = [5, 20]
//           const python = spawn('bash', ['./python-sign.sh', ...inputArgs])
//           let signature_vars = []

//           // collect data from script
//           python.stdout.on('data', function (data) {
//             console.log('Pipe data from python script ...')
//             signature_vars.push(data)
//           })

//           // in close event we are sure that stream is from child process is closed
//           python.on('close', (code) => {
//             console.log(`child process close all stdio with code ${code}`)
//           })

//           console.log(`${nonce} and ${address} and ${Verify.networks[chainId].address} and ${timestamp} and ${tokenURI}`)

//           const signature = await verifyNFTInfo(nonce, address, Verify.networks[chainId].address, timestamp, tokenURI, 0);

//           console.log(`r is ${signature.r}, s is ${signature.s}, v is ${signature.v}`)

           res.send({success : true, score : score, average : average, lastTimeStamp : timestamp, tokenURI : tokenURI, rating : rating, r : 0, s : 0, v : 0});
          console.log('made it to end')
          return
        }
      });
    }
   })

//route to upload images, called in the beginning of mint function client side
app.post('/mint-upload/:address', upload.single('avatar'), async (req, res) => {
  const address = req.params.address;
  console.log(address)
  //const tokenIds = await NFTInstance.methods.getTokensByAddr(address).call();
  console.log(req.file)
  //fs.renameSync(req.file.path, `./uploads/${address}_${tokenIds.length}.png`);
  fs.renameSync(req.file.path, `./uploads/${address}_1.png`);
  const urlHash = await uploadImagePinata(`uploads/${address}_1.png`);
  console.log(urlHash.IpfsHash)
  res.send({success : true, imageURL : urlHash.IpfsHash})

})

//dao join/update call
// app.get('/dao-join-update/:address', async (req, res) => {
//   const address = req.params.address;
//   console.log(address)
//   const tokenIds = await NFTInstance.methods.getTokensByAddr(address).call();
//   if(tokenIds.length==0){
//     return res.send({success : false, reason : "address has no minted tokens"})
//   }
//   const currentDAORound = await DAOInstance.methods.getCurrentRound().call();
//   const currentDAOToken = await DAOInstance.methods.currentTokenIdForAddr(currentDAORound, address).call();
//   if(currentDAOToken > 0 && currentDAOToken == tokenIds[tokenIds.length-1]){
//     return res.send({success : false, reason : "needs to mint a new token"})
//   }
//   const TokenURI = await NFTInstance.methods.tokenURI(tokenIds[tokenIds.length-1]).call();
//   const tokenMetaData = await fetch(`https://gateway.pinata.cloud/ipfs/${TokenURI.slice(7)}`);
//   const tokenMetaDataBody = await tokenMetaData.json();
//   const level = Number(tokenMetaDataBody.attributes.level.split(" ")[0]);
//   const costs = await DAOInstance.methods.getCosts().call();
//   const timeStamp = await NFTInstance.methods.lastTimeStampNFTUsed(address).call();
//   const nonce = await VerifyInstance.methods.nonces(address).call();
//   const signature = await verifyDAOInfo(nonce, address, Verify.networks[chainId].address, timeStamp, costs.length-level+1, tokenIds[tokenIds.length-1]);
//   console.log(`r is ${signature.r}, s is ${signature.s}, v is ${signature.v}, tokenId : ${tokenIds[tokenIds.length-1]}, and timestamp is ${timeStamp}`)

//   return res.send({success : true, level : costs.length-level+1, timeStamp : timeStamp, tokenId : tokenIds[tokenIds.length-1], r : signature.r, s : signature.s, v : signature.v});
  
// })

//helpers for uploading image and JSON to Pinata through API for image URI and token URI
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

  return result;             
}

async function uploadJSONPinata(obj){
  //first part handles the pinning from a folder
  
  let options = { 
      pinataOptions: { cidVersion: 0 }
  };

  const result = await pinata.pinJSONToIPFS(obj, options)
                        .catch((err) => {console.log(err);});

  return result;            
}

const verifyNFTInfo = async function(nonce, account, contract, timestamp, URI, tokenId){
  let wallet = new ethers.Wallet(signingKey);

  const newHashMsg = ethers.utils.solidityKeccak256(["uint256", "address", "address", "uint256", "string", "uint256"], [nonce, account, contract, timestamp, URI, tokenId]);

  const sig = ethersSign(wallet, newHashMsg);

  return sig;

}

const verifyDAOInfo = async function(nonce, account, contract, timestamp, level, tokenId){
  let wallet = new ethers.Wallet(signingKey);

  const newHashMsg = ethers.utils.solidityKeccak256(["uint256", "address", "address", "uint256", "uint256", "uint256"], [nonce, account, contract, timestamp, level, tokenId]);

  const sig = ethersSign(wallet, newHashMsg);

  return sig;

}

//helper to sign a hash with a wallet
const ethersSign = async function (wallet, hash) {
  let messageHashBytes = ethers.utils.arrayify(hash);
  let flatSig = await wallet.signMessage(messageHashBytes);

  let sig = ethers.utils.splitSignature(flatSig);

  return sig
}

//Local address data map
const addressIMEI = {
  "0x7f5ed1b71b101d046244ba6703a3bae5cfb2a5b34af4a841537f199974406d9" : "100000000000019",
  "0x6fb00605dff8c1086aa8cea1307f82279d7df741ce588e775303ac47c1690e8" : "100000000000023",
  "0x51df3b3b48329cd68512c1079db368685c5e527f3b9655246023d451207fed1" : "100000000000024",
  "0x7da3d9da8b703afc89aa2c58ef5139de12a2dfdeca54be9b2e2711a98bb8328" : "100000000000025"
}
// const addressIMEI = {
//     argentAddr_1 : "100000000000019",
//     argentAddr_2 : "100000000000023",
//     argentAddr_3 : "100000000000024",
//     argentAddr_4 : "100000000000025"
//   }
