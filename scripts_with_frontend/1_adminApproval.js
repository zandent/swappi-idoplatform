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
async function main() {
  const [admin, buyer1, buyer2, tokenOwner, buyer0] = await ethers.getSigners();
  let PPITokenContract = new ethers.Contract(addresses.PPI, PPIToken.abi, buyer1);
  let veTokenContract = new ethers.Contract(addresses.VotingEscrow, VotingEscrow.abi, buyer1);
  let newTokenContract = new ethers.Contract(newTokenAddr, PPIToken.abi, tokenOwner);
  let idoplatformContract = new ethers.Contract(idoplatformAddr, idoplatformJSON.abi, admin);

  // // getting timestamp
  // var blockNumBefore = await ethers.provider.getBlockNumber();
  // var blockBefore = await ethers.provider.getBlock(blockNumBefore);
  // var timestampBefore = blockBefore.timestamp;
  // privateSpecs[3] = timestampBefore + privateSpecs[3];
  // privateSpecs[4] = timestampBefore + privateSpecs[4];
  // publicSpecs[1]  = timestampBefore + publicSpecs[1];
  console.log(`Private sale start: ${new Date(privateSpecs[3]*1000)} \n public sale start: ${new Date(privateSpecs[4]*1000)} \n All end at: ${new Date(publicSpecs[1]*1000)}`);
  
  await idoplatformContract.adminApproval(newTokenContract.address, specs.tokenProjectName, amt, ratioForLP, priceForLP, privateSpecs, publicSpecs, {gasLimit: specs.OneMillionGasLimit,});
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });