const specs = {
  testNetFileName: 'contractAddressPublicTestnet.json',
  testNetUrl: 'http://evmtestnet.confluxrpc.com',
  mainNetName: 'contractAddressPublicMainnet.json',
  mainNetUrl: 'http://evm.confluxrpc.com',
  mainNetPrivateKey: '0x1234567890123456789012345678901234567890123456789012345678901234',
  privateKey: "0x2a77751e7a5b4f6e0e5357779cf46fff745c7a70f0806ccc61f499372d13facf",
  buyer1Key: "0x02d4cb4c0b97fb2ba107e704a4176a025ba885fea583a7677342b351aeca7b79",
  buyer2Key: "0xc96290c3a414f10ccc0dcc3bee04ab30484575fcbbf91b6f2b993bbc21beb1de",
  tokenOwnerKey: "0x03e8ab6a6405baa5ebd9cc185f2a1b65623c6ee3e734716ba01021f08f0ba4b2",
  buyer0Key: "0x82e2bb8a09fdc87bc73329936433370b3b7edd79aa898bbbe7a6d0592f1cb12c",

  NFTAddr: "0x873069890624Fe89A40DD39287e26bD9339B0f67",
  idoplatformAddr: "0x22618C0F09464d5EE27824238f9b3836dFb19212",
  newTokenAddr: "0x6736E85129aB39e274b8443ca6d145ea2a38fBe9",

  amt: '10000000000000000000000000', // 10000000e18
  ratioForLP: 20,
  totalAmt: '20000000000000000000000000', // 20000000e18
  priceForLP: 2,
  // privateSpecs    [Threshold, amount, price, start time offset from current time, end time offset from current time]
  privateSpecs: [200, '5000000000000000000000000', 2, 60, 120], // 5000000e18
  // publicspecs    [price, end time offset from current time]
  publicSpecs: [3, 180],
  tokenProjectName: "BrandNewToken",
  //Purchase: [amt to buy, cfx value]
  buyer0FirstPurchase: ["100000000000000000000", "200"],
  buyer0SecondPurchase: ["200000000000000000000", "400"],
  buyer1FirstPurchase: ["20000000000000000000000", "40000"],
  buyer1SecondPurchase: ["40000000000000000000000", "80000"],
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
