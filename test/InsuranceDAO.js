const expect = require("chai").expect;
const starknet = require("hardhat").starknet;

let owner;
let user;

let insuranceDAOContract;


async function deployAccounts() {
    owner = await starknet.deployAccount("OpenZeppelin");
    console.log(`Owner account deploy at ${owner.starknetContract.address}`);
    // user = await starknet.deployAccount("OpenZeppelin");
    // console.log(`Owner account deploy at ${user.starknetContract.address}`);

}
async function deployInsuranceDAO() {
    const contractFactory = await starknet.getContractFactory("InsuranceDAO");
    const ownerAddress = BigInt(owner.starknetContract.address);
    insuranceDAOContract = await contractFactory.deploy({
        verify_address: "222", /// verify contract address here
        owner: ownerAddress
    });
    console.log(`InsuranceDAO deployed at: ${insuranceDAOContract.address}`);
}

describe("InsuranceDAO", async () => {
    before(async () => {
        await deployAccounts();
        await deployInsuranceDAO();
    });

    it("should add penalities", async () => {
        await owner.invoke(insuranceDAOContract, "set_penalties", {
            levels: [5, 7],
            penalties: [5, 8]
        });

        console.log(`Penalties set successfully`);
    });
});