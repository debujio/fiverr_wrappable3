const RPC_URL = 'https://matic-mumbai.chainstacklabs.com';
const CHAIN_ID = 80001;
const CONTRACT_ADDRESSES = {
	myToken: bundle.addresses.myToken,
	otherToken: bundle.addresses.otherToken
};

function loadWeb3() {
	window.web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
}
function loadContracts() {
	const web3 = window.web3;

	const myTokenContract = new web3.eth.Contract(bundle.contracts.MyToken, CONTRACT_ADDRESSES.myToken);
	const otherTokenContract = new web3.eth.Contract(bundle.contracts.OtherToken, CONTRACT_ADDRESSES.otherToken);

	window.contracts = {
		myToken: {
			contract: myTokenContract,
			address: CONTRACT_ADDRESSES.myToken
		},
		otherToken: {
			contract: otherTokenContract,
			address: CONTRACT_ADDRESSES.otherToken
		}
	};
}
let account = null;
function handleAccountsChanged(accounts) {
	if (accounts.length >= 1) {
		account = accounts[0];
		document.querySelector('#accountAddress').textContent = account;
	} else {
		document.querySelector('#accountAddress').textContent = 'X';
	}
}

function isValidationError() {
	if (account == null) return 'Wallet Not Connected';

	const inputValue = document.querySelector('#amount').value;
	if (inputValue == '' || isNaN(inputValue) || inputValue < 0) return 'Invalid Amount';

	return null;
}

function connectWallet() {
	window.ethereum.enable();

	window.ethereum.request({ method: 'eth_accounts' })
		.then(accounts => handleAccountsChanged(accounts))
		.catch(err => alert(err.message));
}

function sendTrx(to, data) {
	const trx = {
		to,
		from: account,
		value: 0,
		data,
		gas: '100000'
	};

	window.ethereum.request({ method: 'eth_sendTransaction', params: [trx] })
	.then(trxhash => {
		checkTrx(trxhash);
	})
	.catch(err => {
		alert(`Error: ${err.message}`);
	});
}

const CHECK_TRX_INTERVAL = 2000;
function checkTrx(trxHash) {
	window.web3.eth.getTransactionReceipt(trxHash, (err, res) => {
		if (err) return alert(`Error: ${err.message}`);

		if (res != null) {
			if (res.status) alert(`Transaction Successful`);
			else alert(`Transaction Failed`);
		} else {
			setTimeout(() => {
				checkTrx(trxHash);
			}, CHECK_TRX_INTERVAL);
		}
	});
}

async function step1() {
	const err = isValidationError();
	if (err) return alert(`Error: ${err}`);

	const inputValue = document.querySelector('#amount').value;
	const valueInWei = window.web3.utils.toWei(inputValue);

	const extraData = await window.contracts.otherToken.contract.methods['approve'](window.contracts.myToken.address, valueInWei);
	const data = extraData.encodeABI();

	sendTrx(window.contracts.otherToken.address, data);
}

async function step2() {
	const err = isValidationError();
	if (err) return alert(`Error: ${err}`);

	const inputValue = document.querySelector('#amount').value;
	const valueInWei = window.web3.utils.toWei(inputValue);

	const allowance = await window.contracts.otherToken.contract.methods['allowance'](account, window.contracts.myToken.address).call();
	if (allowance < valueInWei) return alert('Error: Not Enough Allowance');

	const extraData = await window.contracts.myToken.contract.methods['swap'](valueInWei);
	const data = extraData.encodeABI();

	sendTrx(window.contracts.myToken.address, data);
}

async function burn() {
	const err = isValidationError();
	if (err) return alert(`Error: ${err}`);

	const inputValue = document.querySelector('#amount').value;
	const valueInWei = window.web3.utils.toWei(inputValue);

	const extraData = await window.contracts.myToken.contract.methods['burnTokens'](valueInWei);
	const data = extraData.encodeABI();

	sendTrx(window.contracts.myToken.address, data);
}

async function getPrices() {
	const burnPrice = await window.contracts.myToken.contract.methods['getBurnPrice']().call();
	document.getElementById('burnPriceValue').textContent = (burnPrice / 100000000).toFixed(6);

	const mintPrice = await window.contracts.myToken.contract.methods['getMintPrice']().call();
	document.getElementById('mintPriceValue').textContent = (mintPrice / 100000000).toFixed(6);
}


if (window.ethereum) {
	loadWeb3();
	loadContracts();
	getPrices();
	
	window.ethereum.on('accountsChanged', handleAccountsChanged);
	
	connectWallet();
} else {
	alert('No Web3 Wallet Found. Consider installing MetaMask.');
}