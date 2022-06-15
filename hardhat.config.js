require("@nomiclabs/hardhat-waffle");

const privateKey = "0x2a77751e7a5b4f6e0e5357779cf46fff745c7a70f0806ccc61f499372d13facf";
const buyer1Key = "0x02d4cb4c0b97fb2ba107e704a4176a025ba885fea583a7677342b351aeca7b79";
const buyer2Key = "0xc96290c3a414f10ccc0dcc3bee04ab30484575fcbbf91b6f2b993bbc21beb1de";
const tokenOwnerKey = "0x03e8ab6a6405baa5ebd9cc185f2a1b65623c6ee3e734716ba01021f08f0ba4b2";
const buyer0Key = "0x82e2bb8a09fdc87bc73329936433370b3b7edd79aa898bbbe7a6d0592f1cb12c";
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.2",
  networks: {
    testnet: {
      url: "https://evmtestnet.confluxrpc.com",
      accounts: [
        privateKey,
        buyer1Key,
        buyer2Key,
        tokenOwnerKey,
        buyer0Key
      ]
    }
  }
};
