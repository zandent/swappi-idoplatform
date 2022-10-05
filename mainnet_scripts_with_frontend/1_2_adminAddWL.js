const { BigNumber } = require("ethers");
const config = require('../script-config.js');
const specs = config.specs;
let addresses = require('../scripts/'+specs.mainNetFileName);
let PPIToken       = specs.PPIToken     ;
let SwappiNFT      = specs.SwappiNFT    ;
let VotingEscrow   = specs.VotingEscrow ;
let SwappiRouter   = specs.SwappiRouter ;
let SwappiFactory  = specs.SwappiFactory;
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
  const [admin, tokenOwner] = await ethers.getSigners();
  let newTokenContract = new ethers.Contract(newTokenAddr, PPIToken.abi, tokenOwner);
  let idoplatformContract = new ethers.Contract(idoplatformAddr, idoplatformJSON.abi, admin);  
  if (whitelist.length != 0) {
    for (let i = 0; i < parseInt((whitelist.length+100)/100); i++) {
      let tx = await idoplatformContract.adminAddWhitelist(newTokenContract.address, whitelist.slice(i*100, Math.min(i*100 + 100, whitelist.length)), maxAmountInWhitelist.slice(i*100, Math.min(i*100 + 100, whitelist.length)), {gasLimit: specs.OneMillionGasLimit,});
      await tx.wait();
      console.log(`>> ✅ Done for adminAddWhitelist from index ${i*100} to ${Math.min(i*100 + 100, whitelist.length)}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });