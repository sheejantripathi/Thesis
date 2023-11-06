const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();
const { INFURA_API_KEY, MNEMONIC } = process.env;


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(MNEMONIC, INFURA_API_KEY),
      network_id: 11155111,       // sepolia's network id
      chain_id: 11155111,         // sepolia's chain id
      gas: 5500000,        // Gas limit used for deploys.
      confirmations: 2,    // # of confirmations to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets)
    },  
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    }
  },
  compilers: {
    solc:{
      version:"0.8.19"
    }
  }
};

