const process = require('process');
const fs = require('fs');
const args = process.argv;

const MyToken = artifacts.require("MyToken");
const addresses = require('../addresses.json');

module.exports = async function() {
	const token = await MyToken.deployed();

	const otherTokenContractABI = JSON.parse(fs.readFileSync('./abi.json').toString());
	const otherToken = new web3.eth.Contract(otherTokenContractABI, addresses.otherTokenAddress);

	const accounts = await web3.eth.getAccounts();
	const account = accounts[0];
	
	const amount = await web3.utils.toWei(args[args.length - 1]);
	console.log(`Account: ${account} \t Amount: ${amount}`);
	
	console.log(`Starting`);
	
	await otherToken.methods.approve(token.address, amount).send({ from: account });
	console.log('Step 1 Finished: Got Token Spending Approval');
	await token.swap(amount);
	console.log('Step 2 Finished: Swapped Tokens');

	process.exit();
}