import { get } from 'svelte/store'

import { DEFAULT_HISTORY_COUNT } from '@lib/config'
import { address, history, lastHistoryItemsCount, historyOrderStatusToShow } from '@lib/stores'
import { getChainData } from '@lib/utils'

function getHistoryRequestUrl(params) {

	const dataEndpoint = getChainData('dataEndpoint');
	
	let _address = get(address);
	if (!_address) return;

	_address = _address.toLowerCase();

	if (!params) params = {};

	let {
		first,
		skip
	} = params;

	if (!first) first = DEFAULT_HISTORY_COUNT;
	if (!skip) skip = 0;

	const statusesToShow = get(historyOrderStatusToShow);

	let sortBy = 'timestamp';
	let sortDirection = 'desc';

	return `${dataEndpoint}/history/${_address}?chain=arbitrum&limit=${first}&skip=${skip}&sortBy=${sortBy}&sortDirection=${sortDirection}&status=${statusesToShow.join(',')}`;
}

export async function fetchUserHistoryPage(params) {
	const url = getHistoryRequestUrl(params);
	if (!url) return [];

	const response = await fetch(url);
	if (!response.ok) throw new Error(`History request failed with status ${response.status}`);

	const orders = await response.json() || [];
	return Array.isArray(orders) ? orders : [];
}

export async function getUserHistory(params) {

	try {
		if (!params) params = {};
		let { first, skip, diff } = params;

		if (!first) first = DEFAULT_HISTORY_COUNT;
		if (!skip) skip = 0;

		const orders = await fetchUserHistoryPage({first, skip});

		lastHistoryItemsCount.set(orders.length);

		if (diff) {
			// prepend any diff from existing orders
			const currentHistory = Object.assign([], get(history));
			let diffOrders = [];
			for (const order of orders) {
				const orderAlreadyLoaded = currentHistory.find((item) => item.orderId == order.orderId);
				if (!orderAlreadyLoaded) {
					diffOrders.push(order);
				}
			}
			if (diffOrders.length > 0) {
				history.set(diffOrders.concat(currentHistory));
				return true
			}
			return false;
		} else if (skip) {
			// append
			let _history = get(history);
			_history = _history.concat(orders);
			history.set(_history);
		} else {
			history.set(orders);
		}

	} catch(e) {
		console.error('/history GET error', params, e);
	}

	return true;
}

export async function getUserHistoryForExport(params) {
	if (!params) params = {};

	const first = params.first || 250;
	const fromTimestamp = params.fromTimestamp;
	const toTimestamp = params.toTimestamp;
	let skip = 0;
	let results = [];

	while (true) {
		const orders = await fetchUserHistoryPage({first, skip});
		if (!orders.length) break;

		for (const order of orders) {
			const timestamp = order.timestamp * 1;
			if (toTimestamp && timestamp > toTimestamp) continue;
			if (fromTimestamp && timestamp < fromTimestamp) continue;
			results.push(order);
		}

		if (orders.length < first) break;
		if (fromTimestamp && orders.some((order) => order.timestamp * 1 < fromTimestamp)) break;

		skip += first;
	}

	return results;
}
