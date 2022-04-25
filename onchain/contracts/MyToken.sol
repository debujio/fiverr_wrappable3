// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract MyToken is ERC777 {
	// IERC20 Interface lets us call IERC20 functions in other ERC20 contracts
	// TODO: Replace Address here with the token address you're targetting
	IERC20 otherToken = IERC20(address(0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1));

	// Owner of the contract
	address private owner;

	// Chainlink pricefeed
	AggregatorV3Interface internal priceFeed;

	// TODO: Replace Token Name and Symbol
	constructor() ERC777("MyTokenVersion2", "MT_V2", address(this)) {
		owner = msg.sender; // Set Deployer Address as the Owner
		// priceFeed = AggregatorV3Interface(0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada); // MATIC/USD	on Matic Mumbai
		priceFeed = AggregatorV3Interface(0x38C5ae3ee324ee027D88c5117ee58d07c9b4699b); // HBAR/USD 	on Ethereum Mainnet
	}

	uint private otherTokenDeposited;
	function swap(uint256 amount) public {
		otherToken.transferFrom(msg.sender, address(this), amount); // Transfer tokens from caller account to THIS Contract

		// Update Amount of USDT Received
		otherTokenDeposited += amount;

		// Mint New Tokens
		uint amountBasedOnFeed = (amount * 100000000) / getLatestPrice();
		_mint(msg.sender, amountBasedOnFeed, "", "");
	}

	// Modifier to restrict access to Owner
	modifier onlyOwner() {
		require(msg.sender == owner, "Access Denied");
		_;
	}

	// Function to withdraw
	// Only Owner can call it
	// Transfers a specific amount to Owner's account
	function withdraw(uint256 amount) public onlyOwner {
		otherToken.transfer(owner, amount); // Transfer from THIS Contract to Owner
	}

	// Function to withdraw entire token balance
	// Only Owner can call it
	// address(this) returns the Contract Address
	// Transfers the entire balance to Owner's account
	function withdrawAll() public onlyOwner {
		otherToken.transfer(owner, otherToken.balanceOf(address(this))); // Transfer entire token balance of THIS Contract to Owner
	}

	// Burn Function
	uint private tokensBurnt;
	uint private otherTokenWithdrawn;
	function burnTokens(uint256 amount) public {
		operatorSend(msg.sender, 0x000000000000000000000000000000000000dEaD, amount, "", ""); // Send the tokens to DEAD Address

		uint tokensInCirculation = totalSupply() - tokensBurnt;

		// burnPrice initially set to pool index | if less than market price then it's sent to market price
		uint burnPrice = (tokensInCirculation * 1000000000) / (otherTokenDeposited - otherTokenWithdrawn);
		uint marketPrice = getLatestPrice() * 10;
		if (burnPrice < marketPrice) burnPrice = marketPrice;

		uint otherTokenAmount = (amount / burnPrice) * 1000000000;
		otherToken.transfer(msg.sender, otherTokenAmount); 																		// Transfer from THIS Contract to sender
		

		// Update records
		tokensBurnt += amount;
		otherTokenWithdrawn += otherTokenAmount;
	}

	function getBurnPrice() public view returns (uint) {
		uint tokensInCirculation = totalSupply() - tokensBurnt;
		if (tokensInCirculation == 0) return getLatestPrice();

		// burnPrice initially set to pool index | if less than market price then it's sent to market price
		uint burnPrice = (tokensInCirculation * 100000000) / (otherTokenDeposited - otherTokenWithdrawn);
		uint marketPrice = getLatestPrice();
		if (burnPrice < marketPrice) burnPrice = marketPrice;

		return burnPrice;
	}

	function getMintPrice() public view returns (uint) {
		return getLatestPrice();
	}

	function getLatestPrice() internal view returns (uint) {
		(
			uint80 _roundID,
			int price,
			uint _startedAt,
			uint _timeStamp,
			uint80 _answeredInRound
		) = priceFeed.latestRoundData();
		return uint(price);
	}
}