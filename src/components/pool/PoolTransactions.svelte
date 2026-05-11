<script>
    import { onMount, onDestroy } from 'svelte'
    import { getPoolEvents } from '@api/pool-history'
    import { formatForDisplay, formatDate, shortAddress } from '@lib/formatters'
    import { address } from '@lib/stores'
    import { connect } from '@lib/connect'
    import { LOADING_ICON } from '@lib/icons'
    import { CURRENCY_DECIMALS } from '@lib/config'

    const ITEMS_PER_PAGE = 50;

    let events = [];
    let isLoading = true;
    let loadingMore = false;
    let skip = 0;
    let hasMore = true;

    onMount(async () => {
        await loadEvents();
    });

    async function loadEvents() {
        isLoading = true;
        const data = await getPoolEvents({ first: ITEMS_PER_PAGE, skip: 0 });
        events = data;
        skip = ITEMS_PER_PAGE;
        hasMore = data.length >= ITEMS_PER_PAGE;
        isLoading = false;
    }

    async function loadMore() {
        if (loadingMore || !hasMore) return;
        loadingMore = true;
        const data = await getPoolEvents({ first: ITEMS_PER_PAGE, skip });
        if (data.length > 0) {
            events = events.concat(data);
            skip += ITEMS_PER_PAGE;
        }
        hasMore = data.length >= ITEMS_PER_PAGE;
        loadingMore = false;
    }

    function handleScroll(e) {
        const el = e.target;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 150) {
            loadMore();
        }
    }

    function getEventType(event) {
        if (event.type === 'PoolDeposit') return 'Deposit';
        if (event.type === 'PoolWithdrawal') return 'Withdrawal';
        if (event.type === 'PoolPayIn') return 'Pay In';
        if (event.type === 'PoolPayOut') return 'Pay Out';
        return event.type;
    }

    function getEventIcon(event) {
        if (event.type === 'PoolDeposit') return '+';
        if (event.type === 'PoolWithdrawal') return '-';
        if (event.type === 'PoolPayIn') return '↓';
        if (event.type === 'PoolPayOut') return '↑';
        return '•';
    }

    function getEventClass(event) {
        if (event.type === 'PoolDeposit') return 'deposit';
        if (event.type === 'PoolWithdrawal') return 'withdrawal';
        if (event.type === 'PoolPayIn') return 'payin';
        if (event.type === 'PoolPayOut') return 'payout';
        return '';
    }

</script>

<style>
    .container {
        margin-top: 32px;
    }
    .title {
        font-weight: 600;
        font-size: 24px;
        padding-bottom: 12px;
    }
    .subtitle {
        color: var(--text300);
        padding-bottom: 16px;
    }
    .table {
        border: 1px solid var(--layer100);
        border-radius: 6px;
    }
    .table-header {
        display: grid;
        align-items: center;
        height: 38px;
        border-bottom: 1px solid var(--layer100);
        grid-template-columns: 80px 1fr 120px 120px 160px;
        color: var(--text300);
        font-size: 85%;
        padding: 0 25px;
    }
    .scroll-body {
        max-height: 600px;
        overflow-y: auto;
        scrollbar-color: var(--layer200);
        scrollbar-width: thin;
    }
    .scroll-body::-webkit-scrollbar-track {
        background-color: transparent;
        border-radius: 6px;
    }
    .scroll-body::-webkit-scrollbar {
        width: 5px;
    }
    .scroll-body::-webkit-scrollbar-thumb {
        border-radius: 6px;
        background-color: var(--layer200);
    }
    .row {
        display: grid;
        align-items: center;
        grid-template-columns: 80px 1fr 120px 120px 160px;
        border-bottom: 1px solid var(--layer0-hover);
        height: 50px;
        padding: 0 25px;
    }
    .row:last-child {
        border-bottom: none;
    }
    .cell {
        display: flex;
        align-items: center;
        height: 100%;
        justify-content: flex-end;
        text-align: right;
        font-size: 90%;
    }
    .cell.la {
        justify-content: flex-start;
        text-align: left;
    }
    .type-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
    }
    .type-badge .icon {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        color: white;
    }
    .type-badge.deposit .icon { background-color: var(--primary); }
    .type-badge.withdrawal .icon { background-color: var(--secondary); }
    .type-badge.payin .icon { background-color: #f59e0b; }
    .type-badge.payout .icon { background-color: #8b5cf6; }
    .type-label {
        text-transform: capitalize;
        font-size: 85%;
    }
    .user-link {
        color: var(--primary);
        cursor: pointer;
        text-decoration: none;
    }
    .user-link:hover {
        text-decoration: underline;
    }
    .loading {
        padding: 25px;
        text-align: center;
        color: var(--text400);
    }
    .loading :global(svg) {
        width: 22px;
    }
    .empty {
        padding: 40px 25px;
        text-align: center;
        color: var(--text500);
        font-size: 90%;
    }
    .grayed {
        opacity: 0.5;
        font-size: 80%;
        display: block;
    }
</style>

<div class='container'>
    <div class='title'>Pool Transactions</div>
    <div class='subtitle'>Latest deposits, withdrawals, pay ins, and payouts across all pools.</div>

    <div class='table'>
        <div class='table-header'>
            <div class='cell la'>Type</div>
            <div class='cell la'>User</div>
            <div class='cell'>Asset</div>
            <div class='cell'>Amount</div>
            <div class='cell'>Time</div>
        </div>
        <div class='scroll-body' on:scroll={handleScroll}>
            {#if isLoading}
                <div class='loading'>{@html LOADING_ICON}</div>
            {:else if events.length === 0}
                <div class='empty'>No pool transactions yet.</div>
            {:else}
                {#each events as event}
                    <div class='row'>
                        <div class='cell la'>
                            <span class='type-badge {getEventClass(event)}'>
                                <span class='icon'>{getEventIcon(event)}</span>
                                <span class='type-label'>{getEventType(event)}</span>
                            </span>
                        </div>
                        <div class='cell la'>
                            {#if event.user}
                                <a class='user-link' href={https://arbiscan.io/address/} target='_blank' rel='noreferrer'>
                                    {shortAddress(event.user)}
                                </a>
                            {:else}
                                <span class='grayed'>-</span>
                            {/if}
                        </div>
                        <div class='cell'>{event.asset || '-'}</div>
                        <div class='cell'>{formatForDisplay(event.amount)}</div>
                        <div class='cell'>{event.timestamp ? formatDate(event.timestamp) : '-'}</div>
                    </div>
                {/each}
                {#if loadingMore}
                    <div class='loading'>{@html LOADING_ICON}</div>
                {/if}
            {/if}
        </div>
    </div>
</div>