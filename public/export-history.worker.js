const DEFAULT_LIMIT = 500;

function normalizeTimestamp(value) {
    if (!value) return 0;
    const timestamp = Number(value);
    if (!timestamp || Number.isNaN(timestamp)) return 0;
    return timestamp > 1000000000000 ? Math.floor(timestamp / 1000) : timestamp;
}

function csvSafe(value) {
    if (value === undefined || value === null) return '';
    let string = String(value);

    // Prevent spreadsheet formula injection for exported user/API data.
    if (/^[=+\-@]/.test(string)) {
        string = `'${string}`;
    }

    if (/[",\n\r]/.test(string)) {
        return `"${string.replace(/"/g, '""')}"`;
    }

    return string;
}

function getAssetLabel(asset, assetLabels) {
    if (!asset) return '';
    return assetLabels[asset.toLowerCase()] || asset;
}

function getSide(item) {
    if (item.isReduceOnly && item.isLong || item.isLong && item.pnl) return 'Close Short';
    if (item.isReduceOnly && !item.isLong || !item.isLong && item.pnl) return 'Close Long';
    return item.isLong ? 'Long' : 'Short';
}

function getOrderType(orderType) {
    if (!orderType) return 'Market';
    if (orderType == 1) return 'Limit';
    if (orderType == 2) return 'Stop';
    return orderType;
}

function serializeRow(item, assetLabels) {
    const timestamp = normalizeTimestamp(item.timestamp);
    const margin = Number(item.margin || 0);
    const size = Number(item.size || 0);

    return [
        item.id || item.orderId || '',
        item.orderId || '',
        timestamp || '',
        timestamp ? new Date(timestamp * 1000).toISOString() : '',
        getSide(item),
        item.market || '',
        item.price || '',
        item.size || '',
        item.margin || '',
        margin ? size / margin : '',
        getOrderType(item.orderType),
        item.isReduceOnly ? 'yes' : 'no',
        item.status || '',
        item.reason || '',
        item.pnl || '',
        item.pnlPercent || '',
        item.fee || '',
        item.fundingFee || '',
        item.expiry || '',
        item.cancelOrderId || '',
        getAssetLabel(item.asset, assetLabels)
    ];
}

async function fetchPage({ dataEndpoint, address, chain, statuses, limit, skip }) {
    const params = new URLSearchParams({
        chain,
        limit,
        skip,
        sortBy: 'timestamp',
        sortDirection: 'desc',
        status: statuses.join(',')
    });

    const response = await fetch(`${dataEndpoint}/history/${address.toLowerCase()}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`History export failed (${response.status})`);
    }

    return await response.json() || [];
}

self.onmessage = async (event) => {
    const {
        dataEndpoint,
        address,
        chain = 'arbitrum',
        statuses = [],
        startTimestamp,
        endTimestamp,
        assetLabels = {},
        limit = DEFAULT_LIMIT
    } = event.data || {};

    try {
        if (!dataEndpoint || !address) {
            throw new Error('Connect a wallet before exporting history.');
        }

        const headers = [
            'id',
            'orderId',
            'timestamp',
            'datetime',
            'side',
            'market',
            'price',
            'size',
            'margin',
            'leverage',
            'orderType',
            'reduceOnly',
            'status',
            'reason',
            'pnl',
            'pnlPercent',
            'fee',
            'fundingFee',
            'expiry',
            'cancelOrderId',
            'asset'
        ];

        const rows = [headers];
        let skip = 0;
        let fetched = 0;
        let exported = 0;
        let shouldStop = false;

        while (!shouldStop) {
            const page = await fetchPage({ dataEndpoint, address, chain, statuses, limit, skip });
            fetched += page.length;

            for (const item of page) {
                const timestamp = normalizeTimestamp(item.timestamp);

                if (startTimestamp && timestamp && timestamp < startTimestamp) {
                    shouldStop = true;
                    continue;
                }

                if (endTimestamp && timestamp && timestamp > endTimestamp) {
                    continue;
                }

                rows.push(serializeRow(item, assetLabels));
                exported++;
            }

            self.postMessage({ type: 'progress', fetched, exported });

            if (page.length < limit) {
                shouldStop = true;
            }

            skip += limit;
        }

        const csv = rows.map((row) => row.map(csvSafe).join(',')).join('\n');
        const buffer = new TextEncoder().encode(csv).buffer;
        self.postMessage({ type: 'done', buffer, count: exported }, [buffer]);
    } catch (error) {
        self.postMessage({ type: 'error', message: error.message || 'Failed to export history.' });
    }
};
