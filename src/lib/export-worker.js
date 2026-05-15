// Web Worker for CSV export — runs off the main thread
// Prevents UI blocking when processing large trade history datasets

self.onmessage = function(e) {
	const { items, columns, formatters } = e.data;

	if (!items || items.length === 0) {
		self.postMessage({ error: 'No trades to export' });
		return;
	}

	// Build header row
	const headers = columns.map(c => c.label);
	let csv = headers.join(',') + '\n';

	// Build data rows
	for (const item of items) {
		const row = columns.map(col => {
			let value = item[col.key];

			// Apply formatter if provided
			if (col.format && formatters[col.format]) {
				value = formatters[col.format](value);
			}

			// Handle undefined/null
			if (value === undefined || value === null) {
				return '';
			}

			// Escape CSV: wrap in quotes if contains comma, quote, or newline
			const str = String(value);
			if (str.includes(',') || str.includes('"') || str.includes('\n')) {
				return '"' + str.replace(/"/g, '""') + '"';
			}
			return str;
		});
		csv += row.join(',') + '\n';
	}

	self.postMessage({ csv });
};
