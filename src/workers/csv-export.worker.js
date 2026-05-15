/**
 * Web Worker for CSV export — offloads CSV string generation from main thread.
 * Receives { data: historyItems[], timeframe: string }
 * Returns { csv: string, filename: string }
 */

function formatCSVValue(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Escape double quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    return d.toISOString().replace('T', ' ').substring(0, 19);
}

function formatSide(isLong) {
    return isLong ? 'Long' : 'Short';
}

function formatOrderType(type) {
    const types = { 0: 'Market', 1: 'Limit', 2: 'Stop Market', 3: 'Stop Limit' };
    return types[type] || String(type);
}

self.onmessage = function (e) {
    const { items, timeframe } = e.data;

    // Filter by timeframe
    let filtered = items;
    if (timeframe && timeframe !== 'all') {
        const now = Math.floor(Date.now() / 1000);
        const days = parseInt(timeframe);
        const cutoff = now - days * 86400;
        filtered = items.filter(item => item.timestamp >= cutoff);
    }

    // CSV header
    const headers = [
        'Order ID', 'Timestamp', 'Market', 'Side', 'Type',
        'Price', 'Size', 'Margin', 'Fee', 'PnL', 'Status'
    ];

    // CSV rows
    const rows = filtered.map(item => [
        item.orderId || '',
        formatDate(item.timestamp),
        item.market || '',
        formatSide(item.isLong),
        formatOrderType(item.orderType),
        item.price || '',
        item.size || '',
        item.margin || '',
        item.fee || '',
        item.pnl || item.upl || '',
        item.status || item.orderStatus || '',
    ].map(formatCSVValue));

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const dateStr = new Date().toISOString().substring(0, 10);
    const filename = `cap-trading-history-${dateStr}.csv`;

    self.postMessage({ csv, filename, count: filtered.length, total: items.length });
};
