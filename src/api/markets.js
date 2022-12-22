import { get } from 'svelte/store'
import { BPS_DIVIDER, EXCLUDED_MARKETS } from '@lib/config'
import { getContract } from '@lib/contracts'
import { marketInfos, selectedAsset, selectedMarket, fundingRate, fundingRate24h, leverage, riskParams, oi, fundingTrackers } from '@lib/stores'
import { getAssetAddress, getUserSetting, setLeverageForSelectedMarket } from '@lib/utils'

export async function getMarketInfo(market) {
	if (!market) return;
	const contract = await getContract('MarketStore');
	
	let marketInfo;

	if (market == 'all') {
		let marketList = await contract.getMarketList();
		marketList = marketList.filter((m) => !EXCLUDED_MARKETS.includes(m));
		const _marketInfos = await contract.getMany(marketList);
		let infos = {};
		let i = 0;
		for (const m of marketList) {
			infos[m] = _marketInfos[i];
			i++;
		}
		marketInfos.set(infos);
		marketInfo = infos[get(selectedMarket)]
	} else {
		marketInfo = await contract.get(market);
		marketInfos.update((m) => {
			m[market] = marketInfo;
			return m;
		});
	}

	setLeverageForSelectedMarket();

	return true;
}

export async function getFundingRate(asset, market) {
	if (!asset) asset = get(selectedAsset);
	if (!market) market = get(selectedMarket);
	const contract = await getContract('Funding');
	const assetAddress = getAssetAddress(asset);
	const fr = await contract.getAccruedFunding(assetAddress, market, 30 * 24) / (30 * 24 * BPS_DIVIDER);
	fundingRate.set(fr);
}


export async function getFundingRate24h(asset, market) {
	if (!asset) asset = get(selectedAsset);
	if (!market) market = get(selectedMarket);
	const contract = await getContract('Funding');
	const assetAddress = getAssetAddress(asset);
	const fr = await contract.getAccruedFunding(assetAddress, market, 30 * 24 * 24) / (30 * 24 * BPS_DIVIDER);
	fundingRate24h.set(fr);
}

export async function getFundingTracker(asset, market) {
	const contract = await getContract('FundingStore');
	const fundingTracker = await contract.getFundingTracker(getAssetAddress(asset), market);
	fundingTrackers.update((fts) => {
		if (!fts[asset]) fts[asset] = {};
		fts[asset][market] = fundingTracker;
		return fts;
	});
}

export async function getOI(market, asset, noStore) {
	if (!asset) asset = get(selectedAsset);
	if (!market) market = get(selectedMarket);
	if (!asset || !market) return;
	const contract = await getContract('PositionStore');
	const assetAddress = getAssetAddress(asset);
	const _oi = await contract.getOI(assetAddress, market)
	if (noStore) {
		return _oi
	} else {
		oi.set(_oi);
	}
}

export async function getRiskParams(asset, market, noStore) {
	if (!asset) asset = get(selectedAsset);
	if (!market) market = get(selectedMarket);
	if (!asset || !market) return;
	const contract = await getContract('RiskStore');
	const assetAddress = getAssetAddress(asset);
	const _riskParams = await contract.getParams(assetAddress, market);
	if (noStore) {
		return _riskParams
	} else {
		riskParams.set(_riskParams);
	}
}