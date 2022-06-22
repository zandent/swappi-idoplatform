require("@nomiclabs/hardhat-waffle");
const config = require('./script-config.js');
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.2",
  networks: {
    testnet: {
      url: config.specs.testNetUrl,
      accounts: [
        config.specs.privateKey,
        config.specs.buyer1Key,
        config.specs.buyer2Key,
        config.specs.tokenOwnerKey,
        config.specs.buyer0Key
      ]
    },
    mainnet: {
      url: config.specs.mainNetUrl,
      accounts: [
        config.specs.mainNetPrivateKey
      ]
    }
  }
};
