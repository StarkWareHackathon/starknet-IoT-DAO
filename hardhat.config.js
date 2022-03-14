require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-solhint");
require("hardhat-prettier");
require("hardhat-gas-reporter");
require("dotenv").config();
require("hardhat-deploy");
import "@shardlabs/starknet-hardhat-plugin";
import "@nomiclabs/hardhat-ethers";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const {INFURA_ID, DEPLOYER_PRIVATE_KEY} = process.env;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  starknet: {
    //dockerizedVersion: "0.7.1", // alternatively choose one of the two venv options below
    // uses (my-venv) defined by `python -m venv path/to/my-venv`
    // venv: "path/to/my-venv",

    // uses the currently active Python environment (hopefully with available Starknet commands!)
    venv: "active",
    network: "alpha",
    wallets: {
      OpenZeppelin: {
        accountName: "OpenZeppelin",
        modulePath: "starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount",
        accountPath: "~/.starknet_accounts"
      }
    }
  },
  defaultNetwork : "hardhat",
  networks : {
    devnet: {
      url: "http://localhost:5000"
    },
    hardhat : {
      chainId : 1337
    },
    localhost : {
      url : "http:localhost:8545"
    },
    mumbai : {
      url: "https://rpc-mumbai.matcivigil.com",
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId : 80001
    },
    kovan : {
      url : INFURA_ID ? `https://kovan.infura.io/v3/${INFURA_ID}` : ``,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId : 42
    },
    rinkeby : {
      url : INFURA_ID ? `https://rinkeby.infura.io/v3/${INFURA_ID}` : ``,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId : 4
    }
  },
  solidity: "0.8.11",
  etherscan: {
    apiKey : `${process.env.ETHERSCAN_API_KEY}`
  }
};
