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

    it("should add penalties", async () => {
        const penalties = [5, 8];
        await owner.invoke(insuranceDAOContract, "set_penalties", {
            levels: [5, 7],
            penalties
        });
        const { array } = await insuranceDAOContract.call('get_penalty_levels');
        expect(penalties).to.eql(array.map(x => Number(x)));
        console.log(`Penalties set successfully`);
    });

    it("should set costs schedule", async () => {
        const costs = [{ high: 0, low: 5 }, { high: 0, low: 8 }];
        await owner.invoke(insuranceDAOContract, "set_cost_schedule", {
            costs,
            rating_breaks: [5, 7]
        });
        const { array } = await insuranceDAOContract.call('get_costs');
        expect(costs).to.eql(array.map(x => Number(x)));
        console.log(`Scheduled cost set successfully`);
    });
});