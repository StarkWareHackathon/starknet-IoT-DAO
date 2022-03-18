const InsuranceNFT = require('./src/abis/InsuranceNFT.json');
const Verify = require('./src/abis/Verify.json');
const InsuranceDAO = require('./src/abis/InsuranceDAO.json');
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
const axios = require('axios');
const pinata = pinataSDK(process.env.PERSONAL_PINATA_PUBLIC_KEY, process.env.PERSONAL_PINATA_SECRET_KEY);
const projectID = process.env.PROJECT_ID;
const testNet = process.env.TEST_NET;
const signingKey = process.env.PRIVATE_KEY;

const app = express(); 
const upload = multer({dest: 'uploads/'})

let web3;
let chainId;
let useLocalData = true;
//swap between Kovan
if(testNet=="KOVAN"){
  web3 = new Web3(new Web3.providers.HttpProvider(`https://kovan.infura.io/v3/${projectID}`));
  chainId = 42;
  }

const port = process.env.SERVER_PORT || 6000;

//instances of all 3 contracts
const NFTInstance = new web3.eth.Contract(InsuranceNFT.abi, InsuranceNFT.networks[chainId].address);
const VerifyInstance = new web3.eth.Contract(Verify.abi, Verify.networks[chainId].address);
const DAOInstance = new web3.eth.Contract(InsuranceDAO.abi, InsuranceDAO.networks[chainId].address);

app.use(cors());

app.listen(port, () => console.log(`Listening on port ${port}`));
  
app.get('/nft-store/:address', async (req, res) => {
    const address = req.params.address;
    console.log(address);
    object = await dataFetch(address, true) 

  res.send({success : address, results : object}); 
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
  const tokenIds = await NFTInstance.methods.getTokensByAddr(address).call();
  const start = await NFTInstance.methods.lastTimeStampNFTUsed(address).call();
  let tokenURIs = [tokenIds.length];
  let tokenMetaData = [tokenIds.length]
  if(tokenIds.length==0){
    return res.send({success: false, results : [], start : 0})
  }
  else{
    
    for (var i =0; i<tokenIds.length; i++){
      tokenURIs[i] =  await NFTInstance.methods.tokenURI(tokenIds[i]).call();
    }
    
    return res.send({success : true, results : tokenURIs, start : start});
  }
});

//used to render all NFTs for all Dao holdings
app.get('/dao-nfts/:address', async (req, res) => {
  const address = req.params.address;
  console.log(address);
  const round = await DAOInstance.methods.getCurrentRound().call();
  const members = await DAOInstance.methods.getDAOMembers(round).call();
  console.log(round)
  let tokenURIs = [members.length];
  let currentTokenId;
  if(members.length==0){
    return res.send({success: false, results : [], members : []})
  }
  else{
    for (var i =0; i<members.length; i++){
      currentTokenId = await DAOInstance.methods.currentTokenIdForAddr(round, members[i]).call();
      console.log(currentTokenId)
      tokenURIs[i] =  await NFTInstance.methods.tokenURI(currentTokenId).call();
    }
    return res.send({success : true, results : tokenURIs, members : members});
  }
});

