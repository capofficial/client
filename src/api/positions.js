import { get } from 'svelte/store'
import { getContract } from '@lib/contracts'
import { address, positions } from '@lib/stores'
import { ADDRESS_ZERO, CURRENCY_DECIMALS } from '@lib/config'
import { parseUnits } from '@lib/formatters'
import { getLabelForAsset } from '@lib/utils'
import { showToast, showError } from '@lib/ui'

let isLoadingPositions = false;
export async function getUserPositions() {
	if (!get(address) || isLoadingPositions) return false;
	isLoadingPositions = true;
	const contract = await getContract('PositionStore');
	let _positions = [...await contract.getUserPositions(get(address))];
	positions.set(_positions);
	isLoadingPositions = false;
	return true;
}

export async function addMargin(market, asset, _margin) {

	const contract = await getContract('Positions', true);
	const _asset = getLabelForAsset(asset);
	const assetDecimals = CURRENCY_DECIMALS[_asset];
	let margin = parseUnits(_margin, assetDecimals);
	try {
		let value;
		if (asset == ADDRESS_ZERO) value = margin;
		let tx = await contract.addMargin(asset, market, margin, {value: value});
		let receipt = await tx.wait();
		if (receipt && receipt.status == 1) {
			showToast('Margin added.', 1);
			getUserPositions();
			return true;
		}
		return false;

	} catch(e) {
		showError(e);
	}

}

export async function removeMargin(market, asset, _margin) {

	const contract = await getContract('Positions', true);

	const _asset = getLabelForAsset(asset);
	const assetDecimals = CURRENCY_DECIMALS[_asset];

	let margin = parseUnits(_margin, assetDecimals);

	try {

		let tx = await contract.removeMargin(asset, market, margin);

		let receipt = await tx.wait();

		if (receipt && receipt.status == 1) {
			showToast('Margin removed.', 1);
			getUserPositions();
			return true;
		}

		return false;

	} catch(e) {
		showError(e);
	}

}