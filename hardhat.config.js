require("dotenv").config();
require("@shardlabs/starknet-hardhat-plugin");

module.exports = {
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://localhost:5000",
    },
  },
  mocha: {
    starknetNetwork: "localhost",
    timeout: 300_000_000,
  },
  paths: {
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
    starknetSources: "./contracts",
    starknetArtifacts: "./starknet-artifacts",
  },
  starknet: {
    venv: "active",
  },
};