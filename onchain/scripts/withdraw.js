const process = require('process');
const args = process.argv;

const MyToken = artifacts.require("MyToken");

module.exports = async function() {
	const token = await MyToken.deployed();

	const accounts = await web3.eth.getAccounts();
	const account = accounts[0];
	
	const amount = await web3.utils.toWei(args[args.length - 1]);
	console.log(`Account: ${account} \t Amount: ${amount}`);
	
	console.log(`Starting`);
	
	await token.withdraw(amount);
	console.log('Withdrawal Successful');

	process.exit();
}