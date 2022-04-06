const expect = require("chai").expect;
const starknet = require("hardhat").starknet;

let owner;
let user;

let verifyContract;

async function deployAccounts() {
    owner = await starknet.deployAccount("OpenZeppelin");
    console.log(`Owner account deploy at ${owner.starknetContract.address}`);

}
async function deployVerify() {
    const contractFactory = await starknet.getContractFactory("Verify");
    const serverAddress = BigInt(process.env.SERVER_STARKNET_FELT);
    verifyContract = await contractFactory.deploy({
        curr_server_address: serverAddress, /// server address here
    });
    console.log(`InsuranceDAO deployed at: ${verifyContract.address}`);
}

describe("Verify", async () => {
    before(async () => {
        await deployAccounts();
        await deployVerify();
    });

    it("should verify message", async () => {
        const ipfs_uri = {high : 0, low : 50};
        const timestamp = {high : 0, low: 100};
        const r = BigInt('2895877069241798757582833251888805697674030939643759834747299699657973171719') //insert r
        const s = BigInt('2710638004168843898752684846203205092807688966778054781136406598176482428807') //insert s
        await owner.invoke(verifyContract, "meta_data_verify", {
            address : 100,
            level : 0,
            ipfs_uri : ipfs_uri,
            timestamp : timestamp,
            sig_r : r,
            sig_s : s
        });
        console.log(`verified successfully`);
    });
});