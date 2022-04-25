# Steps to Install

1) Clone the Repository.
2) Replace `CHAIN_ID` in `frontend/script.js`.
3) Replace other token address with your desired token address like USDT in `onchain/contracts/MyToken.sol` and `onchain/addresses.json`.
4) Install truffle globally by `npm install truffle -g`.
5) Run `npm install` in `onchain` folder.
6) Replace `onchain/node_modules/@openzeppelin/contracts/token/ERC777/ERC777.sol` with `ERC777.sol` in the repository root.
7) Run `truffle compile` in `onchain` folder to make sure there are no errors.

# Steps to Deploy

1) Add desired networks in `onchain/truffle.config.js`.
2) Create a `.secret` in `onchain` folder file and write your account private key in it.
3) Run `truffle migrate --reset --network NETWORK_NAME`. 

# Post Deployment

Run `npm run bundle` in `onchain` folder to copy latest contract ABIs and addresses to frontend.

# To run directly without interface

1) Token Swap
`truffle exec ./scripts/swap.js --network NETWORK_NAME AMOUNT_OF_TOKENS`

2) Withdraw Specific Amount
`truffle exec ./scripts/withdraw.js --network NETWORK_NAME AMOUNT_OF_TOKENS`

2) Withdraw All
`truffle exec ./scripts/withdrawAll.js --network NETWORK_NAME`