//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;
// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@swappi-libs/swappi-core/contracts/interfaces/ISwappiFactory.sol";
import "conflux-swap-farm/contracts/VotingEscrow.sol";
contract idoplatform {
    /// @notice admin address
    address public owner;
    modifier onlyAdmin {
      require(msg.sender == owner);
      _;
    }
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
    //swappi farm ppi control address
    address votingEscrow;

    /// @notice wrapped token called IDO token
    struct IDOToken {
        bool isApproved;
        bool valid;
        address tokenOwner;
        string projectName;
        string symbol;
        uint8 decimals;
        uint256 amt; // amount to sell
        uint256 amtForLP; //pre_defined amount for place LP
        uint256 priceForLP; //pre_defined amount of cfx for place LP
        uint256 amtOfCFXCollected; 
        uint256[4] privateSpecs; //veToken_threshold, amount, price, start time, end time
        uint256[2] publicSpecs; // price, end time
        uint256 maxAmtPerBuyer; // the limit per buyer for the token
        mapping(address => uint256) buyers; // record the amount of token buyer buys
    }
    /// @notice Mapping from token address to its specs.
    mapping(address => IDOToken) public tokenInfo;
    constructor(
            address _token,
            address _swappiNFT,
            address _router,
            address _swappiFactory,
            address _wcfx,
            address _votingEscrow
        ) {
            token            = IERC20(token);
            token            = IERC20(_token);
            swappiNFT        = IERC721(swappiNFT);
            swappiNFT        = IERC721(_swappiNFT);
            owner            = msg.sender;
            router           = _router;
            swappiFactory    = ISwappiFactory(swappiFactory);
            swappiFactory    = ISwappiFactory(_swappiFactory);
            wcfx             = _wcfx;
            votingEscrow     = _votingEscrow;
        }
    // Step 1: admin should approval one token's IDO
    function adminApproval(
        address token_addr,
        string memory projectName,
        uint256 amt,
        uint256 ratioForLP,
        uint256 priceForLP,
        uint256[4] memory privateSpecs,
        uint256[2] memory publicSpecs,
        uint256 maxAmtPerBuyer
        ) external onlyAdmin {
        IDOToken storage entry = tokenInfo[token_addr];
        require(entry.valid == false, "This token IDO is already active");
        require(entry.isApproved == false, "This token IDO is already approved");
        require(amt >= privateSpecs[1], "amount should not exceed private sale amount!");
        require(privateSpecs[2] >= block.timestamp && privateSpecs[2] < privateSpecs[3] && privateSpecs[3] < publicSpecs[1], "timestamp setting is wrong");
        entry.isApproved                     = true;
        entry.valid                          = false;
        entry.projectName                    = projectName;
        entry.symbol                         = IERC20(token_addr).symbol();
        entry.decimals                       = IERC20(token_addr).decimals();
        entry.amt                            = amt;
        entry.amtForLP                       = uint256(amt * ratioForLP) /100;
        entry.priceForLP                     = priceForLP;
        entry.amtOfCFXCollected              = 0;
        entry.privateSpecs                   = privateSpecs;
        entry.publicSpecs                    = publicSpecs;
        entry.maxAmtPerBuyer                 = maxAmtPerBuyer;
    }
    // Step 2: let the token owner transfer tokens to "this" and start its sale
    // TODO: need step 2 or not
    function addIDOToken(
        address token_addr
        ) external {
            IDOToken storage entry = tokenInfo[token_addr];
            require(entry.isApproved == true, "Contact admin to approval your IDO");
            require(entry.valid == false, "Your IDO already started");
            require(entry.privateSpecs[3] >= block.timestamp, "You start IDO too late! Contact admin to change schedule");
            entry.valid = true;
            entry.tokenOwner = msg.sender;
            SafeERC20.safeTransferFrom(IERC20(token_addr), msg.sender, address(this), entry.amt + entry.amtForLP);
    }
    // step 3.1: let users stake PPI to form its veToken
    // step 3.2: private sale
    function privateSale(address token_addr, uint256 amt_to_buy) external payable{
        IDOToken storage entry = tokenInfo[token_addr];
        require(entry.valid == true, "This token IDO has not started yet or expired");
        require(entry.privateSpecs[2] <= block.timestamp, "This token IDO has not started!");
        require(entry.privateSpecs[3] >= block.timestamp, "This token IDO already enterred public sale. No private sale");
        //if the amount of private is zero, revert the transaction
        require(entry.privateSpecs[1] > 0, "This token IDO already enterred public sale. Amount for private sale is zero");
        require (amt_to_buy <= entry.privateSpecs[1], "Not enough token to trade");
        require (msg.value >= amt_to_buy * entry.privateSpecs[2], "Not enough CFX to trade");
        require (amt_to_buy + entry.buyers[msg.sender] > entry.maxAmtPerBuyer, "It will or already exceed the max limit");
        if (swappiNFT.balanceOf(msg.sender) != 0) { //Check user has NFT or not.
            entry.amt = entry.amt - amt_to_buy;
            entry.privateSpecs[1] = entry.privateSpecs[1] - amt_to_buy;
            entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
            entry.amtOfCFXCollected = entry.amtOfCFXCollected + amt_to_buy * entry.privateSpecs[2];
        }else{
            //calculate current veToken
            uint256 veTokenAmt = VotingEscrow(votingEscrow).balanceOf(msg.sender);
            require (veTokenAmt >= entry.privateSpecs[0], "Your veToken cannot reach threshold");
            entry.amt = entry.amt - amt_to_buy;
            entry.privateSpecs[1] = entry.privateSpecs[1] - amt_to_buy;
            entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
            entry.amtOfCFXCollected = entry.amtOfCFXCollected + amt_to_buy * entry.privateSpecs[2];
        }
    }
    // step 3.3: public sale
    function publicSale(address token_addr, uint256 amt_to_buy) external payable{
        IDOToken storage entry = tokenInfo[token_addr];
        require(entry.privateSpecs[3] <= block.timestamp, "This token IDO has not started!");
        require(entry.publicSpecs[1] >= block.timestamp, "This token IDO already enterred public sale. No private sale");
        //if the amount of private is zero, revert the transaction
        require(entry.amt > 0, "This token IDO already enterred public sale. Amount for private sale is zero");
        require (amt_to_buy <= entry.amt, "Not enough token to trade");
        require (msg.value >= amt_to_buy * entry.publicSpecs[1], "Not enough CFX to trade");
        entry.amt = entry.amt - amt_to_buy;
        entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
        entry.amtOfCFXCollected = entry.amtOfCFXCollected + amt_to_buy * entry.publicSpecs[1];
    }
    // step 4.1: check ending and create LP
    function finalize(address token_addr) public returns (bool){
        IDOToken storage entry = tokenInfo[token_addr];
        if (entry.valid && entry.isApproved) {
            if (entry.publicSpecs[1] < block.timestamp || entry.amt  == 0) {
                //Now it is ending
                entry.valid = false;
                entry.isApproved = false;
                //Create LP
                // Get min between cfx or pre-defined token amt
                uint256 token_for_lp = (entry.amtForLP * entry.priceForLP > entry.amtOfCFXCollected)? entry.amtOfCFXCollected/entry.priceForLP : entry.amtForLP;
                uint256 cfx_for_lp = (entry.amtForLP * entry.priceForLP > entry.amtOfCFXCollected)? entry.amtOfCFXCollected : entry.amtForLP * entry.priceForLP;
                (bool success, bytes memory result) = router.call{value: cfx_for_lp}(abi.encodeWithSignature("addLiquidityETH(address,uint,uint,uint,address,uint)", token_addr, token_for_lp, 0, 0, block.timestamp + 1));
                if (success) {
                    (uint amountToken, uint amountETH, uint liquidity) = abi.decode(result, (uint, uint, uint));
                    SafeERC20.safeTransfer(IERC20(token_addr), entry.tokenOwner, entry.amt - amountToken);
                    SafeERC20.safeTransfer(IERC20(swappiFactory.getPair(token_addr, wcfx)), entry.tokenOwner, liquidity);
                    payable(entry.tokenOwner).transfer(entry.amtOfCFXCollected - amountETH);
                }else{
                    SafeERC20.safeTransfer(IERC20(token_addr), entry.tokenOwner, entry.amt);
                    payable(entry.tokenOwner).transfer(entry.amtOfCFXCollected);
                }
                return true;
            }
            return false;
        }
        return false;
    }
    //step 4.2: user claim tokens
    function claimAllTokens(address token_addr) external {
        finalize(token_addr);
        IDOToken storage entry = tokenInfo[token_addr];
        require(entry.publicSpecs[1] < block.timestamp || entry.amt  == 0, "IDO is still active");
        require(entry.buyers[msg.sender] > 0, "Your amount of this token is zero");
        SafeERC20.safeTransfer(IERC20(token_addr), msg.sender, entry.buyers[msg.sender]);
        entry.buyers[msg.sender] = 0;
    }
}