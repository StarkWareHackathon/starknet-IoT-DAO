//@ts-check

const fs = require("fs");

// Install the latest version of starknet with npm install starknet@next and import starknet
const {
  Contract,
  defaultProvider,
  ec,
  encode,
  hash,
  json,
  number,
  stark,
} = require("starknet");

const args = process.argv
const accountAddr = args[2]

//0x07f5ed1b71b101d046244ba6703a3bae5cfb2a5b34af4a841537f199974406d9

console.log("Reading DAO Contract...");
const compiledDAO = json.parse(
  fs.readFileSync("./artifacts/InsuranceDAOMintComp.json").toString("ascii")
);

console.log("Reading NFT Contract...");
const compiledNFT = json.parse(
  fs.readFileSync("./artifacts/InsuranceNFT.json").toString("ascii")
);

const main = async () =>{
// Deploy an ERC20 contract and wait for it to be verified on StarkNet.
console.log("Deployment Tx - DAO Contract to StarkNet...");
const daoResponse = await defaultProvider.deployContract({
  contract: compiledDAO,
  constructorCalldata: ['20', `${accountAddr}`, '2', '1349480306', '5796811614974471781']
});

// Wait for the deployment transaction to be accepted on StarkNet
console.log(`Waiting for Tx to be Accepted on Starknet - DAO Deployment...${daoResponse.address}`);
await defaultProvider.waitForTransaction(daoResponse.transaction_hash);

// Get the erc20 contract address
const daoAddress = daoResponse.address;
console.log(`dao address: ${daoAddress}`)

console.log("Deployment Tx - NFTContract to StarkNet...");
const nftResponse = await defaultProvider.deployContract({
  contract: compiledNFT,
  constructorCalldata: ['381295704707908511112352986844521317', '314863540297', '1', '140152554740597502879502332212244787760', '20',`${daoAddress}`]
});

// Wait for the deployment transaction to be accepted on StarkNet
console.log(`Waiting for Tx to be Accepted on Starknet - NFT Deployment...${nftResponse.address}`);
await defaultProvider.waitForTransaction(nftResponse.transaction_hash);

// Get the erc20 contract address
const nftAddress = nftResponse.address;
console.log(`nft address: ${nftAddress}`)

}
//const daoInstance = new Contract(compiledDAO.abi, daoAddress);

// Set label
/*console.log(`Invoke Tx - set label...`);
const { transaction_hash: mintTxHash } = await daoInstance.set_cost_schedule(
  "2",
  "100",
  "0",
  "1000",
  "0",
  "2",
  "3",
  "8"
);

// Wait for the invoke transaction to be accepted on StarkNet
console.log(`Waiting for Tx to be Accepted on Starknet - label set ...`);
await defaultProvider.waitForTransaction(mintTxHash);*/

/*
// Mint 1000 tokens to accountContract address
console.log(`Invoke Tx - Minting 1000 tokens to ${accountContract.address}...`);
const { transaction_hash: mintTxHash } = await erc20.mint(
  accountContract.address,
  "1000"
);

// Wait for the invoke transaction to be accepted on StarkNet
console.log(`Waiting for Tx to be Accepted on Starknet - Minting...`);
await defaultProvider.waitForTransaction(mintTxHash);

// Check balance - should be 1000
console.log(`Calling StarkNet for accountContract balance...`);
const balanceBeforeTransfer = await erc20.balance_of(accountContract.address);

console.log(
  `accountContract Address ${accountContract.address} has a balance of:`,
  number.toBN(balanceBeforeTransfer.res, 16).toString()
);

// Get the nonce of the account and prepare transfer tx
console.log(`Calling StarkNet for accountContract nonce...`);
const nonce = (await accountContract.call("get_nonce")).nonce.toString();
const calls = [
  {
    contractAddress: erc20Address,
    entrypoint: "transfer",
    calldata: [erc20Address, "10"],
  },
];
const msgHash = hash.hashMulticall(accountContract.address, calls, nonce, "0");

const { callArray, calldata } = transformCallsToMulticallArrays(calls);

// sign tx to transfer 10 tokens
const signature = ec.sign(starkKeyPair, msgHash);

// Execute tx transfer of 10 tokens
console.log(`Invoke Tx - Transfer 10 tokens back to erc20 contract...`);
const { transaction_hash: transferTxHash } = await accountContract.__execute__(
  callArray,
  calldata,
  nonce,
  signature
);

// Wait for the invoke transaction to be accepted on StarkNet
console.log(`Waiting for Tx to be Accepted on Starknet - Transfer...`);
await defaultProvider.waitForTransaction(transferTxHash);

// Check balance after transfer - should be 990
console.log(`Calling StarkNet for accountContract balance...`);
const balanceAfterTransfer = await erc20.balance_of(accountContract.address);

console.log(
  `accountContract Address ${accountContract.address} has a balance of:`,
  number.toBN(balanceAfterTransfer.res, 16).toString()
);*/


main()