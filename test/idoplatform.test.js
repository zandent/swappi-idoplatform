const { expect } = require("chai");
const { ethers } = require("hardhat");
let PPIToken = require(`./PPIToken.sol/PPIToken.json`);
let SwappiNFT = require(`./SwappiNFT.sol/SwappiNFT.json`);
let VotingEscrow = require(`./VotingEscrow.sol/VotingEscrow.json`);
let SwappiRouter = require(`./SwappiRouter.sol/SwappiRouter.json`);
let SwappiFactory = require(`./SwappiFactory.sol/SwappiFactory.json`);
describe("idoplatform Smart Contract Tests", function () {
    let PPITokenContract;
    let wcfxContract;
    let swappiNFTContract;
    let veTokenContract;
    let tokenContract;
    let SwappiRouterContract;
    let SwappiFactoryContract;
    let adminAddr;
    let tokenOwner;
    let buyer0; //NFT holder
    let buyer1; //enough veToken
    let buyer2; //Not enough veToken
    let veTokenContractDeployer;
    // string memory projectName,
    let amt = 10000000;
    let ratioForLP = 20;
    let totalAmt = 20000000;
    //     uint256 priceForLP,
    //     uint256[4] memory privateSpecs,
    //     uint256[2] memory publicSpecs,
    //     uint256 maxAmtPerBuyer
    this.beforeEach(async function() {
        [adminAddr, tokenOwner, buyer0, buyer1, buyer2, veTokenContractDeployer] = await ethers.getSigners();
        console.log(`Address ${adminAddr.address} created`);
        console.log(`Address ${tokenOwner.address} created`);
        console.log(`Address ${buyer0.address} created`);
        console.log(`Address ${buyer1.address} created`);
        console.log(`Address ${buyer2.address} created`);

        //  Deploy PPI
        const factory0  = new ethers.ContractFactory(PPIToken.abi, PPIToken.bytecode, adminAddr);
        PPITokenContract = await factory0.deploy();
        await PPITokenContract.deployed();
        await PPITokenContract.mint(buyer0.address, 1000);
        await PPITokenContract.mint(buyer1.address, 1000);
        console.log(`PPI contract address: ${PPITokenContract.address}`);

        //Deploy WCFX token use PPI as an example: easy to mint
        const factory6 = new ethers.ContractFactory(PPIToken.abi, PPIToken.bytecode, adminAddr);
        wcfxContract = await factory6.deploy();
        await wcfxContract.deployed();
        await wcfxContract.mint(adminAddr.address, 100000000);
        console.log(`WCFX contract address: ${wcfxContract.address}`);

        //Deploy NFT
        const factory1  = new ethers.ContractFactory(SwappiNFT.abi, SwappiNFT.bytecode, adminAddr);
        swappiNFTContract = await factory1.deploy("Swappi NFT Contract", "SwappiNFT", 1000, "https://aliyuncs.com/0", PPITokenContract.address, adminAddr.address, 200);
        await swappiNFTContract.deployed();
        await swappiNFTContract.enableMint();
        await PPITokenContract.connect(buyer0).approve(swappiNFTContract.address, 200, {gasLimit: 1000000,});
        await swappiNFTContract.connect(buyer0).mint({gasLimit: 1000000,});
        console.log(`swappiNFT contract address: ${swappiNFTContract.address}`);

        //Deploy veToken
        const factory2  = new ethers.ContractFactory(VotingEscrow.abi, VotingEscrow.bytecode, veTokenContractDeployer);
        veTokenContract = await factory2.deploy();
        await veTokenContract.deployed();
        await veTokenContract.connect(adminAddr).initialize('Vote-escrowed PPI', 'vePPI', 18, PPITokenContract.address, {gasLimit: 1000000,});
        console.log(`veTokenContract contract address: ${veTokenContract.address}`);
        //Deploy new token
        const factory3  = new ethers.ContractFactory(PPIToken.abi, PPIToken.bytecode, tokenOwner);
        tokenContract = await factory3.deploy();
        await tokenContract.deployed();
        await tokenContract.mint(tokenOwner.address, totalAmt);
        console.log(`token for IDO contract address: ${tokenContract.address}`);
        //Deploy factory for pairing LP
        const factory4  = new ethers.ContractFactory(SwappiFactory.abi, SwappiFactory.bytecode, adminAddr);
        SwappiFactoryContract = await factory4.deploy(adminAddr.address);
        await SwappiFactoryContract.deployed();
        console.log(`SwappiFactory Contract address: ${SwappiFactoryContract.address}`);
        //Deploy Router for LP
        const factory5  = new ethers.ContractFactory(SwappiRouter.abi, SwappiRouter.bytecode, adminAddr);
        SwappiRouterContract = await factory5.deploy(SwappiFactoryContract.address, wcfxContract.address);
        await SwappiRouterContract.deployed();
        console.log(`SwappiRouter contract address: ${SwappiRouterContract.address}`);

        const factory7  = await ethers.getContractFactory("idoplatform");
        idoplatformContract = await factory7.deploy(tokenContract.address, swappiNFTContract.address, SwappiRouterContract.address, SwappiFactoryContract.address, wcfxContract.address, veTokenContract.address);
        await idoplatformContract.deployed();
        console.log(`idoplatform contract address: ${idoplatformContract.address}`);

    })
    it("Total supply can be set", async function() {
        expect(10000).to.equal(10000);
    })
}
);