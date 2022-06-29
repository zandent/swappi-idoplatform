const config = require('../script-config.js');
const specs = config.specs;
let NFTAddr = specs.mainnetNFTAddr;
let addresses = require('./'+specs.mainNetFileName);
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance before:", (await deployer.getBalance()).toString());
    //Deploy idoplatform
    const factory  = await ethers.getContractFactory("idoplatform");
    idoplatformContract = await factory.deploy(addresses.PPI, NFTAddr, addresses.SwappiRouter, addresses.SwappiFactory, addresses.WCFX, addresses.VotingEscrow);
    await idoplatformContract.deployed();
    console.log("Contract address:", idoplatformContract.address);
    console.log("Account balance after:", (await deployer.getBalance()).toString());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });