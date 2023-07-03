import { ethers } from 'ethers'
import { get } from 'svelte/store'
import { DEFAULT_CHAIN_ID, CHAINDATA, ALCHEMY_SETTINGS } from './config'
import { chainId, signer, provider, address } from './stores'
import { showToast, hideModal } from './ui'
import { getMarketInfo } from '@api/markets'
import { bustCache } from './contracts'

import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import coinbaseModule from '@web3-onboard/coinbase'
import walletConnectModule from '@web3-onboard/walletconnect'

// set default provider, when user is not connected
chainId.set(DEFAULT_CHAIN_ID);
// let _provider = new ethers.providers.JsonRpcProvider(CHAINDATA[DEFAULT_CHAIN_ID].rpc);
let _provider = new ethers.providers.AlchemyProvider(ALCHEMY_SETTINGS.network, ALCHEMY_SETTINGS.apiKey);
provider.set(_provider);

const injected = injectedModule()
const coinbaseWallet = coinbaseModule()
const walletConnect = walletConnectModule({
		version: 2,
    connectFirstChainId: true,
    handleUri: uri => console.log(uri),
    projectId: '7a24d481deb5bf69fa79c9bb19268cbd', // ***New Param* Project ID associated with [WalletConnect account](https://cloud.walletconnect.com)
    requiredChains: [1, 42161] // chains required to be supported by WC wallet
})

const appMetadata = {
  name: 'CAP',
  icon: '/im/logo.svg',
  logo: '/im/logo.svg',
  description: 'Decentralized Perps',
  recommendedInjectedWallets: [
    { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
    { name: 'MetaMask', url: 'https://metamask.io' },
    { name: 'WalletConnect', url: 'https://walletconnect.org' },
  ],
  agreement: {
    version: '1.0.0',
    termsUrl: 'https://docs.cap.io/legal/terms-of-use',
    privacyUrl: 'https://docs.cap.io/legal/risk-disclosure'
  },
  gettingStartedGuide: 'https://docs.cap.io',
  explore: 'https://docs.cap.io/other/contracts'
}

const onboard = Onboard({
  wallets: [injected, coinbaseWallet, walletConnect],
  chains: [
	  {
	  	id: 42161,
	  	token: 'ETH',
	  	label: 'Arbitrum',
	  	rpcUrl: 'https://arb1.arbitrum.io/rpc'
	  },
	  {
	  	id: 84531,
	  	token: 'ETH',
	  	label: 'Base Goerli',
	  	rpcUrl: 'https://goerli.base.org'
	  }
  ],
  connect: {
  	autoConnectLastWallet: true
  },
  appMetadata,
  theme: 'dark'
})

let connected;
let lastChainId = DEFAULT_CHAIN_ID;
const state = onboard.state.select();
const { unsubscribe } = state.subscribe(async (update) => {
	// console.log('state update: ', update);

	const wallets = update.wallets;

	// console.log(wallets)

	if (wallets[0]) {
		
	  // create an ethers provider with the last connected wallet provider
	  const ethersProvider = new ethers.providers.Web3Provider(wallets[0].provider, 'any')

	  const _signer = ethersProvider.getSigner(wallets[0]?.accounts?.[0]?.address)

	  // console.log('_signer', _signer);
	  signer.set(_signer);
	  address.set(await _signer.getAddress());

	  // console.log('addr', get(address));

	  const network = await ethersProvider.getNetwork()

	  chainId.set(network.chainId);

	  provider.set(ethersProvider);

	  // console.log('network.chainId', network.chainId);

	  if (network.chainId != lastChainId) {
	  	lastChainId = network.chainId;
	  	setTimeout(() => {
		  	bustCache();
		  	getMarketInfo('all');
	  	}, 3000);
	  }

	} else {
		connected = false;
		// disconnection
		signer.set(null);
		address.set(null);
	}

});

export async function connect() {
	await onboard.connectWallet()
}

export async function updateBalances() {
	onboard.state.actions.updateBalances();
}


let _walletConnect;

export async function checkMetamaskSession() {
	if (window.ethereum) connectMetamask(true);
}

export async function connectMetamask(resume) {

	let metamask = window.ethereum;
	if (!metamask && !resume) return showToast('Metamask is not installed.');
	
	_provider = new ethers.providers.Web3Provider(metamask);

	let accounts;
	if (resume) {
		accounts = await _provider.send('eth_accounts');
	} else {
		accounts = await _provider.send("eth_requestAccounts", []);
		hideModal();
	}

	if (!accounts || !accounts.length) return;

	const network = await _provider.getNetwork();
	chainId.set(network.chainId);
	// console.log('network.chainId', network.chainId);
	metamask.on('chainChanged', (_chainId) => {
		window.location.reload();
	});

	if (network.chainId != 42161) {
		provider.set(_provider);
		bustCache();
		getMarketInfo('all');
	}

	if (accounts.length) {
		handleAccountsChanged();
	}
	metamask.on('accountsChanged', handleAccountsChanged);

}

export async function connectWalletConnect() {

	let script = document.createElement("script");
	script.setAttribute("src", "https://unpkg.com/@walletconnect/web3-provider@1.6.6/dist/umd/index.min.js");
	document.body.appendChild(script);

	script.addEventListener("load", scriptLoaded, false);

	async function scriptLoaded() {

		_walletConnect = new WalletConnectProvider.default({
			rpc: {
				42161: CHAINDATA[42161].rpc,
				84531: CHAINDATA[84531].rpc
			}
		});

		await _walletConnect.enable();

		hideModal();

		_provider = new ethers.providers.Web3Provider(_walletConnect);

		// provider.set(_provider);
		const network = await _provider.getNetwork();
		chainId.set(network.chainId);

		handleAccountsChanged();

		// Subscribe to accounts change
		_walletConnect.on("accountsChanged", handleAccountsChanged);

		// Subscribe to chainId change
		_walletConnect.on("chainChanged", (chainId) => {
			window.location.reload();
		});

		// Subscribe to session disconnection
		_walletConnect.on("disconnect", (code, reason) => {
			console.log('disconnect', code, reason);
			window.location.reload();
		});

	}

}

export async function disconnectWallet(force) {
	if (force && _walletConnect) await _walletConnect.disconnect();
	signer.set(null);
}

export async function switchChains() {

	let wallet;
	if (window.ethereum) {
		wallet = window.ethereum;
	} else {
		wallet = _walletConnect;
	}

	if (!wallet) return showToast("Can't connect to wallet.");

	try {
		await wallet.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: '0xA4B1' }],
		});
	} catch (switchError) {
		// This error code indicates that the chain has not been added to MetaMask.
		if (switchError.code === 4902) {
			try {
				await wallet.request({
					method: 'wallet_addEthereumChain',
					params: [{
						chainId: '0xA4B1',
						chainName: 'Arbitrum One',
						rpcUrls: [CHAINDATA[42161]['rpc']],
						nativeAsset: {
							name: 'ETH',
							symbol: 'ETH',
							decimals: 18
						},
						blockExplorerUrls: [CHAINDATA[42161]['explorer']]
					}],
				});
			} catch (addError) {
				// handle "add" error
			}
		}
		// handle other "switch" errors
	}

}

async function handleAccountsChanged() {
	const _signer = _provider.getSigner();
	
}