import { ethers } from 'ethers'
import { get } from 'svelte/store'
import { DEFAULT_CHAIN_ID, CHAINDATA, ALCHEMY_SETTINGS, WALLET_CONNECT_PROJECT_ID } from './config'
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
let _provider = new ethers.providers.AlchemyProvider(ALCHEMY_SETTINGS.network, ALCHEMY_SETTINGS.apiKey);
provider.set(_provider);

const injected = injectedModule()
const coinbaseWallet = coinbaseModule()
const walletConnect = walletConnectModule({
	version: 2,
    connectFirstChainId: true,
    handleUri: uri => console.log(uri),
    projectId: WALLET_CONNECT_PROJECT_ID,
    requiredChains: [1, 42161] // chains required to be supported by WC wallet
})

const appMetadata = {
  name: 'CAP',
  icon: '/favicon/favicon-32x32.png',
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
	accountCenter: {
      desktop: {
        enabled: true,
        position: 'topRight'
      },
      mobile: {
        enabled: true,
        position: 'topRight'
      }
    },
  wallets: [injected, coinbaseWallet, walletConnect],
  chains: [
	  {
	  	id: 42161,
	  	token: 'ETH',
	  	label: 'Arbitrum',
	  	rpcUrl: CHAINDATA[42161].rpc
	  },
	  {
	  	id: 8453,
	  	token: 'ETH',
	  	label: 'Base',
	  	rpcUrl: CHAINDATA[8453].rpc
	  },
	  {
	  	id: 84531,
	  	token: 'ETH',
	  	label: 'Base Goerli',
	  	rpcUrl: CHAINDATA[84531].rpc
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

	  if (network.chainId === 1 ) {
		await onboard.setChain({ chainId: '0x' + DEFAULT_CHAIN_ID.toString(16) })
	  }

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

export async function disconnectWallet(force) {
	const [primaryWallet] = onboard.state.get().wallets
	if(force && primaryWallet) {
		await onboard.disconnectWallet({ label: primaryWallet.label })
	}
	signer.set(null);
}

export async function switchChains() {
	const [onboardWallet] = onboard.state.get().wallets
	let wallet;
	if (window.ethereum) {
		wallet = window.ethereum;
	} else {
		wallet = onboardWallet;
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