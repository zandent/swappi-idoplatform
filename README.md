# Swappi IDO Platform
## Compile contract
`npx hardhat compile`
## Unit test
`npx hardhat test`
## Testnet test
npx hardhat run --network testnet scripts/<js files>
> Order is from 0_* to 7_*. Change idoplatform and new token addresses once newly deployed.
## Deploy Script (TODO)

## Struct and State Varibles
```solidity
struct privateSpecs {
    uint256 veTokenThreshold; // Score to enter private sale
    uint256 amount;           // The remaining token amount only for private sale
    uint256 price;            // The price
    uint256 startTime;        // start time
    uint256 endTime;          // end time
    uint256 totalAmt;         // pre-defined total amout for private sale
}
```
```solidity
struct publicSpecs {
    uint256 price;            // The price
    uint256 endTime;          // IDO end time
}
```
```solidity
struct IDOToken {
    bool isApproved; //assert the flag by admin to allow token owner to start IDO
    bool valid; //assert the falg by toke owner to be ready to start IDO
    address tokenOwner; //token owner
    string projectName; //name of the project   
    uint256 totalAmt;   //pre-defiend total amount for trading in IDO 
    uint256 amt; // The remaining amount to trade in IDO
    uint256 amtForLP; // Pre-defined amount for placing LP
    uint256 priceForLP; // Pre-defined amount of cfx for placing LP
    uint256 amtOfCFXCollected; // The total amount of CFX collected from users
    privateSpecs priSaleInfo; // privateSpecs
    publicSpecs pubSaleInfo; // publicSpecs
    mapping(address => uint256) buyers; // record the amount of token for each user to buy
}
```
```solidity
mapping(address => uint256) public currentIDOId; //Mapping from token address to current IDO id.
```
```solidity
mapping(address => mapping(uint256 => IDOToken)) public tokenInfo; // Mapping from token address and ID to its specs.
```
## Functions
```solidity
// Get Current IDO Id By token address
function getCurrentIDOIdByTokenAddr(address token_addr) external view returns (uint256);
// Check the IDO is active or not by token address and IDO Id
function isIDOActiveByID(address token_addr, uint256 id) external view returns (bool);
// Check the total amount of CFX collected till now by token address and IDO Id
function getAmtOfCFXCollected(address token_addr, uint256 id) external view returns (uint256);
```
### Regular steps
After token owner contacts and requests admin to raise IDO,
1. Admin approval IDO with specifications received from token owner:
```solidity
function adminApproval(
        address token_addr,            // ERC20 token address
        string memory projectName,     // Name
        uint256 amt,                   // The total amount of token to trade in IDO
        uint256 ratioForLP,            // Ratio of token for placing LP. 
                                       // E.g., if amt is 100 and ratio is 20, 
                                       // token owner should transfer 20 more tokens in next step
        uint256 priceForLP,            // Pre-defined amount of cfx for placing LP
        uint256[5] memory privateData, // Score, amount, price, start time, end time
        uint256[2] memory publicData   // price, end time
    ) external onlyOwner;
```
2. Token owner transfer required amounts of token into the contract, which indicated to be ready to start IDO:
```solidity
function addIDOToken(address token_addr) external;
```
> Token owner should invoke **approval()** to approve a totol amount of `amt*(100+ratioForLP)/100` new token to IDO Platform contract
3. After private sale starts, users can trade *amt_to_buy* of token with CFX by invoking:
```solidity
function privateSale(address token_addr, uint256 amt_to_buy) external payable;
```
> Users should know his owned vePPI reaches the required score. User should increase amount of PPI or locking time otherwise.
4. After private sale ends, public sale starts immediately. All users can trade:
```solidity
function publicSale(address token_addr, uint256 amt_to_buy) external payable;
```
> Note that under both sale periods, no one can claim tokens. All tokens and CFX remain locked in the contract.
5. After public sale ends, all users can claim tokens. First claimer will create LP for the new token.
```solidity
function claimAllTokens(address token_addr, uint256 IDOId) external;
```
> If token owner raised IDO multiple times, user still can claim token by specifying IDO Id.
6. Anyone can create LP by invoking:
```solidity
// true means LP is created successfully.
function finalize(address token_addr, uint256 IDOId) public returns (bool);
```
> The function will return all of the remaining tokens and CFX in the IDO to token owner as well.

> The function is built in **claimAllTokens()**. No need to invoke if some user claims already.

## Corner case handling (Not finished) (TODO)
1. If token owner failed to invoke **addIDOToken()**, admin can approval a new IDO even if the IDO is approved.
2. Token owner is better not to create LP for his token before raising IDO. He can set ratio as zero to avoid creating otherwise.
3. If new IDO is raised, public sale and private sale of past IDO for the same token address will be invalidated.