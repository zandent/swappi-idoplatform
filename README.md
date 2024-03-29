# Swappi IDO Platform
## Compile contract
`npx hardhat compile`
## Unit test
`npx hardhat test`
## Testnet test
`npx hardhat run --network testnet scripts/<js files>`
> Order is from 0_* to 7_*. Change idoplatform and new token addresses once newly deployed.
## Testnet test together with front end
- (Optional) Token owner creates new token first (Here we use PPI ERC20 token)

    `npx hardhat run --network testnet scripts_with_frontend/0_deployNewToken.js`
- Check specifications under [script-config.js](script-config.js)

- Admin approves the IDO after collecting all information about IDO from token owner

    `npx hardhat run --network testnet scripts_with_frontend/1_adminApproval.js`

- Add new token information in [index.json under repo: swappi-core](https://github.com/swappidex/swappi-core/tree/dev/config/tokens/launchpad)

- Token owner first approves idoplatform with the required amount of new ERC-20 token and sends the same amount of token to idoplatform. Meanwhile, token owner starts IDO and move it into upcoming status.

    `npx hardhat run --network testnet scripts_with_frontend/1_1_addIDOToken.js`
    `npx hardhat run --network testnet scripts_with_frontend/1_2_adminAddWL.js`

- (Should be done if no users join and claim) Anyone can finalize to create LP and return remaining currencies back to token owner.

    `npx hardhat run --network testnet scripts_with_frontend/3_finalize.js`

## Mainnet test together with front end
- Fill new private keys in `mainNetPrivateKey` and `mainNetTokenOwnerKey` entries in [script-config.js](script-config.js).

- Follow Testnet test but use "`npx hardhat run --network mainnet mainnet_scripts_with_frontend/*`".

- In terms of `addIDOTOken` step, please use scripts [here at another github repo](https://github.com/zandent/swappi-idoplatform-token-owner-scripts).

## Struct and State Variables
```solidity
struct privateSpecs {
    uint256 veTokenThreshold; // Score to enter private sale
    uint256 amount;           // The remaining token amount only for private sale
    uint256 price;            // The price
    uint256 startTime;        // start time
    uint256 endTime;          // end time
    uint256 totalAmt;         // pre-defined total amout for private sale
    uint256 NFTThreshold;     //NFT score
    uint256 maxAmtPerBuyer;   //max limit for regular user
    uint256 amountExcludingWhitelist; //remaining amount excluding whitelist
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
    mapping(address => uint256) amtOfCFXPerBuyer; // record the cfx of token buyer buys
    mapping(address => uint256) whitelist; // record the max amount of whitelist addresses
    uint256 totalMaxAmountOfWhitelist; //total max amount for all addresses in whitelist
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
// Check the amount of the token user can claim till now
function getAmtOfTokenForBuyer(address token_addr, uint256 id, address buyer_addr) external view returns (uint256);
// Check the amount of CFX user committed till now
function getAmtOfCFXForBuyer(address token_addr, uint256 id, address buyer_addr) external view returns (uint256);
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
        uint256 numOfWhitelistMembers, // Length of whitelist in private sale
        uint256[5] memory privateData, // Score, amount, price, start time, end time
        uint256[2] memory publicData   // price, end time
    ) external onlyOwner;
function adminAddWhitelist(
        address token_addr,
        address[] memory whitelistAddress, //The length cannot exceed around 200 accounts in genernal
        uint256[] memory maxAmtPerEntryInWhitelist
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