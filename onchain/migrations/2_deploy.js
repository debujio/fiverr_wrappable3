const fs = require('fs');
const MyToken = artifacts.require("MyToken");

module.exports = async function (deployer) {
  // Deploy MyToken
	await deployer.deploy(MyToken);

	// Store Address
	const tokenDeployed = await MyToken.deployed();
	
	const addressData = JSON.parse(fs.readFileSync('./addresses.json'));
	addressData.myTokenAddress = tokenDeployed.address;

	fs.writeFileSync('./addresses.json', JSON.stringify(addressData, null, 2));
};