require("@nomiclabs/hardhat-waffle");

let privateKey = process.env.PRIVATE_KEY;
if (typeof(privateKey) == "undefined") {
  privateKey = "0x1234567890123456789012345678901234567890123456789012345678901234";
}
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.2",
  networks: {
    testnet: {
      url: "https://evmtestnet.confluxrpc.com",
      accounts: [
        privateKey
      ]
    }
  }
};
