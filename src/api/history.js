import { get } from 'svelte/store'

import { DEFAULT_HISTORY_COUNT } from '@lib/config'
import { address, history, lastHistoryItemsCount, historySortKey, historyOrderStatusToShow } from '@lib/stores'
import { getLabelForAsset, getChainData } from '@lib/utils'

function getHistoryUrl(params) {
	const dataEndpoint = getChainData('dataEndpoint');
	const statusesToShow = get(historyOrderStatusToShow);

	return `${dataEndpoint}/history/${params.address}?chain=arbitrum&limit=${params.first}&skip=${params.skip}&sortBy=${params.sortBy}&sortDirection=${params.sortDirection}&status=${statusesToShow.join(',')}`;
}

export async function getUserHistory(params) {

	let _address = get(address);
	if (!_address) return;

	_address = _address.toLowerCase();

	if (!params) params = {};

	let {
		first,
		skip,
		diff
	} = params;

	if (!first) first = DEFAULT_HISTORY_COUNT;
	if (!skip) skip = 0;

	const sortKey = get(historySortKey); // [columnName, isDesc]

	let sortBy = 'timestamp';
	let sortDirection = 'desc';

	try {
		const response = await fetch(getHistoryUrl({address: _address, first, skip, sortBy, sortDirection}));
		const orders = await response.json() || [];

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
	let _address = get(address);
	if (!_address) return [];

	if (!params) params = {};

	const fromTimestamp = params.fromTimestamp || 0;
	const toTimestamp = params.toTimestamp || Date.now() / 1000;
	const pageSize = 500;
	const maxPages = 200;
	const sortBy = 'timestamp';
	const sortDirection = 'desc';

	_address = _address.toLowerCase();

	let skip = 0;
	let rows = [];

	for (let page = 0; page < maxPages; page++) {
		const response = await fetch(getHistoryUrl({address: _address, first: pageSize, skip, sortBy, sortDirection}));
		const pageRows = await response.json() || [];

		for (const row of pageRows) {
			const timestamp = row.timestamp * 1;
			if (!timestamp || timestamp > toTimestamp) continue;
			if (timestamp >= fromTimestamp) rows.push(row);
		}

		if (pageRows.length < pageSize) break;

		const oldestTimestamp = pageRows[pageRows.length - 1]?.timestamp * 1;
		if (fromTimestamp && oldestTimestamp && oldestTimestamp < fromTimestamp) break;

		skip += pageSize;
	}

	return rows;
}