//main mint call
app.get('/mint/:address', async (req, res) => {
  //process query params
  const address = req.params.address;
  const runs = req.query.runs;
  const start = req.query.start;
  const imageURI = `ipfs://${req.query.imageuri}`;
  console.log(`runs: ${runs} and start : ${start} and URI : ${imageURI}`);

  // get info from NFT and DAO smart contract we will need and check start is valid
  const tokenIds = await NFTInstance.methods.getTokensByAddr(address).call();
  const startCheck = await NFTInstance.methods.lastTimeStampNFTUsed(address).call();
  const yearAgo = Math.round(Date.now()/1000) - 12*30*24*3600;
  if((startCheck !==0  && startCheck > start && yearAgo < start) || !(runs>=100 && runs<=500)){
    return res.send({success : false, reason : "invalid runs number or start"})
  }

  //get info needed for calculating score and message later
  const accLevels = await DAOInstance.methods.getAccLevels().call();
  const rawPenLevels = await DAOInstance.methods.getPenaltyLevels().call();
  const costs = await DAOInstance.methods.getCosts().call();
  const nonce = await VerifyInstance.methods.nonces(address).call();
  let penLevels = Array(rawPenLevels.length);
  for(var i=0 ; i<penLevels.length; i++){
    if(i==0){
      penLevels[i] = Number(rawPenLevels[i]);
    }
    else{
      penLevels[i] = Number(penLevels[i-1]) + Number(rawPenLevels[i]);
    }
  }

  let recordsData, timestamp;
  let score = 0;
  let index =0;
  let deviceExist = address in addressIMEI;
  if (!deviceExist){
    return res.send({success : false, reason : "not enough records for this"})
  }
  else{
    const deviceIMEI = addressIMEI[address];
    fs.readFile('./backupData.json', 'utf8', async (err, data) => {

      if (err) {
          console.log(`Error reading file from disk: ${err}`);
          return res.send({success : false, reason : "error reading json data"})
      } else {
  
          // parse JSON string to JSON object
          const dataObj = JSON.parse(data);
  
          const timestamps = dataObj['timestamps'];
          while(index < 400 && timestamps[index]< start){
              index++;
          }
          console.log(`index is ${index} and runs is ${runs}`);
          if(index + Number(runs) >= 400){
            console.log('in here')
          return res.send({success : false, reason : "not enough records for this"})
          }
          else {
            timestamp = timestamps[index + Number(runs)-1];
            recordsData = dataObj[deviceIMEI].slice(index, index+runs);
          }
          recordsData.map((record, index) =>{
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
          const ratingLevels = await DAOInstance.methods.getRatings().call();
          let ratingLabels = Array(ratingLevels.length);
          for (let j =0; j<ratingLevels.length; j++){
            ratingLabels[j] = await DAOInstance.methods.ratingLabels(j + 1).call(); 
          }
          console.log(ratingLabels);
          console.log(ratingLevels);
          let rating = ratingLabels[ratingLabels.length-1];
          let level = ratingLevels.length;
          let indexLevel = 1;
          let setLevel = false;
          while (indexLevel < ratingLevels.length){
            if(average > ratingLevels[level-indexLevel]){
              level = indexLevel;
              rating = ratingLabels[ratingLevels.length - indexLevel];
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
          tokenJSON['name'] = `Pebble DAO NFT #${tokenIds.length +1} for ${address}`;
          tokenJSON['description'] = "Pebble DAO utilizing verified data from IoTeX Pebble Tracker";
          tokenJSON['image'] = imageURI;
          tokenJSON['attributes'] = {'score' : score, 'runs' : runs, 'lastTimeStamp' : timestamp, 'average' : average, 'rating' : rating, 'level' : `${level} of ${costs.length}`}

          const tokenFile = await uploadJSONPinata(tokenJSON);
          const tokenURI = `ipfs://${tokenFile.IpfsHash}`;

          console.log(`${nonce} and ${address} and ${Verify.networks[chainId].address} and ${timestamp} and ${tokenURI}`)

          const signature = await verifyNFTInfo(nonce, address, Verify.networks[chainId].address, timestamp, tokenURI, 0);

          console.log(`r is ${signature.r}, s is ${signature.s}, v is ${signature.v}`)

          res.send({success : true, score : score, average : average, lastTimeStamp : timestamp, tokenURI : tokenURI, rating : rating, r : signature.r, s : signature.s, v : signature.v});  
        }
      });
    }
  })

//route to upload images, called in the beginning of mint function client side
app.post('/mint-upload/:address', upload.single('avatar'), async (req, res) => {
  const address = req.params.address;
  console.log(address)
  const tokenIds = await NFTInstance.methods.getTokensByAddr(address).call();
  console.log(req.file)
  fs.renameSync(req.file.path, `./uploads/${address}_${tokenIds.length}.png`);
  const urlHash = await uploadImagePinata(`uploads/${address}_${tokenIds.length}.png`);
  res.send({success : true, imageURL : urlHash.IpfsHash})

})

//dao join/update call
app.get('/dao-join-update/:address', async (req, res) => {
  const address = req.params.address;
  console.log(address)
  const tokenIds = await NFTInstance.methods.getTokensByAddr(address).call();
  if(tokenIds.length==0){
    return res.send({success : false, reason : "address has no minted tokens"})
  }
  const currentDAORound = await DAOInstance.methods.getCurrentRound().call();
  const currentDAOToken = await DAOInstance.methods.currentTokenIdForAddr(currentDAORound, address).call();
  if(currentDAOToken > 0 && currentDAOToken == tokenIds[tokenIds.length-1]){
    return res.send({success : false, reason : "needs to mint a new token"})
  }
  const TokenURI = await NFTInstance.methods.tokenURI(tokenIds[tokenIds.length-1]).call();
  const tokenMetaData = await fetch(`https://gateway.pinata.cloud/ipfs/${TokenURI.slice(7)}`);
  const tokenMetaDataBody = await tokenMetaData.json();
  const level = Number(tokenMetaDataBody.attributes.level.split(" ")[0]);
  const costs = await DAOInstance.methods.getCosts().call();
  const timeStamp = await NFTInstance.methods.lastTimeStampNFTUsed(address).call();
  const nonce = await VerifyInstance.methods.nonces(address).call();
  const signature = await verifyDAOInfo(nonce, address, Verify.networks[chainId].address, timeStamp, costs.length-level+1, tokenIds[tokenIds.length-1]);
  console.log(`r is ${signature.r}, s is ${signature.s}, v is ${signature.v}, tokenId : ${tokenIds[tokenIds.length-1]}, and timestamp is ${timeStamp}`)

  return res.send({success : true, level : costs.length-level+1, timeStamp : timeStamp, tokenId : tokenIds[tokenIds.length-1], r : signature.r, s : signature.s, v : signature.v});
  
})

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

//Local Data in case TruStream is having issues
const addressIMEI = {
  "0xA072f8Bd3847E21C8EdaAf38D7425631a2A63631" : "100000000000019",
  "0x3fd431F425101cCBeB8618A969Ed8AA7DFD115Ca" : "100000000000023",
  "0x42F9EC8f86B5829123fCB789B1242FacA6E4ef91" : "100000000000024",
  "0xa0Bb0815A778542454A26C325a5Ba2301C063b8c" : "100000000000025"
}