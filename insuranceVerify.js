const ethWallet = import('ethereumjs-wallet');
const fs = require('fs');
const { ethers } = require("ethers");
require('dotenv').config();
var Web3 = require('web3');

const serverAddress =  process.env.SERVER_ADDRESS;
const projectID = process.env.PROJECT_ID;
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;

let wallet = new ethers.Wallet(privateKey);
let signature;

const web3 = new Web3(new Web3.providers.HttpProvider(`https://kovan.infura.io/v3/${projectID}`));

const ethersSignTest = async function (hash) {
    let messageHashBytes = ethers.utils.arrayify(hash);
    let flatSig = await wallet.signMessage(messageHashBytes);

    let sig = ethers.utils.splitSignature(flatSig);

    console.log(` r is : ${sig.r} \n s is : ${sig.s} \n v is : ${sig.v}`);

    return sig
    
}

const newHashMsg = ethers.utils.solidityKeccak256(["uint256", "address", "address", "string", "uint256"], [0, serverAddress, contractAddress, "exampleURI", 1]);

ethersSignTest(newHashMsg);