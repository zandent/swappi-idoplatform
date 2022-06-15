let NFTAddr = "0x873069890624Fe89A40DD39287e26bD9339B0f67";
async function main() {
    const addresses_file = "./contractAddressPublicTestnet.json";
    let addresses = require(`${addresses_file}`);
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
//idoplatformContract deployed: 0xd2715894c58859310C948d3BD47eB26f7819Fef3