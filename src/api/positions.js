import { get } from 'svelte/store'
import { getContract } from '@lib/contracts'
import { address, positions, fundingTrackers, prices } from '@lib/stores'
import { ADDRESS_ZERO, CURRENCY_DECIMALS, BPS_DIVIDER } from '@lib/config'
import { parseUnits, formatPosition } from '@lib/formatters'
import { getLabelForAsset, getUPL } from '@lib/utils'
import { showToast, showError } from '@lib/ui'

let isLoadingPositions = false;

function expandUserPositionData(_positions) {

	var expandedPositions = []

	for (let i = 0; i < _positions.length; i++)
	{
		//formatting positions, will use formatted leverage from this
		let _formattedPosition = formatPosition(_positions[i], true)

		//calculating unrealized pnl
		let _price = get(prices)
		let _fundingTracker = get(fundingTrackers)

		let _upl = getUPL(_formattedPosition, _price[_formattedPosition.market])

		//calculating funding
		let _ft= _fundingTracker[_formattedPosition.asset]?.[_formattedPosition.market]	
		let _ftDiff = _ft * 1 - _formattedPosition.fundingTracker * 1;
			
		if (_positions[i].isLong)
		{
			_ftDiff = _ftDiff * -1	
		}
		
		let _funding = _formattedPosition.size * _ftDiff / BPS_DIVIDER || 0

		//calculating liquidation price
		let liqprice

		if (_positions[i].isLong) {
			liqprice = _formattedPosition.price * 1 - (_formattedPosition.margin*1 + _funding*1) * _formattedPosition.price / _formattedPosition.size;
		} else {
			liqprice = _formattedPosition.price * 1 + (_formattedPosition.margin*1 + _funding*1) * _formattedPosition.price / _formattedPosition.size;
		}

		//putting it all together
		let _position = {
			asset: _positions[i].asset,
			fundingTracker: _positions[i].fundingTracker,
			isLong: _positions[i].isLong,
			margin: _positions[i].margin,
			market: _positions[i].market,
			price: _positions[i].price,
			size: _positions[i].size,
			timestamp: _positions[i].timestamp,
			user: _positions[i].user,
			leverage: _formattedPosition.leverage,
			upl: _upl + _funding, //adding to match UI
			funding: _funding,
			liqprice: liqprice,
			length: 13,
		}

		expandedPositions.push(_position)

	}

	return expandedPositions
}

export async function getUserPositions() {
	if (!get(address) || isLoadingPositions) return false;
	isLoadingPositions = true;
	const contract = await getContract('PositionStore');
	let _positions = [...await contract.getUserPositions(get(address))]
	_positions = expandUserPositionData(_positions)
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