import OtherToken from './abi.json';
import MyToken from './build/contracts/MyToken.json';

const addresses = require('./addresses.json');

module.exports = {
	contracts: {
		OtherToken,
		MyToken: MyToken.abi
	},
	addresses: {
		otherToken: addresses.otherTokenAddress,
		myToken: addresses.myTokenAddress
	}
};