const { BigNumber } = require("ethers");
const config = require('../script-config.js');
const specs = config.specs;
let addresses = require('./'+specs.testNetFileName);
let PPIToken       = specs.PPIToken     ;
let SwappiNFT      = specs.SwappiNFT    ;
let VotingEscrow   = specs.VotingEscrow ;
let SwappiRouter   = specs.SwappiRouter ;
let SwappiFactory  = specs.SwappiFactory;
let NFTAddr = specs.NFTAddr;
let idoplatformJSON = specs.idoplatformJSON;
let idoplatformAddr = specs.idoplatformAddr;
let newTokenAddr = specs.newTokenAddr;
let amt = specs.amt;
let ratioForLP = specs.ratioForLP;
let amtIncludingLP = (BigNumber.from(amt).mul(100+ratioForLP).div(100)).toHexString();// amt * (1+ratioForLP%)
let totalAmt = specs.totalAmt;
let priceForLP = specs.priceForLP;
let privateSpecs = specs.privateSpecs;
let publicSpecs = specs.publicSpecs;
async function main() {
  const [admin, buyer1, buyer2, tokenOwner, buyer0, buyer3, buyer4] = await ethers.getSigners();
  let PPITokenContract = new ethers.Contract(addresses.PPI, PPIToken.abi, buyer1);
  let veTokenContract = new ethers.Contract(addresses.VotingEscrow, VotingEscrow.abi, buyer1);
  let newTokenContract = new ethers.Contract(newTokenAddr, PPIToken.abi, tokenOwner);
  let idoplatformContract = new ethers.Contract(idoplatformAddr, idoplatformJSON.abi, admin);
  //buyer0 buy
  await idoplatformContract.connect(buyer0).privateSale(newTokenContract.address, specs.buyer0FirstPurchase[0], {gasLimit: specs.OneMillionGasLimit, value: specs.buyer0FirstPurchase[1]});
  await idoplatformContract.connect(buyer0).privateSale(newTokenContract.address, specs.buyer0SecondPurchase[0], {gasLimit: specs.OneMillionGasLimit, value: specs.buyer0SecondPurchase[1]});
  //buyer1 buy
  await idoplatformContract.connect(buyer1).privateSale(newTokenContract.address, specs.buyer1FirstPurchase[0], {gasLimit: specs.OneMillionGasLimit, value: specs.buyer1FirstPurchase[1]});
  await idoplatformContract.connect(buyer1).privateSale(newTokenContract.address, specs.buyer1SecondPurchase[0], {gasLimit: specs.OneMillionGasLimit, value: specs.buyer1SecondPurchase[1]});

  await idoplatformContract.connect(buyer3).privateSale(newTokenContract.address, specs.buyer3FirstPurchase[0], {gasLimit: specs.OneMillionGasLimit, value: specs.buyer3FirstPurchase[1]});
  await idoplatformContract.connect(buyer3).privateSale(newTokenContract.address, specs.buyer3SecondPurchase[0], {gasLimit: specs.OneMillionGasLimit, value: specs.buyer3SecondPurchase[1]});

  await idoplatformContract.connect(buyer4).privateSale(newTokenContract.address, specs.buyer4FirstPurchase[0], {gasLimit: specs.OneMillionGasLimit, value: specs.buyer4FirstPurchase[1]});
  await idoplatformContract.connect(buyer4).privateSale(newTokenContract.address, specs.buyer4SecondPurchase[0], {gasLimit: specs.OneMillionGasLimit, value: specs.buyer4SecondPurchase[1]});
  //balance Check
  await config.delay(15000);
  let currentIDOID = await idoplatformContract.getCurrentIDOIdByTokenAddr(newTokenContract.address);
  console.log("Total CFX collected:", (await idoplatformContract.getAmtOfCFXCollected(newTokenContract.address, currentIDOID)).toString());

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });