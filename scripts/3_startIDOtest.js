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

  // getting timestamp
  var blockNumBefore = await ethers.provider.getBlockNumber();
  var blockBefore = await ethers.provider.getBlock(blockNumBefore);
  var timestampBefore = blockBefore.timestamp;
  console.log(`last block timestamp: ${new Date(timestampBefore*1000)}`);
  console.log(`Private sale start: ${new Date(timestampBefore*1000 + 300000)} public sale start: ${new Date(timestampBefore*1000 + 600000)} All end at: ${new Date(timestampBefore*1000 + 900000)}`);
  privateSpecs.push(timestampBefore + 300, timestampBefore + 600);
  publicSpecs.push(timestampBefore + 900);
  

  await idoplatformContract.adminApproval(newTokenContract.address, "BrandNewToken", amt, ratioForLP, priceForLP, privateSpecs, publicSpecs, {gasLimit: 1000000,});

  await newTokenContract.connect(tokenOwner).approve(idoplatformContract.address, amt * (100 + ratioForLP)/100, {gasLimit: 1000000,});
  await idoplatformContract.connect(tokenOwner).addIDOToken(newTokenContract.address, {gasLimit: 1000000,});

  //let buyer1 buy 2000/4= 500 veToken
  await PPITokenContract.connect(buyer1).approve(veTokenContract.address, 2000, {gasLimit: 1000000,});
  await veTokenContract.connect(buyer1).createLock(2000, timestampBefore + 31536000, {gasLimit: 1000000,});
  //let buyer2 buy 100/4= 25 veToken
  await PPITokenContract.connect(buyer2).approve(veTokenContract.address, 100, {gasLimit: 1000000,});
  await veTokenContract.connect(buyer2).createLock(100, timestampBefore + 31536000, {gasLimit: 1000000,});
  //balance Check
  await delay(10000);
  console.log("Address:", buyer1.address, " has balance of vetoken:", (await veTokenContract.balanceOf(buyer1.address)).toString());
  console.log("Address:", buyer2.address, " has balance of vetoken:", (await veTokenContract.balanceOf(buyer2.address)).toString());

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });