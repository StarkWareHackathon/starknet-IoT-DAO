const InsuranceNFT = artifacts.require("./InsuranceNFT.sol");
const Verify = artifacts.require("./Verify.sol");
const InsuranceDAO = artifacts.require("./InsuranceDAO.sol");

module.exports = async(deployer, network, accounts) => {
  let deployVerify = await deployer.deploy(Verify, "0xD122087c00A7edD7903D476587b46dB9fDC5B4C1");
  const contractVerify = await Verify.deployed();
  let deployInsuranceDAO = await deployer.deploy(InsuranceDAO, contractVerify.address);
  const contractDAO = await InsuranceDAO.deployed();
  let deployInsuranceNFT = await deployer.deploy(InsuranceNFT, contractVerify.address, contractDAO.address);
  const contractNFT = await InsuranceNFT.deployed();
  await contractDAO.setNFTContract(contractNFT.address);
  await contractVerify.setNFTAddress(contractNFT.address);
  await contractVerify.setDAOAddress(contractDAO.address);
};