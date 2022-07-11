const config = require('../script-config.js');
const specs = config.specs;
let addresses = require('./'+specs.testNetFileName);
let PPIToken       = specs.PPIToken     ;
let SwappiNFT      = specs.SwappiNFT    ;
async function main() {
    const [admin, buyer1, buyer2, tokenOwner, buyer0, buyer3, buyer4] = await ethers.getSigners();
  
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
    await PPITokenContract.connect(buyer4).approve(swappiNFTContract.address, 200, {gasLimit: 1000000,});
    await swappiNFTContract.connect(buyer4).mint({gasLimit: 1000000,});
    console.log("swappiNFT Contract address:", swappiNFTContract.address);
    console.log("wait 10 sec to confirm transaction");
    await config.delay(10000);
    console.log("Address:", buyer0.address, " has balance of new token:", (await swappiNFTContract.balanceOf(buyer0.address)).toString());
    console.log("Address:", buyer4.address, " has balance of new token:", (await swappiNFTContract.balanceOf(buyer4.address)).toString());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
// swappiNFT Contract address: 0x873069890624Fe89A40DD39287e26bD9339B0f67