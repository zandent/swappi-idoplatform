const specs = {
  testNetFileName: 'contractAddressPublicTestnet.json',
  // Mainnet file name
  mainNetFileName: 'contractAddressMainnet.json',
  testNetUrl: 'http://evmtestnet.confluxrpc.com',
  mainNetUrl: 'http://evm.confluxrpc.com',
  //Testnet NFT address
  NFTAddr: "0x76D50e98BB22D8d7534293F0091EBE3642537165",
  // Mainnet NFT address
  mainnetNFTAddr: "0xbbdba5043a73e87533b9378e58dea577a872dc04",
  mainNetPrivateKey: '0xDEADBEAFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF',
  mainNetTokenOwnerKey: "0xDEADBEAFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",//optional
  privateKey: "0xDEADBEAFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
  buyer1Key: "0xDEADBEAFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
  buyer2Key: "0xDEADBEAFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
  tokenOwnerKey: "0xDEADBEAFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
  buyer0Key: "0xDEADBEAFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
  buyer3Key: "0xDEADBEAFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
  buyer4Key: "0xDEADBEAFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",

  idoplatformAddr: "0x0C9c8B44c26ddF05b14bf720DA347132578d4943", //mainnet 0x3A550fBF9b7c3bA3D1FF4B3a2DdB74dF5333b9AD, testnet 0x336c47d196abf4a3be1e615dbc7776d0de5eff6a
  newTokenAddr: "0xe60C454cd7eD5c9937Ee2BEF68b7ea85988aC2Bc",
  newTokenIDOID: '1',
  totalAmt: '20000000000000000000000000', // 20000000e18 // Total supply for new token
  amt: '10000000000000000000000000', // 10000000e18 // amount to sell in IDO * its decimals()
  ratioForLP: '20',
  priceForLP: '2',
  // privateSpecs    [Threshold, amount * its decimals(), price, start time, end time, NFT holder Threshold, max amount for regular user]
  privateSpecs: ['400', '5000000000000000000000000', '2', 90, 150, '200', '90000000000000000000000'], // 5000000e18, 90000e18
  // publicspecs    [price, end time]
  publicSpecs: ['3', 210],
  tokenProjectName: "BrandNewToken",
  whitelist: ['0xBA3848F60aa42671DaAb44ECE9908Db0A6D04F28', '0x23A84653C261E584428a712144a0a4a77628dB20'],
  maxAmountInWhitelist: ['150000000000000000000000', '1000000000000000000000'], //150000, 1000

  //Purchase: [amt to buy, cfx value]
  //private sale
  buyer0FirstPurchase: ["100000000000000000000", "200"],
  buyer0SecondPurchase: ["200000000000000000000", "400"],
  buyer1FirstPurchase: ["20000000000000000000000", "40000"],
  buyer1SecondPurchase: ["40000000000000000000000", "80000"],
  buyer3FirstPurchase: ["150000000000000000000000", "300000"],
  buyer3SecondPurchase: ["1", "2"], //should fail
  buyer4FirstPurchase: ["10000000000000000000000", "20000"],
  buyer4SecondPurchase: ["80000000000000000000000", "160000"],
  //public sale
  buyer2Purchase: ["400000000000000000000", "1200"],

  OneMillionGasLimit: "1000000",
  TenMillionGasLimit: "10000000",
  PPIToken: require(`./test/PPIToken.sol/PPIToken.json`),
  SwappiNFT: require(`./test/SwappiNFT.sol/SwappiNFT.json`),
  VotingEscrow: require(`./test/VotingEscrow.sol/VotingEscrow.json`),
  SwappiRouter: require(`./test/SwappiRouter.sol/SwappiRouter.json`),
  SwappiFactory: require(`./test/SwappiFactory.sol/SwappiFactory.json`),
  SwappiPair: require(`./test/SwappiPair.sol/SwappiPair.json`),
  idoplatformJSON: require(`./artifacts/contracts/idoplatform.sol/idoplatform.json`),
};

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
};

module.exports = {
  specs,
  delay,
};
