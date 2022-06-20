//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;
import "../interfaces/IERC20.sol";
import "../libraries/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@swappi-libs/swappi-core/contracts/interfaces/ISwappiFactory.sol";
import "../interfaces/IVotingEscrow.sol";
contract idoplatform is Ownable{
    //WCFX address
    address wcfx;
    // PPI token address
    IERC20 token; 
    //swappi nft token address
    IERC721 swappiNFT;
    //swappi LP interface
    address router;
    //swappi core interface
    ISwappiFactory swappiFactory;
    //swappi farm ppi control addresss
    IVotingEscrow votingEscrow;

    /// @notice specs for private sale
    struct privateSpecs {
        uint256 veTokenThreshold;
        uint256 amount;
        uint256 price;
        uint256 startTime;
        uint256 endTime;
        uint256 totalAmt;
    }
    /// @notice specs for public sale
    struct publicSpecs {
        uint256 price;
        uint256 endTime;
    }
    /// @notice wrapped token called IDO token
    struct IDOToken {
        bool isApproved;
        bool valid;
        address tokenOwner;
        string projectName;
        uint256 totalAmt;
        uint256 amt; // amount to sell
        uint256 amtForLP; //pre_defined amount for place LP
        uint256 priceForLP; //pre_defined amount of cfx for place LP
        uint256 amtOfCFXCollected; 
        privateSpecs priSaleInfo; //veToken_threshold, amount, price, start time, end time
        publicSpecs pubSaleInfo; // price, end time
        mapping(address => uint256) buyers; // record the amount of token buyer buys
    }
    /// @notice Mapping from token address to current IDO id.
    mapping(address => uint256) public currentIDOId;
    /// @notice Mapping from token address to its specs.
    mapping(address => mapping(uint256 => IDOToken)) public tokenInfo;
    constructor(
            address _token,
            address _swappiNFT,
            address _router,
            address _swappiFactory,
            address _wcfx,
            address _votingEscrow
        ) {
            token            = IERC20(_token);
            swappiNFT        = IERC721(_swappiNFT);
            router           = _router;
            swappiFactory    = ISwappiFactory(_swappiFactory);
            wcfx             = _wcfx;
            votingEscrow     = IVotingEscrow(_votingEscrow);
        }
    function getCurrentIDOIdByTokenAddr(address token_addr) external view returns (uint256) {
        return currentIDOId[token_addr];
    }
    function isIDOActiveByID(address token_addr, uint256 id) external view returns (bool) {
        return tokenInfo[token_addr][id].valid;
    }
    function getAmtOfCFXCollected(address token_addr, uint256 id) external view returns (uint256) {
        return tokenInfo[token_addr][id].amtOfCFXCollected;
    }
    function getAmtOfTokenForBuyer(address token_addr, uint256 id, address buyer_addr) external view returns (uint256) {
        return tokenInfo[token_addr][id].buyers[buyer_addr];
    }
    // Step 1: admin should approval one token's new IDO
    function adminApproval(
        address token_addr,
        string memory projectName,
        uint256 amt,
        uint256 ratioForLP,
        uint256 priceForLP,
        uint256[5] memory privateData, //veToken_threshold, amount, price, start time, end time
        uint256[2] memory publicData // price, end time
        ) external onlyOwner {
        IDOToken storage entry = tokenInfo[token_addr][currentIDOId[token_addr]+1];
        // require(entry.currentIDOId == false, "This token IDO is already active");
        require(entry.valid == false, "IDOPlatform: This token IDO is already active");
        require(entry.isApproved == false, "IDOPlatform: This token IDO is already approved");
        require(amt >= privateData[1], "IDOPlatform: private sale amount should not exceed total amount!");
        require(privateData[3] >= block.timestamp && privateData[3] < privateData[4] && privateData[4] < publicData[1], "timestamp setting is wrong");
        entry.isApproved                     = true;
        entry.valid                          = false;
        entry.projectName                    = projectName;
        // entry.symbol                         = IERC20(token_addr).symbol();
        // entry.decimals                       = IERC20(token_addr).decimals();
        entry.totalAmt                       = amt;
        entry.amt                            = amt;
        entry.amtForLP                       = uint256(amt * ratioForLP) /100;
        entry.priceForLP                     = priceForLP;
        entry.amtOfCFXCollected              = 0;
        entry.priSaleInfo                    = privateSpecs(privateData[0], 
                                                              privateData[1], 
                                                              privateData[2], 
                                                              privateData[3],
                                                              privateData[4],
                                                              privateData[1]);
        entry.pubSaleInfo                    = publicSpecs(  publicData[0], 
                                                              publicData[1]);
        currentIDOId[token_addr]           = currentIDOId[token_addr] + 1;
    }
    // Step 2: let the token owner transfer tokens to "this" and start its sale
    // TODO: need step 2 or not
    function addIDOToken(
        address token_addr
        ) external {
            IDOToken storage entry = tokenInfo[token_addr][currentIDOId[token_addr]];
            require(entry.isApproved == true, "IDOPlatform: Contact admin to approval your IDO");
            require(entry.valid == false, "IDOPlatform: Your IDO already started");
            require(entry.priSaleInfo.startTime >= block.timestamp, "IDOPlatform: You start IDO too late! Contact admin to change schedule");
            entry.valid = true;
            entry.tokenOwner = msg.sender;
            SafeERC20.safeTransferFrom(IERC20(token_addr), msg.sender, address(this), entry.amt + entry.amtForLP);
    }
    // step 3.1: let users stake PPI to form its veToken
    // step 3.2: private sale
    function privateSale(address token_addr, uint256 amt_to_buy) external payable{
        IDOToken storage entry = tokenInfo[token_addr][currentIDOId[token_addr]];
        require(entry.valid == true, "IDOPlatform: This token IDO has not started yet or expired");
        require(entry.priSaleInfo.startTime <= block.timestamp, "IDOPlatform: This token IDO has not started!");
        require(entry.priSaleInfo.endTime >= block.timestamp, "IDOPlatform: This token IDO already enterred public sale. No private sale");
        //if the amount of private is zero, revert the transaction
        require(entry.priSaleInfo.amount > 0, "IDOPlatform: This token IDO already enterred public sale. Amount for private sale is zero");
        require (amt_to_buy <= entry.priSaleInfo.amount, "IDOPlatform: Not enough token to trade");
        require (msg.value >= amt_to_buy * entry.priSaleInfo.price, "IDOPlatform: Not enough CFX to trade");
        if (swappiNFT.balanceOf(msg.sender) != 0) { //Check user has NFT or not.
            entry.amt = entry.amt - amt_to_buy;
            entry.priSaleInfo.amount = entry.priSaleInfo.amount - amt_to_buy;
            entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
            entry.amtOfCFXCollected = entry.amtOfCFXCollected + amt_to_buy * entry.priSaleInfo.price;
        }else{
            //calculate current veToken
            uint256 veTokenAmt = votingEscrow.balanceOf(msg.sender);
            require (veTokenAmt >= entry.priSaleInfo.veTokenThreshold, "IDOPlatform: Your veToken cannot reach threshold");
            entry.amt = entry.amt - amt_to_buy;
            entry.priSaleInfo.amount = entry.priSaleInfo.amount - amt_to_buy;
            entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
            entry.amtOfCFXCollected = entry.amtOfCFXCollected + amt_to_buy * entry.priSaleInfo.price;
        }
    }
    // step 3.3: public sale
    function publicSale(address token_addr, uint256 amt_to_buy) external payable{
        IDOToken storage entry = tokenInfo[token_addr][currentIDOId[token_addr]];
        require(entry.priSaleInfo.endTime <= block.timestamp || entry.priSaleInfo.amount == 0, "IDOPlatform: This token IDO has not started!");
        require(entry.pubSaleInfo.endTime >= block.timestamp, "IDOPlatform: Public sale already ended");
        //if the amount of private is zero, revert the transaction
        require(entry.amt > 0, "IDOPlatform: This token is already sold out");
        require (amt_to_buy <= entry.amt, "IDOPlatform: Not enough token to trade");
        require (msg.value >= amt_to_buy * entry.pubSaleInfo.price, "IDOPlatform: Not enough CFX to trade");
        entry.amt = entry.amt - amt_to_buy;
        entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
        entry.amtOfCFXCollected = entry.amtOfCFXCollected + amt_to_buy * entry.pubSaleInfo.price;
    }
    // step 4.1: check ending and create LP
    function finalize(address token_addr, uint256 IDOId) public returns (bool){
        IDOToken storage entry = tokenInfo[token_addr][IDOId];
        if (entry.valid && entry.isApproved) {
            if (entry.pubSaleInfo.endTime < block.timestamp || entry.amt  == 0) {
                //Now it is ending
                entry.valid = false;
                entry.isApproved = false;
                // Create LP
                // Get min between cfx or pre-defined token amt
                uint256 token_for_lp = (entry.amtForLP * entry.priceForLP > entry.amtOfCFXCollected)? entry.amtOfCFXCollected/entry.priceForLP : entry.amtForLP;
                uint256 cfx_for_lp = (entry.amtForLP * entry.priceForLP > entry.amtOfCFXCollected)? entry.amtOfCFXCollected : entry.amtForLP * entry.priceForLP;
                IERC20(token_addr).approve(router, token_for_lp);
                (bool success, bytes memory result) = router.call{value: cfx_for_lp}(abi.encodeWithSignature("addLiquidityETH(address,uint256,uint256,uint256,address,uint256)", token_addr, token_for_lp, 0, 0, entry.tokenOwner, block.timestamp + 1));
                if (success) {
                    (uint amountToken, uint amountETH, ) = abi.decode(result, (uint, uint, uint));
                    SafeERC20.safeTransfer(IERC20(token_addr), entry.tokenOwner, entry.amt + entry.amtForLP - amountToken);
                    payable(entry.tokenOwner).transfer(entry.amtOfCFXCollected - amountETH);
                }else{
                    SafeERC20.safeTransfer(IERC20(token_addr), entry.tokenOwner, entry.amt + entry.amtForLP);
                    payable(entry.tokenOwner).transfer(entry.amtOfCFXCollected);
                }
                return true;
            }
            return false;
        }
        return false;
    }
    //step 4.2: user claim tokens
    function claimAllTokens(address token_addr, uint256 IDOId) external {
        finalize(token_addr, IDOId);
        IDOToken storage entry = tokenInfo[token_addr][IDOId];
        require(entry.pubSaleInfo.endTime < block.timestamp || entry.amt  == 0, "IDOPlatform: IDO is still active");
        require(entry.buyers[msg.sender] > 0, "IDOPlatform: Your amount of this token is zero");
        SafeERC20.safeTransfer(IERC20(token_addr), msg.sender, entry.buyers[msg.sender]);
        entry.buyers[msg.sender] = 0;
    }
}