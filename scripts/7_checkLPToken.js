const { BigNumber } = require("ethers");
const config = require('../script-config.js');
const specs = config.specs;
let addresses = require('./'+specs.testNetFileName);
let PPIToken       = specs.PPIToken     ;
let SwappiNFT      = specs.SwappiNFT    ;
let VotingEscrow   = specs.VotingEscrow ;
let SwappiRouter   = specs.SwappiRouter ;
let SwappiFactory  = specs.SwappiFactory;
let SwappiPair     = specs.SwappiPair;
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
  const [admin, buyer1, buyer2, tokenOwner, buyer0] = await ethers.getSigners();
  let PPITokenContract = new ethers.Contract(addresses.PPI, PPIToken.abi, buyer1);
  let veTokenContract = new ethers.Contract(addresses.VotingEscrow, VotingEscrow.abi, buyer1);
  let newTokenContract = new ethers.Contract(newTokenAddr, PPIToken.abi, tokenOwner);
  let idoplatformContract = new ethers.Contract(idoplatformAddr, idoplatformJSON.abi, admin);
  let swappiFactoryContract = new ethers.Contract(addresses.SwappiFactory, SwappiFactory.abi, admin);
  let LPAddr = await swappiFactoryContract.getPair(newTokenAddr, addresses.WCFX, {gasLimit: specs.OneMillionGasLimit,});
  console.log("LP Address:", LPAddr);
  let SwappiPairContract = new ethers.Contract(LPAddr, SwappiPair.abi, admin);
  let LPTokenAmt = await SwappiPairContract.balanceOf(tokenOwner.address, {gasLimit: specs.OneMillionGasLimit,});
  console.log("Token owner has balance in LP:", LPTokenAmt.toString());

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });