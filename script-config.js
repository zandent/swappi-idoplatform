const ethers = require("ethers");
const { BigNumber } = require("@ethersproject/bignumber");
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

  idoplatformAddr: "0x76d0Ea17B1A727F718832dc1Ba52574B0c8269aF", //mainnet 0x76d0Ea17B1A727F718832dc1Ba52574B0c8269aF, testnet 0x336c47d196abf4a3be1e615dbc7776d0de5eff6a
  newTokenAddr: "0xFE197E7968807B311D476915DB585831B43A7E3b",
  newTokenIDOID: '1',
  totalAmt: ethers.utils.parseEther('300000'), //  // Total supply for new token
  amt: ethers.utils.parseEther('3000'), // 10000000e18 // amount to sell in IDO * its decimals()
  ratioForLP: '0',
  priceForLP: '0',
  // privateSpecs    [Threshold, amount * its decimals(), price, start time, end time, NFT holder Threshold, max amount for regular user]
  // Sun Feb 05 2023 08:00:00 GMT-0500 (Eastern Standard Time) to Tue Feb 07 2023 08:00:00 GMT-0500 (Eastern Standard Time)
  privateSpecs: [ethers.utils.parseEther('10'), ethers.utils.parseEther('3000'), ethers.utils.parseEther('35'), 1675602000, 1675774800, ethers.utils.parseEther('1'), ethers.utils.parseEther('40')],
  // publicspecs    [price, end time]
  publicSpecs: [ethers.utils.parseEther('45'), 1675861200], //Wed Feb 08 2023 08:00:00 GMT-0500 (Eastern Standard Time)
  tokenProjectName: "Nucleon",
  whitelist: [
    "0x282aA9091b7628319DF2098cdefeE8f5D4Bd3384",
    "0x57BC77Bbf9105C3Abc8826D8Cc876072146Fb586",
    "0x922cacFe7Ec8983E5bd09c7faa50FE4148362324",
    "0x651c9d53C49b58dB0E182Cc14eA4268365812FD9",
    "0xDCD949fFe1F5A7e6a6A989cBEcA1e55367c28868",
    "0xF9194E38ED53F9FBa079fc96d8de16374dC3EB7f",
    "0x29c68FE604fFf20Bb72355f4fce0C1fEB466B0F6",
    "0xBD8f433C97FbeE1dD589A4E55822E04531EAe094",
    "0xb11aa55764E039557f00FF027b6488f1617E4e43",
    "0x966A715F7B39eEC32f7D1d4156d9B7Cbf610d828",
    "0x1aFB5E13132010C420D1682091079cc487BF9819",
    "0xEd1c54a5d8F42859f6F822432DBd9ED7Bae8B452",
    "0x99e2f4d21A0D8D64A09C14F2383DaeF8cF125415",
    "0x2DdD320b50Ee1e5158AbDf7668649a24E4078cE0",
    "0x9171B3373cEe0cb21a46E3dd77146bBEBb01fbC9",
    "0x548AF1cCd9c4b0a90Db9d3479BfD324aebb85BDa",
    "0x64C84798089AA4DDE20F6447F6396c6e045e3d56",
    "0x86B5381717A4F7489E1a2dDE3AB3AC7441c11a80",
    "0xFD4339fdDf7D5146A95BF5be57E9550d1c69c4Be",
    "0x4f5456cd779486223aDfc2bdEe284B7407E6066a",
    "0x5867863C890b1484eBa2D14b5dD3eBc267590227",
    "0xB9402FdCcc49eB504AcC27A7176b8E109Cd34941",
    "0x6b75829c0A782Db923AE8B259E061928A43007F9",
    "0x9222c18253BF56EfaACcCCB2222818384d2f8F64",
    "0x5eDe6c5872D7a07Af291cb1a70Dd984D9b0A707D",
    "0x0750CcdFE33641fBc62D9ce342DCce4d1FB7064b",
    "0x04574F2a85ad5B24949f71450595fFE03B78FDf0",
    "0x0C96dfD9Ee841CdA37925cFBEeC2f2E2e77D1CAb",
    "0x27793f14c5adccaEca1f5ae938DF1c2e5a30fB77",
    "0x5EbC86737516b89608115E6f79A44643c6D648B1",
    "0xE5E018C2323B036360E1c426B79A223c3E39bFa1",
    "0x6e1cA96B719b0FA38765E35f4A2E628331ac7118",
    "0x4135b22fe13be623df56C445E47ED360e1E4609d",
    "0xa57D092a95A09C1c3E07CA3A54E927AC7F789d9d",
    "0x4618E075Dbda5720Bc9CAb941a188379f4D8De18",
    "0xcA7d6c57fF9765e7dd086e27c30D127cF0Ce2aAc",
    "0x017E625a8582f004d9Fd869eEBc0C702b5f8c623",
    "0x312641e616993Ed32b062056A993C61abc8E2F63",
    "0x0F91E781CA86b020d2B360AeC5C2492CDaf6C47d",
    "0x094e27Dd055e8c5656d0F8779BDFa34a7A9B0A16",
    "0x1746bd4284EbD07aCFa1fD146BfF0B8968aFfF0E",
    "0x1DcA17BB417C5820eFa9d0fD16242Cd7a00A8DC7",
    "0xc696ae33f0585bF7783126Df45f744BdfBfd6BFa",
    "0x1DdBbd9A301C3b1DAff74579283e90123727E4C4",
    "0x342DFb9BD710d5fcc318FD1e7d116E040213E8bd",
    "0x44D83f9A3214bBaa1BA1115ab16E592A92eB2787",
    "0x926C11036C1c99de44Ba98d9aeE3aA828911F3BE",
    "0x7DF91D3422e9aa0be067EE5CaB0e9e98ec0bdA65",
    "0xb4c9E9629fb7deD9b4C5952C8BB218909e087b54",
    "0x05aB23B9Ce109a02d169A6e0946Bfee26C781175",
    "0xe9bd3c1ad3F2fF1D14ECcd7De125090e8DDd79dE",
    "0xF7315380a2b0e8e5eddE19081244b0fD8B88eB5f",
    "0xd5c84e6Db3934e2Cc5604AfBc626906e3bf94430",
    "0xf260e030a79026C28355Fb9eE5fc0fC587d3CDD9",
    "0x5842B7Dc873AD09AfCB3b3F0139B3F2580e6335E",
    "0x806D9BD95aD298F7599C0b954757D6633D3cacFA",
    "0x612Ca1E884212AD94f0bcE73700bd8aaB69F6731",
    "0xb38E8e4d1CeBD52D56d1Cf250B963d73a7BF2E5C",
    "0xdcB111fdCd57cf4095312Aa72b5585d9DA5FB89b",
    "0x2C874E69526Df5F320E48D717A1Ee7c678f57CB5",
    "0x8b6D3e08ACA146457b6BBea882D14b4c80db5B61",
    "0xaC758ee4C8b6Cacc27C34d9fe7c2Dcfc63Cd5E46",
    "0x92370f251609751FbAC87709045A7B21A8c13C0a",
    "0xa47D5007aa6bfa2191Eb178C91BBe341EceC226b",
    "0xC221bC5B1BcB0027C30eC4ce53B8dF5282012272",
    "0xe6d74BA1DF8679457a978c782873D4a81cdCb3BC",
    "0xCBc551eA82a9B326d753cBb8D26765afB52aEbD9",
    "0x35707EdF1941809dbE887C6813BED6E436210AfB",
    "0x1a135B4B14905477f81009BA799D1235Ec31cBD5",
    "0x8B93522FcE28f19b531cB48809607BaE8f1Cc2E1",
    "0x3a4E4771cDE0b740266E854Ad82cCe8Dea6130Bc"
    ],
  maxAmountInWhitelist: [
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('40'),
    ethers.utils.parseEther('20'),
    ethers.utils.parseEther('20'),
    ethers.utils.parseEther('20')
],

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
