const { BigNumber } = require("ethers");
const config = require('../script-config.js');
const specs = config.specs;
let addresses = require('./'+specs.testNetFileName);
let PPIToken       = specs.PPIToken     ;
let SwappiNFT      = specs.SwappiNFT    ;
let VotingEscrow   = specs.VotingEscrow ;
let SwappiRouter   = specs.SwappiRouter ;
let SwappiFactory  = specs.SwappiFactory;
let amt = specs.amt;
let ratioForLP = specs.ratioForLP;
let amtIncludingLP = (BigNumber.from(amt).mul(100+ratioForLP).div(100)).toHexString();// amt * (1+ratioForLP%)
let totalAmt = specs.totalAmt;
let priceForLP = specs.priceForLP;
let privateSpecs = specs.privateSpecs;
let publicSpecs = specs.publicSpecs;
async function main() {
    const [admin, buyer1, buyer2, tokenOwner] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", tokenOwner.address);
    console.log("Account balance before:", (await tokenOwner.getBalance()).toString());
    //Deploy new token
    const factory3  = new ethers.ContractFactory(PPIToken.abi, PPIToken.bytecode, tokenOwner);
    tokenContract = await factory3.deploy();
    await tokenContract.deployed();
    console.log("New token Contract address:", tokenContract.address);
    await tokenContract.mint(tokenOwner.address, totalAmt);
    await config.delay(10000);
    console.log("Address:", tokenOwner.address, " has balance of new token:", (await tokenContract.balanceOf(tokenOwner.address)).toString());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });