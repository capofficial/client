<script>
    import { onDestroy } from 'svelte'

    import Modal from './Modal.svelte'

    import { address, historyOrderStatusToShow } from '@lib/stores'
    import { getChainData, shortAddress } from '@lib/utils'
    import { hideModal, showToast } from '@lib/ui'

    let startDate = '';
    let endDate = '';
    let isExporting = false;
    let fetched = 0;
    let exported = 0;
    let worker;

    function getTimestamp(date, endOfDay) {
        if (!date) return 0;
        const suffix = endOfDay ? 'T23:59:59' : 'T00:00:00';
        return Math.floor(new Date(`${date}${suffix}`).getTime() / 1000);
    }

    function validateRange() {
        const startTimestamp = getTimestamp(startDate);
        const endTimestamp = getTimestamp(endDate, true);

        if (startTimestamp && endTimestamp && startTimestamp > endTimestamp) {
            showToast('Start date must be before end date.');
            return;
        }

        return { startTimestamp, endTimestamp };
    }

    function getAssetLabels() {
        const assets = getChainData('assets') || {};
        let labels = {};

        for (const label in assets) {
            labels[assets[label].toLowerCase()] = label;
        }

        return labels;
    }

    function downloadCsv(buffer, count) {
        const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const start = startDate || 'all';
        const end = endDate || 'now';
        const filename = `cap-history-${shortAddress($address) || 'wallet'}-${start}-${end}.csv`;
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        showToast(`Exported ${count} history item${count == 1 ? '' : 's'}.`, 1);
        hideModal();
    }

    function cleanupWorker() {
        if (worker) {
            worker.terminate();
            worker = undefined;
        }
    }

    function startExport() {
        if (isExporting) return;

        const range = validateRange();
        if (!range) return;

        const dataEndpoint = getChainData('dataEndpoint');
        if (!dataEndpoint || !$address) {
            showToast('Connect a wallet before exporting history.');
            return;
        }

        cleanupWorker();
        fetched = 0;
        exported = 0;
        isExporting = true;

        worker = new Worker(new URL('export-history.worker.js', window.location.href));
        worker.onmessage = (event) => {
            const data = event.data || {};

            if (data.type == 'progress') {
                fetched = data.fetched;
                exported = data.exported;
            }

            if (data.type == 'done') {
                isExporting = false;
                cleanupWorker();
                downloadCsv(data.buffer, data.count || 0);
            }

            if (data.type == 'error') {
                isExporting = false;
                cleanupWorker();
                showToast(data.message || 'Failed to export history.');
            }
        };
        worker.onerror = (error) => {
            isExporting = false;
            cleanupWorker();
            showToast(error.message || 'Failed to export history.');
        };
        worker.postMessage({
            dataEndpoint,
            address: $address,
            chain: 'arbitrum',
            statuses: $historyOrderStatusToShow,
            startTimestamp: range.startTimestamp,
            endTimestamp: range.endTimestamp,
            assetLabels: getAssetLabels()
        });
    }

    onDestroy(cleanupWorker);
</script>

<style>
    .container {
        padding: var(--base-padding);
    }
    .row {
        margin-bottom: 16px;
    }
    .row:last-child {
        margin-bottom: 0;
    }
    label {
        display: block;
        font-size: 85%;
        color: var(--text400);
        margin-bottom: 6px;
    }
    input {
        box-sizing: border-box;
        width: 100%;
        color: var(--text0);
        background: var(--layer0);
        border: 1px solid var(--layer200);
        border-radius: var(--base-radius);
        padding: 10px;
    }
    .hint, .progress {
        color: var(--text400);
        font-size: 85%;
        line-height: 1.4;
    }
    .actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
    }
    button {
        color: var(--button-text);
        background: var(--primary);
        border: 0;
        border-radius: var(--base-radius);
        cursor: pointer;
        font-weight: 600;
        padding: 10px 16px;
    }
    button:disabled {
        cursor: default;
        opacity: 0.6;
    }
</style>

<Modal title='Export Trading History' width={420}>
    <div class='container'>
        <div class='row hint'>
            Download a CSV report for the currently connected wallet. The export respects the active history status filter and runs in a worker so large reports do not block the app.
        </div>
        <div class='row'>
            <label for='history-export-start'>Start date (optional)</label>
            <input id='history-export-start' type='date' bind:value={startDate} disabled={isExporting} />
        </div>
        <div class='row'>
            <label for='history-export-end'>End date (optional)</label>
            <input id='history-export-end' type='date' bind:value={endDate} disabled={isExporting} />
        </div>
        {#if isExporting}
            <div class='row progress'>Fetched {fetched} item{fetched == 1 ? '' : 's'}, exporting {exported}.</div>
        {/if}
        <div class='actions'>
            <button on:click={startExport} disabled={isExporting}>{isExporting ? 'Exporting…' : 'Download CSV'}</button>
        </div>
    </div>
</Modal>
