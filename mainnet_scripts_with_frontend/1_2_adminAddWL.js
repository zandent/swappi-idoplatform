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
const MAXNUMPEREACHCALL = 100;
async function main() {
  const [admin, tokenOwner] = await ethers.getSigners();
  let idoplatformContract = new ethers.Contract(idoplatformAddr, idoplatformJSON.abi, admin);  
  if (whitelist.length != 0) {
    for (let i = 0; i < parseInt((whitelist.length+MAXNUMPEREACHCALL-1)/MAXNUMPEREACHCALL); i++) {
      let tx = await idoplatformContract.adminAddWhitelist(newTokenAddr, whitelist.slice(i*MAXNUMPEREACHCALL, Math.min(i*MAXNUMPEREACHCALL + MAXNUMPEREACHCALL, whitelist.length)), maxAmountInWhitelist.slice(i*MAXNUMPEREACHCALL, Math.min(i*MAXNUMPEREACHCALL + MAXNUMPEREACHCALL, whitelist.length)), {gasLimit: specs.TenMillionGasLimit,});
      await tx.wait();
      console.log(`>> ✅ Done for adminAddWhitelist from index ${i*MAXNUMPEREACHCALL} to ${Math.min(i*MAXNUMPEREACHCALL + MAXNUMPEREACHCALL, whitelist.length)-1}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });