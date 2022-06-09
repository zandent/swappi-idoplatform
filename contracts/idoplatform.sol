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
        uint256 amt;
        uint256[5] private_specs; //ratio_for_lp, veToken_threshold, amount, price, start time, end time
        uint256[2] public_specs; // price, end time
        mapping(address => LockedBalance) participants;
    }
    /// @notice Mapping from token address to its specs.
    mapping(address => IDOToken) public tokenInfo;
    /// @notice event
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
        uint256[5] memory private_specs,
        uint256[2] memory public_specs
        ) external onlyAdmin {
        IDOToken storage entry = tokenInfo[token_addr];
        require(entry.valid == false, "This token IDO is already active");
        require(entry.is_approved == false, "This token IDO is already approved");
        require(amt != 0, "amount should not be zero!");
        require(amt <= IERC20(token_addr).totalSupply(), "amount should not exceed this token total supply!");
        require(amt >= private_specs[2], "amount should not exceed private sale amount!");
        require(private_specs[3] >= block.timestamp, "timestamp setting is wrong");
        require(private_specs[3] < private_specs[4], "timestamp setting is wrong");
        require(private_specs[4] < public_specs[1], "timestamp setting is wrong");
        entry.is_approved                    = true;
        entry.valid                          = false;
        entry.project_name                   = project_name;
        entry.symbol                         = symbol;
        entry.decimals                       = decimals;
        entry.amt                            = amt;
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
            SafeERC20.safeTransferFrom(IERC20(token_addr), msg.sender, address(this), entry.amt);
    }
    // step 3.1: let users stake PPI to form its veToken
    // return start timestamp of lastest week
    function _adjustedTime(uint256 x) internal pure returns (uint256) {
        return (x / 1 weeks) * 1 weeks;
    }
    // //balance query
    // function balanceOf(address _account) external view returns (uint256) {
    //     return _balanceOfAtTimestamp(_account, block.timestamp);
    // }

    // function balanceOfAtTimestamp(address _account, uint256 _timestamp)
    //     external
    //     view
    //     returns (uint256)
    // {
    //     return _balanceOfAtTimestamp(_account, _timestamp);
    // }

    function _balanceOfAtTimestamp(uint256 amount, uint256 _timestamp, uint256 unlocktime)
        private
        view
        returns (uint256)
    {
        require(
            _timestamp >= block.timestamp,
            "Must be current or future time"
        );
        if (_timestamp > unlocktime) {
            return 0;
        }
        return (amount * (unlocktime - _timestamp)) / maxTime;
    }

    function stakePPI(
        address token_addr,
        uint256 amt_of_PPI,
        uint256 unlocktime
        ) external returns (uint256){
            IDOToken storage entry = tokenInfo[token_addr];
            require(entry.valid == true, "This token IDO has not started yet or expired");
            require(entry.private_specs[3] <= block.timestamp, "This token IDO has not started!");
            require(entry.private_specs[4] >= block.timestamp, "This token IDO already enterred public sale. No need to stake PPI");
            require(entry.amt != 0, "This token already sold out");
            unlocktime = _adjustedTime(unlocktime);
            require(unlocktime > block.timestamp, "Unlock time < current timestamp");
            require(unlocktime <= block.timestamp + maxTime, "Unlock time exceed maxlock time");
            LockedBalance storage user = entry.participants[msg.sender];
            user.amount = amt_of_PPI;
            user.unlockTime = unlocktime;
            SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), amt_of_PPI);
            return _balanceOfAtTimestamp(amt_of_PPI, block.timestamp, unlocktime);
    }
    function withdrawPPI(address token_addr) external {
        IDOToken storage entry = tokenInfo[token_addr];
        LockedBalance storage user = entry.participants[msg.sender];
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
        require(entry.private_specs[3] <= block.timestamp, "This token IDO has not started!");
        require(entry.private_specs[4] >= block.timestamp, "This token IDO already enterred public sale. No public sale");
        LockedBalance memory user = entry.participants[msg.sender];
        //TODO: calculate current veToken
        uint256 veTokenAmt = _balanceOfAtTimestamp(user.amount, block.timestamp, user.unlockTime);
        require (veTokenAmt >= entry.private_specs[1], "Your veToken cannot reach threshold");
        require (amt_to_buy <= entry.private_specs[2], "Not enough token to trade");
        require (msg.value >= amt_to_buy * entry.private_specs[3], "Not enough CFX to trade");
        entry.amt = entry.amt - amt_to_buy;
        entry.private_specs[2] = entry.private_specs[2] - amt_to_buy;
        SafeERC20.safeTransfer(IERC20(token_addr), msg.sender, amt_to_buy);
    }
    // step 3.3: check and poke into public sale
}