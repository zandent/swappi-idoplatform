let PPIToken = require(`../test/PPIToken.sol/PPIToken.json`);
let SwappiNFT = require(`../test/SwappiNFT.sol/SwappiNFT.json`);
let VotingEscrow = require(`../test/VotingEscrow.sol/VotingEscrow.json`);
let SwappiRouter = require(`../test/SwappiRouter.sol/SwappiRouter.json`);
let SwappiFactory = require(`../test/SwappiFactory.sol/SwappiFactory.json`);
const addresses_file = "./contractAddressPublicTestnet.json";
let addresses = require(`${addresses_file}`);
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
    const [admin, buyer1, buyer2, tokenOwner, buyer0] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", admin.address);
  
    console.log("Account balance before:", (await buyer0.getBalance()).toString());

    let PPITokenContract = new ethers.Contract(addresses.PPI, PPIToken.abi, buyer0);
  
    //Deploy NFT
    const factory1  = new ethers.ContractFactory(SwappiNFT.abi, SwappiNFT.bytecode, admin);
    swappiNFTContract = await factory1.deploy("Swappi NFT Contract", "SwappiNFT", 1000, "https://aliyuncs.com/0", PPITokenContract.address, admin.address, 200);
    await swappiNFTContract.deployed();
    await swappiNFTContract.enableMint();
    await PPITokenContract.connect(buyer0).approve(swappiNFTContract.address, 200, {gasLimit: 1000000,});
    await swappiNFTContract.connect(buyer0).mint({gasLimit: 1000000,});
    console.log("swappiNFT Contract address:", swappiNFTContract.address);
    console.log("wait 10 sec to confirm transaction");
    await delay(10000);
    console.log("Address:", buyer0.address, " has balance of new token:", (await swappiNFTContract.balanceOf(buyer0.address)).toString());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
// swappiNFT Contract address: 0x873069890624Fe89A40DD39287e26bD9339B0f67