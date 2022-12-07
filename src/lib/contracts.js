import { ethers } from 'ethers'
import { get } from 'svelte/store'

import { ABIS } from './abis'
import { ADDRESS_ZERO, CHAINDATA, CURRENCY_DECIMALS } from './config'

import { provider, signer, chainId, unsupportedNetwork } from './stores'
import { getChainData } from './utils'

let addresses = {}; // cache
let contracts = {}; // cache

export async function getAddress(name) {
	return await getContract(name, false, true);
}

export async function getContract(name, hasSigner, addressOnly) {

	const _provider = get(provider);
	const _signer = get(signer);
	const _chainId = get(chainId);

	if (!_chainId || !_provider) return;

	if (!CHAINDATA[_chainId]) {
		// Chain not supported
		unsupportedNetwork.set(true);
		return;
	}

	unsupportedNetwork.set(false);

	if (addressOnly && addresses[name]) return addresses[name];
	if (addressOnly && name == 'ETH') return ADDRESS_ZERO;

	const dataStoreAddress = CHAINDATA[_chainId].dataStore;
	const dataStore = new ethers.Contract(dataStoreAddress, ABIS.DataStore, _provider);
	
	const contractAddress = addresses[name] || await dataStore.getAddress(name);

	addresses[name] = contractAddress;

	if (addressOnly) return contractAddress;

	let contract = new ethers.Contract(contractAddress, CURRENCY_DECIMALS[name] ? ABIS.erc20 : ABIS[name], _provider);
	
	if (hasSigner) contract = contract.connect(_signer);

	return contract;

}