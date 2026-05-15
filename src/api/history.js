import { get } from 'svelte/store'

import { DEFAULT_HISTORY_COUNT } from '@lib/config'
import { address, history, lastHistoryItemsCount, historyOrderStatusToShow } from '@lib/stores'
import { getChainData } from '@lib/utils'

async function fetchHistoryPage(params = {}) {
	const dataEndpoint = getChainData('dataEndpoint');
	
	let _address = get(address);
	if (!_address) return [];

	_address = _address.toLowerCase();

	let {
		first,
		skip
	} = params;

	if (!first) first = DEFAULT_HISTORY_COUNT;
	if (!skip) skip = 0;

	const statusesToShow = get(historyOrderStatusToShow);

	let sortBy = 'timestamp';
	let sortDirection = 'desc';
	const query = new URLSearchParams({
		chain: 'arbitrum',
		limit: first,
		skip,
		sortBy,
		sortDirection,
		status: statusesToShow.join(',')
	});

	const response = await fetch(`${dataEndpoint}/history/${_address}?${query}`);
	const orders = await response.json() || [];
	return Array.isArray(orders) ? orders : [];
}

export async function getUserHistory(params) {

	if (!params) params = {};

	let {
		first,
		skip,
		diff
	} = params;

	if (!first) first = DEFAULT_HISTORY_COUNT;
	if (!skip) skip = 0;

	try {
		const orders = await fetchHistoryPage({first, skip});

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

export async function getUserHistoryExport(params = {}) {
	const {
		start,
		end,
		maxItems = 5000
	} = params;

	let allOrders = [];
	let skip = 0;
	const first = DEFAULT_HISTORY_COUNT;

	while (allOrders.length < maxItems) {
		const orders = await fetchHistoryPage({first, skip});
		if (!orders.length) break;

		for (const order of orders) {
			const timestamp = order.timestamp * 1;
			if ((!start || timestamp >= start) && (!end || timestamp <= end)) {
				allOrders.push(order);
			}
		}

		if (orders.length < first) break;

		const lastOrder = orders[orders.length - 1];
		if (start && lastOrder?.timestamp * 1 < start) break;

		skip += first;
	}

	return allOrders.slice(0, maxItems);
}
