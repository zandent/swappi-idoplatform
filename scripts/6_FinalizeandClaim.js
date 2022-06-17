let PPIToken = require(`../test/PPIToken.sol/PPIToken.json`);
let SwappiNFT = require(`../test/SwappiNFT.sol/SwappiNFT.json`);
let VotingEscrow = require(`../test/VotingEscrow.sol/VotingEscrow.json`);
let SwappiRouter = require(`../test/SwappiRouter.sol/SwappiRouter.json`);
let SwappiFactory = require(`../test/SwappiFactory.sol/SwappiFactory.json`);
let NFTAddr = "0x873069890624Fe89A40DD39287e26bD9339B0f67";
const addresses_file = "./contractAddressPublicTestnet.json";
let addresses = require(`${addresses_file}`);
let idoplatformJSON = require(`../artifacts/contracts/idoplatform.sol/idoplatform.json`);
let idoplatformAddr = "0x5D4c0D3F60178714d7029d084b7aa7bC5f60CBF7";
let newTokenAddr = "0x49725acb75D2e105323E4b0273a43EF417ACbec1";
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
  let currentIDOID = await idoplatformContract.getCurrentIDOIdByTokenAddr(newTokenContract.address);
  await idoplatformContract.connect(buyer2).claimAllTokens(newTokenContract.address, currentIDOID, {gasLimit: 10000000,});
  await idoplatformContract.connect(buyer1).claimAllTokens(newTokenContract.address, currentIDOID, {gasLimit: 10000000,});
  await idoplatformContract.connect(buyer0).claimAllTokens(newTokenContract.address, currentIDOID, {gasLimit: 10000000,});
  //balance Check
  await delay(10000);
  console.log("Token owner owns:", (await newTokenContract.balanceOf(tokenOwner.address)).toString());
  console.log("buyer0 owner owns:", (await newTokenContract.balanceOf(buyer0.address)).toString());
  console.log("buyer1 owner owns:", (await newTokenContract.balanceOf(buyer1.address)).toString());
  console.log("buyer2 owner owns:", (await newTokenContract.balanceOf(buyer2.address)).toString());

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });