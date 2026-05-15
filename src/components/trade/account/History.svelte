<script>

    import Table from '@components/layout/table/Table.svelte'
    import Row from '@components/layout/table/Row.svelte'
    import Cell from '@components/layout/table/Cell.svelte'

    import { onMount, onDestroy } from 'svelte'
    import { LOADING_ICON } from '@lib/icons'

    import { DEFAULT_HISTORY_COUNT, DEFAULT_HISTORY_SORT_KEY } from '@lib/config'
    import { 
        formatHistoryItem, 
        formatPnl, 
        formatForDisplay, 
        formatOrderType,
        formatSide, 
        formatDate,
        formatMarketName,
        formatPriceForDisplay
    } from '@lib/formatters'
    import { address, historySortKey, historySorted, historyColumnsToShow, lastHistoryItemsCount, orders, history } from '@lib/stores'
    import { showModal } from '@lib/ui'
    import { saveUserSetting } from '@lib/utils'

    import { getUserHistory } from '@api/history'

    export let allColumns;

    let base_timeout = 60 * 1000;

    let isLoading = true, t, timeout = base_timeout, fastTimeoutCount = 0;
    async function fetchData() {
        clearTimeout(t);
        const hasDiff = await getUserHistory();
        if (hasDiff) {
            timeout = base_timeout;
            fastTimeoutCount = 0;
        }
        if (timeout < base_timeout) {
            fastTimeoutCount++;
            if (fastTimeoutCount > 6) {
                timeout = base_timeout;
            }
        }
        isLoading = false;
    }
    $: fetchData($address, timeout);

    $: saveUserSetting('historySortKey', $historySortKey);
    $: saveUserSetting('historyColumnsToShow', $historyColumnsToShow);

    let loadingMore;

    onMount(() => {
        let lastFetchedItems = [];
        let itemsPerPage = DEFAULT_HISTORY_COUNT;
        let skip = itemsPerPage;
        window.onscroll = async () => {
            if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 120) {
                if (loadingMore || $lastHistoryItemsCount < itemsPerPage) return;
                loadingMore = true;
                await getUserHistory({first: itemsPerPage, skip});
                loadingMore = false;
                skip += itemsPerPage;
            }
        }
    });

    // ── CSV Export ──────────────────────────────────────

    let exporting = false;
    let exportTimeframe = 'all';

    const timeframeOptions = [
        { label: 'All time', value: 'all' },
        { label: 'Last 7 days', value: '7' },
        { label: 'Last 30 days', value: '30' },
        { label: 'Last 90 days', value: '90' },
    ];

    function triggerExport() {
        const items = $history;
        if (!items || items.length === 0) return;

        exporting = true;

        // Use web worker if available, fallback to inline
        if (typeof Worker !== 'undefined') {
            try {
                const worker = new Worker(
                    new URL('../../workers/csv-export.worker.js', import.meta.url)
                );
                worker.onmessage = (e) => {
                    downloadCSV(e.data.csv, e.data.filename);
                    exporting = false;
                    worker.terminate();
                };
                worker.onerror = () => {
                    // Fallback to inline
                    const result = generateCSVInline(items, exportTimeframe);
                    downloadCSV(result.csv, result.filename);
                    exporting = false;
                };
                worker.postMessage({ items, timeframe: exportTimeframe });
                return;
            } catch (e) {
                // Worker not supported, fallback inline
            }
        }

        // Inline fallback
        const result = generateCSVInline(items, exportTimeframe);
        downloadCSV(result.csv, result.filename);
        exporting = false;
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

    // Inline CSV generation (fallback when Web Worker unavailable)
    function generateCSVInline(items, timeframe) {
        let filtered = items;
        if (timeframe && timeframe !== 'all') {
            const now = Math.floor(Date.now() / 1000);
            const cutoff = now - parseInt(timeframe) * 86400;
            filtered = items.filter(item => item.timestamp >= cutoff);
        }

        function esc(v) {
            if (v === null || v === undefined) return '';
            const s = String(v);
            return s.includes(',') || s.includes('"') || s.includes('\n')
                ? '"' + s.replace(/"/g, '""') + '"'
                : s;
        }

        function fmtDate(ts) {
            if (!ts) return '';
            return new Date(ts * 1000).toISOString().replace('T', ' ').substring(0, 19);
        }

        function fmtSide(isLong) { return isLong ? 'Long' : 'Short'; }
        function fmtType(type) {
            const types = { 0: 'Market', 1: 'Limit', 2: 'Stop Market', 3: 'Stop Limit' };
            return types[type] || String(type);
        }

        const headers = ['Order ID', 'Timestamp', 'Market', 'Side', 'Type', 'Price', 'Size', 'Margin', 'Fee', 'PnL', 'Status'];
        const rows = filtered.map(item => [item.orderId, fmtDate(item.timestamp), item.market, fmtSide(item.isLong), fmtType(item.orderType), item.price, item.size, item.margin, item.fee, item.pnl || item.upl || '', item.status || item.orderStatus || ''].map(esc));

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const dateStr = new Date().toISOString().substring(0, 10);
        return { csv, filename: `cap-trading-history-${dateStr}.csv`, count: filtered.length, total: items.length };
    }
</script>

<div class="history-export">
    <select bind:value={exportTimeframe} class="timeframe-select">
        {#each timeframeOptions as opt}
            <option value={opt.value}>{opt.label}</option>
        {/each}
    </select>
    <button
        class="export-btn"
        on:click={triggerExport}
        disabled={exporting || !$history || $history.length === 0}
        title="Download trading history as CSV"
    >
        {#if exporting}
            Exporting...
        {:else}
            ⬇ Export CSV
        {/if}
    </button>
</div>

<div class="history-table">
    {#if isLoading}
        <div class="loading">
            {@html LOADING_ICON} Loading...
        </div>
    {:else if $historySorted && $historySorted.length > 0}
        <Table
            headers={allColumns}
            sortKey={$historySortKey}
            on:sort={(e) => historySortKey.set(e.detail)}
            activeColumns={['market', 'orderType', 'isLong', 'price', 'timestamp']}
        >
            {#each $historySorted as item (item.orderId)}
                <Row>
                    {#each allColumns as column (column.key)}
                        <Cell
                            active={$historyColumnsToShow && $historyColumnsToShow.includes(column.key)}
                            decimals={column.decimals}
                            sortKey={$historySortKey}
                            align={column.align}
                            label={column.label}
                            value={formatHistoryItem(item, column)}
                            isPnl={column.key === 'pnl'}
                            isSettled={item.orderStatus > 3}
                            on:click={(e) => showModal('HistoryOrderStatus', {item})}
                        />
                    {/each}
                </Row>
            {/each}
        </Table>
        <div style="text-align: center;margin-top:5px;">
            {#if loadingMore}
                Loading more...
            {/if}
        </div>
    {:else}
        <div style="text-align: center;padding: 40px;opacity: .4;">
            No history
        </div>
    {/if}
</div>

<style>
    .history-export {
        display: flex;
        gap: 8px;
        padding: 8px 12px;
        align-items: center;
        background: var(--layer25);
        border-bottom: 1px solid var(--layer50);
    }

    .timeframe-select {
        background: var(--layer0);
        border: 1px solid var(--layer100);
        color: var(--text);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
    }

    .export-btn {
        background: var(--primary, #3b82f6);
        color: white;
        border: none;
        padding: 6px 14px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
    }

    .export-btn:hover:not(:disabled) {
        opacity: 0.85;
    }

    .export-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .history-table {
        overflow-x: auto;
    }

    .loading {
        text-align: center;
        padding: 40px;
        opacity: 0.6;
    }
</style>
