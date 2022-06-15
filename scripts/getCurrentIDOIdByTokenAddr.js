let PPIToken = require(`../test/PPIToken.sol/PPIToken.json`);
let SwappiNFT = require(`../test/SwappiNFT.sol/SwappiNFT.json`);
let VotingEscrow = require(`../test/VotingEscrow.sol/VotingEscrow.json`);
let SwappiRouter = require(`../test/SwappiRouter.sol/SwappiRouter.json`);
let SwappiFactory = require(`../test/SwappiFactory.sol/SwappiFactory.json`);
let NFTAddr = "0x873069890624Fe89A40DD39287e26bD9339B0f67";
const addresses_file = "./contractAddressPublicTestnet.json";
let addresses = require(`${addresses_file}`);
let idoplatformJSON = require(`../artifacts/contracts/idoplatform.sol/idoplatform.json`);
let idoplatformAddr = "0xd2715894c58859310C948d3BD47eB26f7819Fef3";
let newTokenAddr = "0x811363AB00d1d2c0c3094a4403be2dC7D8a90574";
let amt = 10000000;
let ratioForLP = 20;
let totalAmt = 20000000;
let priceForLP = 2;
// privateSpecs    [Threshold, amount, price]
let privateSpecs = [200, 5000000, 2];
// publicspecs    [price]
let publicSpecs = [3];
function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
async function main() {
  const addresses_file = "./contractAddressPublicTestnet.json";
  let addresses = require(`${addresses_file}`);
  const [admin, buyer1, buyer2, tokenOwner, buyer0] = await ethers.getSigners();
  let PPITokenContract = new ethers.Contract(addresses.PPI, PPIToken.abi, buyer1);
  let veTokenContract = new ethers.Contract(addresses.VotingEscrow, VotingEscrow.abi, buyer1);
  let newTokenContract = new ethers.Contract(newTokenAddr, PPIToken.abi, tokenOwner);
  let idoplatformContract = new ethers.Contract(idoplatformAddr, idoplatformJSON.abi, admin);
  let totalCFX = await idoplatformContract.connect(admin).getCurrentIDOIdByTokenAddr(newTokenContract.address, {gasLimit: 1000000,});
  console.log("Current IDOID:", totalCFX.toString());

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });