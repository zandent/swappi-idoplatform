const { BigNumber } = require("ethers");
const config = require('../script-config.js');
const specs = config.specs;
let addresses = require('../scripts/'+specs.testNetFileName);
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
let whitelist = specs.whitelist;
let maxAmountInWhitelist = specs.maxAmountInWhitelist;
async function main() {
  const [admin, buyer1, buyer2, tokenOwner, buyer0] = await ethers.getSigners();
  let newTokenContract = new ethers.Contract(newTokenAddr, PPIToken.abi, tokenOwner);
  let idoplatformContract = new ethers.Contract(idoplatformAddr, idoplatformJSON.abi, admin);
  console.log(`Private sale start: ${new Date(privateSpecs[3]*1000)} \n public sale start: ${new Date(privateSpecs[4]*1000)} \n All end at: ${new Date(publicSpecs[1]*1000)}`);
  
  await idoplatformContract.adminApproval(newTokenContract.address, specs.tokenProjectName, amt, ratioForLP, priceForLP, whitelist, maxAmountInWhitelist, privateSpecs, publicSpecs, {gasLimit: specs.OneMillionGasLimit,});
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });