/** 
* @dev this will use newer hardhat-deploy plugin
* but can always go back to base deploy scripts later
*/

const {ethers} = require("ethers");

module.exports = async ({getNamedAccounts, deployments}) => {
    const { deploy } = deployments;
    const { deployer } = getNamedAccounts();
    const { DEPLOYER_PRIVATE_KEY, DEV_ADDRESS } = process.env;

    const interestRateModel = await deploy("MysoInterestRateModel", {
        from: DEPLOYER_PRIVATE_KEY,
        log: true,
      });

    const implementationPool =  await deploy("MysoPool", {
        from: DEPLOYER_PRIVATE_KEY,
        log: true,
      });

    const implementationToken =  await deploy("MysoWrappedToken", {
      from: DEPLOYER_PRIVATE_KEY,
      log: true,
    });
    

    const factory = await deploy("MysoFactoryClones", {
        from: DEPLOYER_PRIVATE_KEY,
        args: [
            implementationPool.address,
            implementationToken.address,
            DEV_ADDRESS,
        ],
        log: true,
      });

    const optionToken = await deploy("MysoOptionERC1155", {
      from: DEPLOYER_PRIVATE_KEY,
      args: [
        factory.address        
      ],
      log: true,
    });
}

/*hardhat-deploy docs mention these, might not use*/
module.exports.tags = [];