//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;
import "../interfaces/IERC20.sol";
import "../libraries/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@swappi-libs/swappi-core/contracts/interfaces/ISwappiFactory.sol";
import "../interfaces/IVotingEscrow.sol";
// import "hardhat/console.sol";
contract idoplatform is Ownable{
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
        uint256 NFTThreshold;
        uint256 maxAmtPerBuyer;
        uint256 amountExcludingWhitelist;
    }
    /// @notice specs for public sale
    struct publicSpecs {
        uint256 price;
        uint256 endTime;
        // uint256 maxAmtPerBuyer;
    }
    /// @notice wrapped token called IDO token
    struct IDOToken {
        bool isApproved;
        bool valid;
        address tokenOwner;
        string projectName;
        uint256 totalAmt;
        uint256 amt; // amount to remain
        uint256 amtForLP; //pre_defined amount for place LP
        uint256 priceForLP; //pre_defined amount of cfx for place LP
        uint256 amtOfCFXCollected; 
        privateSpecs priSaleInfo; //veToken_threshold, amount, price, start time, end time
        publicSpecs pubSaleInfo; // price, end time
        mapping(address => uint256) buyers; // record the amount of token buyer buys
        mapping(address => uint256) amtOfCFXPerBuyer; // record the cfx of token buyer buys
        mapping(address => uint256) whitelist; // record the max amount of whitelist addresses
        uint256 totalMaxAmountOfWhitelist;
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
            address _votingEscrow
        ) {
            token            = IERC20(_token);
            swappiNFT        = IERC721(_swappiNFT);
            router           = _router;
            swappiFactory    = ISwappiFactory(_swappiFactory);
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
    function getAmtOfCFXForBuyer(address token_addr, uint256 id, address buyer_addr) external view returns (uint256) {
        return tokenInfo[token_addr][id].amtOfCFXPerBuyer[buyer_addr];
    }
    function isInWhitelist(address token_addr, uint256 id, address buyer_addr) external view returns (bool) {
        return tokenInfo[token_addr][id].whitelist[buyer_addr] != 0;
    }
    function maxAmountInPrivateSaleByAddr(address token_addr, uint256 id, address buyer_addr) external view returns (uint256) {
        if (tokenInfo[token_addr][id].whitelist[buyer_addr] != 0){
            return tokenInfo[token_addr][id].whitelist[buyer_addr];
        }
        return tokenInfo[token_addr][id].priSaleInfo.maxAmtPerBuyer;
    }
    // Step 1: admin should approval one token's new IDO
    function adminApproval(
        address token_addr,
        string memory projectName,
        uint256 amt,
        uint256 ratioForLP,
        uint256 priceForLP,
        address[] memory whitelistAddress,
        uint256[] memory maxAmtPerEntryInWhitelist,
        uint256[7] memory privateData, //veToken_threshold, amount, price, start time, end time, NFT score, max amount per buyer
        uint256[2] memory publicData // price, end time
        ) external onlyOwner {
        if (currentIDOId[token_addr] != 0) {
            require(tokenInfo[token_addr][currentIDOId[token_addr]].valid == false, "IDOPlatform: This token IDO is already active.");
        }
        IDOToken storage entry = tokenInfo[token_addr][currentIDOId[token_addr]+1];
        // require(entry.currentIDOId == false, "This token IDO is already active");
        require(entry.valid == false, "IDOPlatform: This token IDO is already active");
        require(entry.isApproved == false, "IDOPlatform: This token IDO is already approved");
        require(amt >= privateData[1], "IDOPlatform: private sale amount should not exceed total amount!");
        require(privateData[3] >= block.timestamp && privateData[3] < privateData[4] && privateData[4] < publicData[1], "IDOPlatform: timestamp setting is wrong");
        require(whitelistAddress.length == maxAmtPerEntryInWhitelist.length, "IDOPlatform: whitelist address length does not match its max amount limit lengeth");
        uint256 numOfMemebers = whitelistAddress.length;
        uint256 totalAmountOfWhilelist = 0;
        for (uint i = 0; i < numOfMemebers; i += 1) {
            totalAmountOfWhilelist += maxAmtPerEntryInWhitelist[i];
        }
        require(privateData[1] >= totalAmountOfWhilelist, "IDOPlatform: total amount of whilelist should not exceed private sale amount!");
        for (uint i = 0; i < numOfMemebers; i += 1) {
            entry.whitelist[whitelistAddress[i]] = maxAmtPerEntryInWhitelist[i];
        }
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
                                                              privateData[1],
                                                              privateData[5],
                                                              privateData[6],
                                                              privateData[1] - totalAmountOfWhilelist);
        entry.pubSaleInfo                    = publicSpecs(  publicData[0], 
                                                              publicData[1]);
        entry.totalMaxAmountOfWhitelist = totalAmountOfWhilelist;
        currentIDOId[token_addr]           = currentIDOId[token_addr] + 1;
    }
    // Step 2: let the token owner transfer tokens to "this" and start its sale
    // TODO: need step 2 or not
    function addIDOToken(
        address token_addr,
        uint256 ido_id
        ) external {
            require(ido_id == currentIDOId[token_addr], "IDOPlatform: IDO ID does not match the lastest one. Contact admin to check issue.");
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
        require(entry.priSaleInfo.endTime >= block.timestamp, "IDOPlatform: This token IDO already entered public sale. No private sale");
        // if the amount of private is zero, revert the transaction
        require(entry.priSaleInfo.amount > 0, "IDOPlatform: This token IDO already enterred public sale. Amount for private sale is zero");
        require (msg.value * (10 ** IERC20(token_addr).decimals()) >= amt_to_buy * entry.priSaleInfo.price, "IDOPlatform: Not enough CFX to buy");
        // if under whitelist
        if (entry.whitelist[msg.sender] > 0) {
            uint256 veTokenAmt = votingEscrow.balanceOf(msg.sender);
            // if pass vePPI/NFT
            if ((swappiNFT.balanceOf(msg.sender) != 0 && veTokenAmt >= entry.priSaleInfo.NFTThreshold)||veTokenAmt >= entry.priSaleInfo.veTokenThreshold) {
                // if whitelist limit is over regular amount limit
                if (entry.whitelist[msg.sender] >= entry.priSaleInfo.maxAmtPerBuyer) {
                    require ((amt_to_buy + entry.buyers[msg.sender]) <= entry.whitelist[msg.sender], "IDOPlatform: Reach max amount to buy");
                    entry.amt = entry.amt - amt_to_buy;
                    entry.priSaleInfo.amount = entry.priSaleInfo.amount - amt_to_buy;
                    entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
                    entry.amtOfCFXPerBuyer[msg.sender] = entry.amtOfCFXPerBuyer[msg.sender] + msg.value;
                    entry.amtOfCFXCollected = entry.amtOfCFXCollected + msg.value;
                }else{ // if whitelist limit is less than regular amount limit
                    require ((amt_to_buy + entry.buyers[msg.sender]) <= entry.priSaleInfo.maxAmtPerBuyer, "IDOPlatform: Reach max amount to buy");
                    // if after the sale, it will be over whitelist limit
                    if ((amt_to_buy + entry.buyers[msg.sender]) > entry.whitelist[msg.sender]) {
                        require (((amt_to_buy + entry.buyers[msg.sender]) - entry.whitelist[msg.sender]) <= entry.priSaleInfo.amountExcludingWhitelist, "IDOPlatform: Reach max amount to buy");
                        // it amt_to_buy will take both whitelist limit and regular amount limit
                        if (entry.buyers[msg.sender] < entry.whitelist[msg.sender]) {
                            entry.priSaleInfo.amountExcludingWhitelist = entry.priSaleInfo.amountExcludingWhitelist - ((amt_to_buy + entry.buyers[msg.sender]) - entry.whitelist[msg.sender]);
                        }else{
                            entry.priSaleInfo.amountExcludingWhitelist = entry.priSaleInfo.amountExcludingWhitelist - amt_to_buy;
                        }
                        entry.amt = entry.amt - amt_to_buy;
                        entry.priSaleInfo.amount = entry.priSaleInfo.amount - amt_to_buy;
                        entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
                        entry.amtOfCFXPerBuyer[msg.sender] = entry.amtOfCFXPerBuyer[msg.sender] + msg.value;
                        entry.amtOfCFXCollected = entry.amtOfCFXCollected + msg.value;
                    }else{
                        // if after the sale, it will be still less than whitelist limit
                        entry.amt = entry.amt - amt_to_buy;
                        entry.priSaleInfo.amount = entry.priSaleInfo.amount - amt_to_buy;
                        entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
                        entry.amtOfCFXPerBuyer[msg.sender] = entry.amtOfCFXPerBuyer[msg.sender] + msg.value;
                        entry.amtOfCFXCollected = entry.amtOfCFXCollected + msg.value;
                    }
                }
            }else{
                // if not pass vePPI/NFT but in whitelist
                require ((amt_to_buy + entry.buyers[msg.sender]) <= entry.whitelist[msg.sender], "IDOPlatform: Reach max amount to buy");
                entry.amt = entry.amt - amt_to_buy;
                entry.priSaleInfo.amount = entry.priSaleInfo.amount - amt_to_buy;
                entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
                entry.amtOfCFXPerBuyer[msg.sender] = entry.amtOfCFXPerBuyer[msg.sender] + msg.value;
                entry.amtOfCFXCollected = entry.amtOfCFXCollected + msg.value;
            }
        }else{
            // if not under whitelist
            require ((amt_to_buy + entry.buyers[msg.sender]) <= entry.priSaleInfo.maxAmtPerBuyer, "IDOPlatform: Reach max amount to buy");
            require (amt_to_buy <= entry.priSaleInfo.amountExcludingWhitelist, "IDOPlatform: Not enough token to trade");
            //calculate current veToken
            uint256 veTokenAmt = votingEscrow.balanceOf(msg.sender);
            if (swappiNFT.balanceOf(msg.sender) != 0 && veTokenAmt >= entry.priSaleInfo.NFTThreshold) { //Check user has NFT or not.
                entry.amt = entry.amt - amt_to_buy;
                entry.priSaleInfo.amount = entry.priSaleInfo.amount - amt_to_buy;
                entry.priSaleInfo.amountExcludingWhitelist = entry.priSaleInfo.amountExcludingWhitelist - amt_to_buy;
                entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
                entry.amtOfCFXPerBuyer[msg.sender] = entry.amtOfCFXPerBuyer[msg.sender] + msg.value;
                entry.amtOfCFXCollected = entry.amtOfCFXCollected + msg.value;
            }else{
                require (veTokenAmt >= entry.priSaleInfo.veTokenThreshold, "IDOPlatform: Your veToken cannot reach threshold");
                entry.amt = entry.amt - amt_to_buy;
                entry.priSaleInfo.amount = entry.priSaleInfo.amount - amt_to_buy;
                entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
                entry.amtOfCFXPerBuyer[msg.sender] = entry.amtOfCFXPerBuyer[msg.sender] + msg.value;
                entry.amtOfCFXCollected = entry.amtOfCFXCollected + msg.value;
                entry.priSaleInfo.amountExcludingWhitelist = entry.priSaleInfo.amountExcludingWhitelist - amt_to_buy;
            }
        }
    }
    // step 3.3: public sale
    function publicSale(address token_addr, uint256 amt_to_buy) external payable{
        IDOToken storage entry = tokenInfo[token_addr][currentIDOId[token_addr]];
        require(entry.valid == true, "IDOPlatform: This token IDO has not started yet or expired");
        require(entry.priSaleInfo.endTime <= block.timestamp || entry.priSaleInfo.amount == 0, "IDOPlatform: This token IDO has not started!");
        require(entry.pubSaleInfo.endTime >= block.timestamp, "IDOPlatform: Public sale already ended");
        //if the amount of private is zero, revert the transaction
        require(entry.amt > 0, "IDOPlatform: This token is already sold out");
        require (amt_to_buy <= entry.amt, "IDOPlatform: Not enough token to trade");
        require (msg.value * (10 ** IERC20(token_addr).decimals()) >= amt_to_buy * entry.pubSaleInfo.price, "IDOPlatform: Not enough CFX to buy");
        entry.amt = entry.amt - amt_to_buy;
        entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
        entry.amtOfCFXPerBuyer[msg.sender] = entry.amtOfCFXPerBuyer[msg.sender] + msg.value;
        entry.amtOfCFXCollected = entry.amtOfCFXCollected + msg.value;
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
                uint256 preDefinedTotalValue = entry.amtForLP * entry.priceForLP / (10 ** IERC20(token_addr).decimals());
                uint256 token_for_lp = (preDefinedTotalValue > entry.amtOfCFXCollected)? entry.amtOfCFXCollected/entry.priceForLP*(10 ** IERC20(token_addr).decimals()) : entry.amtForLP;
                uint256 cfx_for_lp = (preDefinedTotalValue > entry.amtOfCFXCollected)? entry.amtOfCFXCollected : preDefinedTotalValue;
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