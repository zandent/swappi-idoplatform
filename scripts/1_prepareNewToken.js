let PPIToken = require(`../test/PPIToken.sol/PPIToken.json`);
function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
async function main() {
    let amt = 10000000;
    let ratioForLP = 20;
    let totalAmt = 20000000;
    let priceForLP = 2;
    // privateSpecs    [Threshold, amount, price]
    let privateSpecs = [200, 5000000, 2];
    // publicspecs    [price]
    let publicSpecs = [3];
    let maxAmtPerBuyer = 10000;
    const [admin, buyer1, buyer2, tokenOwner] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", tokenOwner.address);
  
    console.log("Account balance before:", (await tokenOwner.getBalance()).toString());
  
    //Deploy new token
    const factory3  = new ethers.ContractFactory(PPIToken.abi, PPIToken.bytecode, tokenOwner);
    tokenContract = await factory3.deploy();
    await tokenContract.deployed();
    console.log("New token Contract address:", tokenContract.address);
    await tokenContract.mint(tokenOwner.address, totalAmt);
    await delay(10000);
    console.log("Address:", tokenOwner.address, " has balance of new token:", (await tokenContract.balanceOf(tokenOwner.address)).toString());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
//new token address deployed: 0x811363AB00d1d2c0c3094a4403be2dC7D8a90574