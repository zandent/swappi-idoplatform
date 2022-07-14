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
  mainNetPrivateKey: '2d62a9167c8905f8c6e4db6292e6a7a1b73523c26cb6c78e6444058a6dfcd91a',
  mainNetTokenOwnerKey: "0x0234567890123456789012345678901234567890123456789012345678901234",//optional
  privateKey: "0x2a77751e7a5b4f6e0e5357779cf46fff745c7a70f0806ccc61f499372d13facf",
  buyer1Key: "0x02d4cb4c0b97fb2ba107e704a4176a025ba885fea583a7677342b351aeca7b79",
  buyer2Key: "0xc96290c3a414f10ccc0dcc3bee04ab30484575fcbbf91b6f2b993bbc21beb1de",
  tokenOwnerKey: "0x03e8ab6a6405baa5ebd9cc185f2a1b65623c6ee3e734716ba01021f08f0ba4b2",
  buyer0Key: "0x82e2bb8a09fdc87bc73329936433370b3b7edd79aa898bbbe7a6d0592f1cb12c",
  buyer3Key: "0x312c32744fb9b72464e8f9f48dd24bac82053f1dfb49f4369a939afc2145208e",
  buyer4Key: "0x78437d1d5238f999d16725a006b800e48cdecf4de52c3060b7af46c08ce79c24",

  idoplatformAddr: "0x258fdE8ae0872CcAE47C0ACfADB0e73E66daF6c6",
  newTokenAddr: "0x34F695EAA2098284999027304249bc64bbb32138",
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
