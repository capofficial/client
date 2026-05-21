import { get } from 'svelte/store'
import { getChainData } from '@lib/utils'
import { DEFAULT_HISTORY_COUNT } from '@lib/config'
import { address } from '@lib/stores'

const CSV_COLUMNS = [
	'orderId', 'timestamp', 'isLong', 'market', 'price', 'size',
	'margin', 'orderType', 'isReduceOnly', 'status', 'reason',
	'pnl', 'fee', 'expiry', 'cancelOrderId'
];

function escapeCSV(value) {
	if (value == null) return '';
	const str = String(value);
	if (str.includes(',') || str.includes('"') || str.includes('\n')) {
		return '"' + str.replace(/"/g, '""') + '"';
	}
	return str;
}

function toISO(timestamp) {
	if (!timestamp) return '';
	try { return new Date(timestamp * 1000).toISOString(); }
	catch(e) { return String(timestamp); }
}

function historyToCSV(items) {
	const header = CSV_COLUMNS.map(escapeCSV).join(',');
	const rows = items.map(item => CSV_COLUMNS.map(col => {
		let val = item[col];
		if (col === 'timestamp') val = toISO(val);
		if (col === 'isLong') val = val ? 'Long' : 'Short';
		if (col === 'isReduceOnly') val = val ? 'Yes' : 'No';
		if (col === 'expiry') val = val && val * 1 > 0 ? toISO(val) : '';
		if (col === 'cancelOrderId') val = val && val * 1 > 0 ? val : '';
		return escapeCSV(val);
	}).join(','));
	return [header, ...rows].join('\n');
}

function downloadCSV(csv, filename) {
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

// Inline Web Worker code for non-blocking CSV generation
const workerCode = `
	self.onmessage = async function(e) {
		const { dataEndpoint, userAddress, statuses } = e.data;
		const batchSize = ${DEFAULT_HISTORY_COUNT};
		let allItems = [];
		let skip = 0;
		let hasMore = true;

		try {
			while (hasMore) {
				const url = dataEndpoint + '/history/' + userAddress + '?chain=arbitrum&limit=' + batchSize + '&skip=' + skip + '&sortBy=timestamp&sortDirection=desc&status=' + statuses;
				const resp = await fetch(url);
				const orders = await resp.json();
				if (!orders || orders.length === 0) {
					hasMore = false;
				} else {
					allItems = allItems.concat(orders);
					skip += batchSize;
					hasMore = orders.length >= batchSize;
				}
			}
			self.postMessage({ type: 'done', items: allItems });
		} catch(err) {
			self.postMessage({ type: 'error', message: err.message });
		}
	};
`;

export async function exportHistory(statuses) {
	const dataEndpoint = getChainData('dataEndpoint');
	const userAddress = get(address);
	if (!dataEndpoint || !userAddress) return;

	const statusStr = (statuses || ['cancelled', 'executed', 'liquidated']).join(',');
	const now = new Date();
	const filename = `cap-history-${now.toISOString().slice(0,10)}.csv`;

	return new Promise((resolve, reject) => {
		try {
			const blob = new Blob([workerCode], { type: 'application/javascript' });
			const workerUrl = URL.createObjectURL(blob);
			const worker = new Worker(workerUrl);

			worker.onmessage = function(e) {
				URL.revokeObjectURL(workerUrl);
				if (e.data.type === 'done') {
					const csv = historyToCSV(e.data.items);
					downloadCSV(csv, filename);
					resolve(e.data.items.length);
				} else {
					reject(new Error(e.data.message));
				}
				worker.terminate();
			};

			worker.onerror = function(err) {
				URL.revokeObjectURL(workerUrl);
				// Fallback: run synchronously if Worker fails (CORS, etc.)
				fallbackExport(dataEndpoint, userAddress, statusStr, filename)
					.then(resolve)
					.catch(reject);
				worker.terminate();
			};

			worker.postMessage({
				dataEndpoint,
				userAddress: userAddress.toLowerCase(),
				statuses: statusStr
			});
		} catch(e) {
			// Fallback if Worker constructor fails
			fallbackExport(dataEndpoint, userAddress, statusStr, filename)
				.then(resolve)
				.catch(reject);
		}
	});
}

async function fallbackExport(dataEndpoint, userAddress, statuses, filename) {
	const batchSize = DEFAULT_HISTORY_COUNT;
	let allItems = [];
	let skip = 0;
	let hasMore = true;

	while (hasMore) {
		const url = `${dataEndpoint}/history/${userAddress}?chain=arbitrum&limit=${batchSize}&skip=${skip}&sortBy=timestamp&sortDirection=desc&status=${statuses}`;
		const resp = await fetch(url);
		const orders = await resp.json() || [];
		if (orders.length === 0) {
			hasMore = false;
		} else {
			allItems = allItems.concat(orders);
			skip += batchSize;
			hasMore = orders.length >= batchSize;
		}
	}

	const csv = historyToCSV(allItems);
	downloadCSV(csv, filename);
	return allItems.length;
}
