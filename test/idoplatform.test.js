const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
let PPIToken = require(`./PPIToken.sol/PPIToken.json`);
let SwappiNFT = require(`./SwappiNFT.sol/SwappiNFT.json`);
let VotingEscrow = require(`./VotingEscrow.sol/VotingEscrow.json`);
let SwappiRouter = require(`./SwappiRouter.sol/SwappiRouter.json`);
let SwappiFactory = require(`./SwappiFactory.sol/SwappiFactory.json`);
let SwappiPair = require(`./SwappiPair.sol/SwappiPair.json`);
let WCFX = require(`./WCFX.sol/WCFX.json`);
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
    let amt = '10000000000000000000000000'; // 10000000
    let ratioForLP = 20;
    let amtIncludingLP = (BigNumber.from(amt).mul(100+ratioForLP).div(100)).toHexString();
    let totalAmt = '20000000000000000000000000'; // 20000000
    let priceForLP = 2;
    // privateSpecs    [Threshold, amount, price]
    let privateSpecs = [200, '5000000000000000000000000', 2]; // 5000000
    // publicspecs    [price]
    let publicSpecs = [3];
    let maxAmtPerBuyer = 10000;
    this.beforeEach(async function() {
        [adminAddr, tokenOwner, buyer0, buyer1, buyer2, veTokenContractDeployer] = await ethers.getSigners();
        // console.log(`Address ${adminAddr.address} created`);
        // console.log(`Address ${tokenOwner.address} created`);
        // console.log(`Address ${buyer0.address} created`);
        // console.log(`Address ${buyer1.address} created`);
        // console.log(`Address ${buyer2.address} created`);

        //  Deploy PPI
        const factory0  = new ethers.ContractFactory(PPIToken.abi, PPIToken.bytecode, adminAddr);
        PPITokenContract = await factory0.deploy();
        await PPITokenContract.deployed();
        await PPITokenContract.mint(buyer0.address, 1000);
        await PPITokenContract.mint(buyer1.address, 1000);
        // console.log(`PPI contract address: ${PPITokenContract.address}`);

        //Deploy WCFX
        const factory6 = new ethers.ContractFactory(WCFX.abi, WCFX.bytecode, adminAddr)
        wcfxContract = await factory6.deploy();
        await wcfxContract.deployed();
        // console.log(`WCFX contract address: ${wcfxContract.address}`);

        //Deploy NFT
        const factory1  = new ethers.ContractFactory(SwappiNFT.abi, SwappiNFT.bytecode, adminAddr);
        swappiNFTContract = await factory1.deploy("Swappi NFT Contract", "SwappiNFT", 1000, "https://aliyuncs.com/0", PPITokenContract.address, adminAddr.address, 200);
        await swappiNFTContract.deployed();
        await swappiNFTContract.enableMint();
        await PPITokenContract.connect(buyer0).approve(swappiNFTContract.address, 200, {gasLimit: 1000000,});
        await swappiNFTContract.connect(buyer0).mint({gasLimit: 1000000,});
        // console.log(`swappiNFT contract address: ${swappiNFTContract.address}`);

        //Deploy veToken
        const factory2  = new ethers.ContractFactory(VotingEscrow.abi, VotingEscrow.bytecode, veTokenContractDeployer);
        veTokenContract = await factory2.deploy();
        await veTokenContract.deployed();
        await veTokenContract.connect(adminAddr).initialize('Vote-escrowed PPI', 'vePPI', 18, PPITokenContract.address, {gasLimit: 1000000,});
        // console.log(`veTokenContract contract address: ${veTokenContract.address}`);

        // getting timestamp
        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        const timestampBefore = blockBefore.timestamp;
        //buyer1 create vePPI
        await PPITokenContract.connect(buyer1).approve(veTokenContract.address, 1000, {gasLimit: 1000000,});
        await veTokenContract.connect(buyer1).createLock(1000, timestampBefore + 31536000, {gasLimit: 1000000,});

        //Deploy new token use PPI as example
        const factory3  = new ethers.ContractFactory(PPIToken.abi, PPIToken.bytecode, tokenOwner);
        tokenContract = await factory3.deploy();
        await tokenContract.deployed();
        await tokenContract.mint(tokenOwner.address, totalAmt);
        // console.log(`token for IDO contract address: ${tokenContract.address}`);
        //Deploy factory for pairing LP
        const factory4  = new ethers.ContractFactory(SwappiFactory.abi, SwappiFactory.bytecode, adminAddr);
        SwappiFactoryContract = await factory4.deploy(adminAddr.address);
        await SwappiFactoryContract.deployed();
        // console.log(`SwappiFactory Contract address: ${SwappiFactoryContract.address}`);
        //Deploy Router for LP
        const factory5  = new ethers.ContractFactory(SwappiRouter.abi, SwappiRouter.bytecode, adminAddr);
        SwappiRouterContract = await factory5.deploy(SwappiFactoryContract.address, wcfxContract.address);
        await SwappiRouterContract.deployed();
        // console.log(`SwappiRouter contract address: ${SwappiRouterContract.address}`);

        //Deploy idoplatform
        const factory7  = await ethers.getContractFactory("idoplatform");
        idoplatformContract = await factory7.deploy(PPITokenContract.address, swappiNFTContract.address, SwappiRouterContract.address, SwappiFactoryContract.address, wcfxContract.address, veTokenContract.address);
        await idoplatformContract.deployed();
        // console.log(`idoplatform contract address: ${idoplatformContract.address}`);
 
    })
    it("Check all account initial states", async function() {
        // getting timestamp
        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        const timestampBefore = blockBefore.timestamp;
        //token owner
        expect(await tokenContract.balanceOf(tokenOwner.address)).to.equal(totalAmt);
        expect(await swappiNFTContract.balanceOf(buyer0.address)).to.equal(1);
        expect(await PPITokenContract.balanceOf(buyer1.address)).to.equal(0);
        expect(await veTokenContract.balanceOf(buyer1.address)).to.not.be.above(250);
        expect(await PPITokenContract.balanceOf(buyer2.address)).to.equal(0);
    })
    it("IDO check", async function() {
        // getting timestamp
        var blockNumBefore = await ethers.provider.getBlockNumber();
        var blockBefore = await ethers.provider.getBlock(blockNumBefore);
        var timestampBefore = blockBefore.timestamp;
        // // console.log(`last block timestamp: ${timestampBefore}`);
        privateSpecs.push(timestampBefore + 1000, timestampBefore + 2000);
        publicSpecs.push(timestampBefore + 3000);
        await idoplatformContract.adminApproval(tokenContract.address, "BrandNewToken", amt, ratioForLP, priceForLP, privateSpecs, publicSpecs);
        expect(await idoplatformContract.getCurrentIDOIdByTokenAddr(tokenContract.address)).to.equal(1);
        await expect(idoplatformContract.connect(buyer0).claimAllTokens(tokenContract.address, {gasLimit: 1000000,})).to.be.reverted;
        expect(await idoplatformContract.isIDOActiveByID(tokenContract.address, 1)).to.equal(false);
        await tokenContract.connect(tokenOwner).approve(idoplatformContract.address, amtIncludingLP, {gasLimit: 1000000,});
        await idoplatformContract.connect(tokenOwner).addIDOToken(tokenContract.address, {gasLimit: 1000000,});
        expect(await idoplatformContract.isIDOActiveByID(tokenContract.address, 1)).to.equal(true);

        //push to private sale time
        await ethers.provider.send('evm_increaseTime', [1000]);
        await ethers.provider.send('evm_mine');
        //buyer0 buy
        await idoplatformContract.connect(buyer0).privateSale(tokenContract.address, '100000000000000000000', {gasLimit: 1000000, value: 200});
        expect(await idoplatformContract.getAmtOfCFXCollected(tokenContract.address, 1)).to.be.equal(200);
        await idoplatformContract.connect(buyer0).privateSale(tokenContract.address, '200000000000000000000', {gasLimit: 1000000, value: 400});
        expect(await idoplatformContract.getAmtOfCFXCollected(tokenContract.address, 1)).to.be.equal(600);
        //buyer1 buy
        await idoplatformContract.connect(buyer1).privateSale(tokenContract.address, '20000000000000000000000', {gasLimit: 1000000, value: 40000});
        expect(await idoplatformContract.getAmtOfCFXCollected(tokenContract.address, 1)).to.be.equal(40600);
        await idoplatformContract.connect(buyer1).privateSale(tokenContract.address, '40000000000000000000000', {gasLimit: 1000000, value: 80000});
        expect(await idoplatformContract.getAmtOfCFXCollected(tokenContract.address, 1)).to.be.equal(120600);
        //buyer1 buy too much token
        await expect(idoplatformContract.connect(buyer1).privateSale(tokenContract.address, '10000000000000000000000000', {gasLimit: 1000000, value: 0})).to.be.revertedWith('Not enough token to trade');
        //buyer1 buy with low CFX
        await expect(idoplatformContract.connect(buyer1).privateSale(tokenContract.address, '2000000000000000000', {gasLimit: 1000000, value: 0})).to.be.revertedWith('IDOPlatform: Not enough CFX to buy');
        //buyer2 buy in private sale
        await expect(idoplatformContract.connect(buyer2).privateSale(tokenContract.address, '1000000000000000000', {gasLimit: 1000000, value: 2})).to.be.revertedWith('Your veToken cannot reach threshold');

        //push to public sale time
        await ethers.provider.send('evm_increaseTime', [1000]);
        await ethers.provider.send('evm_mine');
        //buyer2 buy in public sale
        expect(await idoplatformContract.connect(buyer2).publicSale(tokenContract.address, '400000000000000000000', {gasLimit: 1000000, value: 1200}));
        expect(await idoplatformContract.getAmtOfCFXCollected(tokenContract.address, 1)).to.be.equal(121800);
        await expect(idoplatformContract.connect(buyer2).publicSale(tokenContract.address, '10000000000000000000000000', {gasLimit: 1000000, value: 0})).to.be.revertedWith('Not enough token to trade');
        await expect(idoplatformContract.connect(buyer2).publicSale(tokenContract.address, '1000000000000000000', {gasLimit: 1000000, value: 2})).to.be.revertedWith('IDOPlatform: Not enough CFX to buy');
        await idoplatformContract.connect(buyer2).publicSale(tokenContract.address, '0', {gasLimit: 1000000, value: 0});
        //try to claim now: should revert
        await expect(idoplatformContract.connect(buyer2).claimAllTokens(tokenContract.address, 1, {gasLimit: 1000000,})).to.be.revertedWith('IDO is still active');

        //push to end time
        await ethers.provider.send('evm_increaseTime', [1000]);
        await ethers.provider.send('evm_mine');
        expect((await idoplatformContract.getAmtOfTokenForBuyer(tokenContract.address, 1, buyer2.address)).toString()).to.equal('400000000000000000000');
        expect((await idoplatformContract.getAmtOfTokenForBuyer(tokenContract.address, 1, buyer1.address)).toString()).to.equal('60000000000000000000000');
        expect((await idoplatformContract.getAmtOfTokenForBuyer(tokenContract.address, 1, buyer0.address)).toString()).to.equal('300000000000000000000');
        await idoplatformContract.connect(buyer2).claimAllTokens(tokenContract.address, 1, {gasLimit: 10000000,});
        await idoplatformContract.connect(buyer1).claimAllTokens(tokenContract.address, 1, {gasLimit: 1000000,});
        await idoplatformContract.connect(buyer0).claimAllTokens(tokenContract.address, 1, {gasLimit: 1000000,});

        //check balance
        expect((await tokenContract.balanceOf(buyer2.address)).toString()).to.equal('400000000000000000000');
        expect((await tokenContract.balanceOf(buyer1.address)).toString()).to.equal('60000000000000000000000');
        expect((await tokenContract.balanceOf(buyer0.address)).toString()).to.equal('300000000000000000000');
        
        expect(await idoplatformContract.getAmtOfTokenForBuyer(tokenContract.address, 1, buyer2.address)).to.equal(0);
        expect(await idoplatformContract.getAmtOfTokenForBuyer(tokenContract.address, 1, buyer1.address)).to.equal(0);
        expect(await idoplatformContract.getAmtOfTokenForBuyer(tokenContract.address, 1, buyer0.address)).to.equal(0);
        expect(await tokenContract.balanceOf(tokenOwner.address)).to.equal('19878400000000000000000000'); //totalAmt - 121800/priceForLP - 400 - 60000 - 300
    
        //check LP token
        let LPAddr = await SwappiFactoryContract.getPair(tokenContract.address, wcfxContract.address);
        let SwappiPairContract = new ethers.Contract(LPAddr, SwappiPair.abi, tokenOwner);
        expect(await SwappiPairContract.balanceOf(tokenOwner.address)).to.not.equal(0);
        
    })
}
);