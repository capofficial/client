import { get } from 'svelte/store'

import { DEFAULT_HISTORY_COUNT } from '@lib/config'
import { address, history, lastHistoryItemsCount, historySortKey, historyOrderStatusToShow } from '@lib/stores'
import { getLabelForAsset, getChainData } from '@lib/utils'

export async function getUserHistory(params) {

	const dataEndpoint = getChainData('dataEndpoint');
	
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

	const statusesToShow = get(historyOrderStatusToShow);

	const sortKey = get(historySortKey); // [columnName, isDesc]

	let sortBy = 'timestamp';
	let sortDirection = 'desc';

	try {
		const response = await fetch(`${dataEndpoint}/history/${_address}?limit=${first}&skip=${skip}&sortBy=${sortBy}&sortDirection=${sortDirection}&status=${statusesToShow.join(',')}`);
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