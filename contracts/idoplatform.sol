//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
contract idoplatform {
    /// @notice admin address
    address public owner;
    modifier onlyAdmin {
      require(msg.sender == owner);
      _;
    }
 
    // PPI token address
    IERC20 token; 
    //swappi nft token address
    IERC721 swappiNFT;
    /// @notice veToken specs (learned from https://github.com/swappidex/swappi-farm/blob/main/contracts/VotingEscrow.sol)
    uint256 public maxTime; // 4 years
    struct LockedBalance {
        uint256 amount;
        uint256 unlockTime;
    }

    /// @notice wrapped token called IDO token
    struct IDOToken {
        bool is_approved;
        bool valid;
        string project_name;
        string symbol;
        uint8 decimals;
        uint256 amt; // amount to sell
        uint256 amt_for_lp; //amount for place LP
        uint256[4] private_specs; //veToken_threshold, amount, price, start time, end time
        uint256[2] public_specs; // price, end time
        mapping(address => uint256) buyers; // record the amount of token buyer buys
    }
    /// @notice owner of PPIs
    mapping(address => LockedBalance) public participants;
    /// @notice Mapping from token address to its specs.
    mapping(address => IDOToken) public tokenInfo;
    /// @notice event
    event AmountIncreased(address indexed account, uint256 increasedAmount);
    event UnlockTimeIncreased(address indexed account, uint256 newUnlockTime);
    event Withdrawn(address indexed account, uint256 amount);
    constructor(
            address _token,
            address _swappiNFT
        ) {
            token = IERC20(token);
            token = IERC20(_token);
            swappiNFT = IERC721(swappiNFT);
            swappiNFT = IERC721(_swappiNFT);
            maxTime = 4 * 365 * 86400;
            owner = msg.sender;
        }
    // Step 1: admin should approval one token's IDO
    function adminApproval(
        address token_addr,
        string memory project_name,
        string memory symbol,
        uint8 decimals,
        uint256 amt,
        uint256 ratio_for_lp,
        uint256[4] memory private_specs,
        uint256[2] memory public_specs
        ) external onlyAdmin {
        IDOToken storage entry = tokenInfo[token_addr];
        require(entry.valid == false, "This token IDO is already active");
        require(entry.is_approved == false, "This token IDO is already approved");
        require(amt != 0, "amount should not be zero!");
        require(amt <= IERC20(token_addr).totalSupply(), "amount should not exceed this token total supply!");
        require(amt >= private_specs[1], "amount should not exceed private sale amount!");
        require(private_specs[2] >= block.timestamp, "timestamp setting is wrong");
        require(private_specs[2] < private_specs[3], "timestamp setting is wrong");
        require(private_specs[3] < public_specs[1], "timestamp setting is wrong");
        entry.is_approved                    = true;
        entry.valid                          = false;
        entry.project_name                   = project_name;
        entry.symbol                         = symbol;
        entry.decimals                       = decimals;
        entry.amt                            = amt;
        entry.amt_for_lp                     = uint256(amt * ratio_for_lp) /100;
        entry.private_specs                  = private_specs;
        entry.public_specs                   = public_specs;
    }
    // Step 2: let the token owner transfer tokens to "this" and start its sale
    function addIDOToken(
        address token_addr
        ) external {
            IDOToken storage entry = tokenInfo[token_addr];
            require(entry.is_approved == true, "Contact admin to approval your IDO");
            require(entry.valid == false, "Your IDO already started");
            require(entry.private_specs[3] >= block.timestamp, "You start IDO too late! Contact admin to change schedule");
            entry.valid = true;
            SafeERC20.safeTransferFrom(IERC20(token_addr), msg.sender, address(this), entry.amt + entry.amt_for_lp);
    }
    // step 3.1: let users stake PPI to form its veToken
    // return start timestamp of lastest week
    function _adjustedTime(uint256 x) internal pure returns (uint256) {
        return (x / 1 weeks) * 1 weeks;
    }
    //balance query
    function balanceOf(address _account) external view returns (uint256) {
        return _balanceOfAtTimestamp(_account, block.timestamp);
    }

    function balanceOfAtTimestamp(address _account, uint256 _timestamp)
        external
        view
        returns (uint256)
    {
        return _balanceOfAtTimestamp(_account, _timestamp);
    }

    function _balanceOfAtTimestamp(address _account, uint256 _timestamp)
        private
        view
        returns (uint256)
    {
        require(
            _timestamp >= block.timestamp,
            "Must be current or future time"
        );
        if (_timestamp > participants[_account].unlockTime) {
            return 0;
        }
        return (participants[_account].amount * (participants[_account].unlockTime - _timestamp)) / maxTime;
    }

    function stakePPI(
        uint256 amt_of_PPI,
        uint256 unlocktime
        ) external returns (uint256){
            unlocktime = _adjustedTime(unlocktime);
            require(unlocktime > block.timestamp, "Unlock time < current timestamp");
            require(unlocktime <= block.timestamp + maxTime, "Unlock time exceed maxlock time");
            LockedBalance storage user = participants[msg.sender];
            user.amount = amt_of_PPI;
            user.unlockTime = unlocktime;
            SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), amt_of_PPI);
            return _balanceOfAtTimestamp(msg.sender, block.timestamp);
    }
    function increaseAmount(address _account, uint256 _amount)
        external
    {
        LockedBalance storage user = participants[_account];

        require(_amount > 0, "amount is zero");
        require(user.amount > 0, "No existing lock found");
        require(
            user.unlockTime > block.timestamp,
            "Cannot add to expired lock"
        );

        uint256 newAmount = user.amount + _amount;
            _amount;
        user.amount = newAmount;

        SafeERC20.safeTransferFrom(IERC20(token),msg.sender, address(this), _amount);

        emit AmountIncreased(_account, _amount);
    }

    function increaseUnlockTime(uint256 _unlockTime) external {
        _unlockTime = _adjustedTime(_unlockTime);
        LockedBalance storage user = participants[msg.sender];

        require(user.amount > 0, "No existing lock found");
        require(
            user.unlockTime > block.timestamp,
            "Lock expired"
        );
        require(
            _unlockTime > user.unlockTime,
            "Can only increase lock duration"
        );
        require(
            _unlockTime <= block.timestamp + maxTime,
            "Voting lock cannot exceed max lock time"
        );

        user.unlockTime = _unlockTime;

        emit UnlockTimeIncreased(msg.sender, _unlockTime);
    }
    function withdrawPPI() external {
        LockedBalance storage user = participants[msg.sender];
        require(
            block.timestamp >= user.unlockTime,
            "The lock is not expired"
        );
        require(
            user.amount > 0,
            "The amount is zero"
        );
        uint256 amount = user.amount;
        user.unlockTime = 0;
        user.amount = 0;
        SafeERC20.safeTransfer(IERC20(token), msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }
    // step 3.2: private sale
    function private_sale(address token_addr, uint256 amt_to_buy) external payable{
        IDOToken storage entry = tokenInfo[token_addr];
        require(entry.valid == true, "This token IDO has not started yet or expired");
        require(entry.private_specs[2] <= block.timestamp, "This token IDO has not started!");
        require(entry.private_specs[3] >= block.timestamp, "This token IDO already enterred public sale. No private sale");
        //if the amount of private is zero, revert the transaction
        require(entry.private_specs[1] > 0, "This token IDO already enterred public sale. Amount for private sale is zero");
        require (amt_to_buy <= entry.private_specs[1], "Not enough token to trade");
        require (msg.value >= amt_to_buy * entry.private_specs[2], "Not enough CFX to trade");
        if (swappiNFT.balanceOf(msg.sender) != 0) {
            entry.amt = entry.amt - amt_to_buy;
            entry.private_specs[1] = entry.private_specs[1] - amt_to_buy;
            entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
        }else{
            //calculate current veToken
            uint256 veTokenAmt = _balanceOfAtTimestamp(msg.sender, block.timestamp);
            require (veTokenAmt >= entry.private_specs[0], "Your veToken cannot reach threshold");
            entry.amt = entry.amt - amt_to_buy;
            entry.private_specs[1] = entry.private_specs[1] - amt_to_buy;
            entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
        }
    }
    // step 3.3: public sale
    function public_sale(address token_addr, uint256 amt_to_buy) external payable{
        IDOToken storage entry = tokenInfo[token_addr];
        require(entry.private_specs[3] <= block.timestamp, "This token IDO has not started!");
        require(entry.public_specs[1] >= block.timestamp, "This token IDO already enterred public sale. No private sale");
        //if the amount of private is zero, revert the transaction
        require(entry.amt > 0, "This token IDO already enterred public sale. Amount for private sale is zero");
        require (amt_to_buy <= entry.amt, "Not enough token to trade");
        require (msg.value >= amt_to_buy * entry.public_specs[1], "Not enough CFX to trade");
        entry.amt = entry.amt - amt_to_buy;
        entry.buyers[msg.sender] = entry.buyers[msg.sender] + amt_to_buy;
    }
    // step 4.1: check ending and create LP
    function checkEndingandCreateLP(address token_addr) external onlyAdmin returns (bool){
        IDOToken storage entry = tokenInfo[token_addr];
        if (entry.public_specs[1] < block.timestamp || entry.amt  == 0) {
            //Now it is ending
            entry.valid = false;
            entry.is_approved = false;
            //Create LP
            return true;
        }
        return false;
    }
    //step 4.2: user claim tokens
    function claimAllTokens(address token_addr) external {
        IDOToken storage entry = tokenInfo[token_addr];
        require(entry.public_specs[1] < block.timestamp || entry.amt  == 0, "IDO is still active");
        require(entry.buyers[msg.sender] > 0, "Your amount of this token is zero");
        SafeERC20.safeTransfer(IERC20(token_addr), msg.sender, entry.buyers[msg.sender]);
        entry.buyers[msg.sender] = 0;
    }

}