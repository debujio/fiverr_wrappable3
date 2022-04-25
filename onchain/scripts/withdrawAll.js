const process = require('process');

const MyToken = artifacts.require("MyToken");

module.exports = async function() {
	const token = await MyToken.deployed();

	const accounts = await web3.eth.getAccounts();
	const account = accounts[0];

	console.log(`Account: ${account}`);	
	console.log(`Starting`);
	
	await token.withdrawAll();
	console.log('Withdrawal of full token balance successful');

	process.exit();
}