<script>
	import { onMount, onDestroy } from 'svelte'
	import { LOADING_ICON } from '@lib/icons'
	import { poolTransactions, lastPoolTransactionsCount } from '@lib/stores'
	import { getPoolTransactions } from '@api/pool'
	import { formatDate, formatForDisplay, numberWithCommas } from '@lib/formatters'
	import { shortAddress } from '@lib/utils'

	const ITEMS_PER_PAGE = 50;
	let isLoading = true;
	let loadingMore = false;
	let skip = 0;
	let sentinel;
	let observer;

	async function fetchTransactions(isLoadMore = false) {
		if (isLoadMore) {
			if (loadingMore || $lastPoolTransactionsCount < ITEMS_PER_PAGE) return;
			loadingMore = true;
		}

		await getPoolTransactions({ first: ITEMS_PER_PAGE, skip });

		if (isLoadMore) {
			loadingMore = false;
			skip += ITEMS_PER_PAGE;
		} else {
			isLoading = false;
			skip = ITEMS_PER_PAGE;
		}
	}

	onMount(() => {
		fetchTransactions();

		observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && !loadingMore && $lastPoolTransactionsCount === ITEMS_PER_PAGE) {
				fetchTransactions(true);
			}
		}, { threshold: 0.1 });

		if (sentinel) observer.observe(sentinel);
	});

	onDestroy(() => {
		if (observer) observer.disconnect();
	});

	function getTransactionTypeClass(type) {
		switch (type) {
			case 'Deposit': return 'green';
			case 'Withdrawal': return 'orange';
			case 'Pay In': return 'blue';
			case 'Pay Out': return 'red';
			default: return '';
		}
	}

	function formatAssetUrl(asset) {
		return `/asset-logos/${asset}.svg`;
	}

	function getExplorerUrl(txHash) {
		return `https://arbiscan.io/tx/${txHash}`;
	}
</script>

<style>
	.transactions-container {
		margin-top: 30px;
		border: 1px solid var(--layer100);
		border-radius: 6px;
		overflow: hidden;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid var(--layer100);
		background: var(--layer0);
	}

	.header-title {
		font-weight: 600;
		font-size: 18px;
	}

	.table-header {
		display: grid;
		grid-template-columns: 100px 120px 100px 120px 1fr 1fr 1fr 100px;
		align-items: center;
		height: 40px;
		padding: 0 20px;
		background: var(--layer25);
		border-bottom: 1px solid var(--layer100);
		font-size: 13px;
		color: var(--text300);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.row {
		display: grid;
		grid-template-columns: 100px 120px 100px 120px 1fr 1fr 1fr 100px;
		align-items: center;
		height: 50px;
		padding: 0 20px;
		border-bottom: 1px solid var(--layer50);
		transition: background 0.15s;
	}

	.row:hover {
		background: var(--layer25);
	}

	.cell {
		display: flex;
		align-items: center;
		font-size: 14px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cell.type {
		text-transform: uppercase;
		font-weight: 600;
		font-size: 12px;
	}

	.cell.type.green { color: var(--primary); }
	.cell.type.orange { color: #f59e0b; }
	.cell.type.blue { color: #3b82f6; }
	.cell.type.red { color: var(--secondary); }

	.cell.asset {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.cell.asset img {
		width: 18px;
		height: 18px;
	}

	.cell.market {
		color: var(--text300);
	}

	.cell.address {
		font-family: monospace;
		font-size: 12px;
		color: var(--text400);
	}

	.cell.address a {
		color: var(--primary);
		text-decoration: none;
	}

	.cell.address a:hover {
		text-decoration: underline;
	}

	.cell.amount {
		justify-content: flex-end;
		font-weight: 500;
	}

	.cell.pool-balance {
		justify-content: flex-end;
		color: var(--text300);
	}

	.cell.time {
		color: var(--text400);
		font-size: 13px;
	}

	.cell.explorer-link a {
		color: var(--text300);
		text-decoration: none;
		font-size: 18px;
	}

	.cell.explorer-link a:hover {
		color: var(--primary);
	}

	.loading, .empty {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		color: var(--text400);
		font-size: 14px;
	}

	.loading :global(svg) {
		width: 24px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.loading-more {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}

	.loading-more :global(svg) {
		width: 20px;
		animation: spin 1s linear infinite;
	}

	@media all and (max-width: 900px) {
		.table-header, .row {
			grid-template-columns: 80px 100px 80px 1fr 80px;
			min-width: 500px;
		}

		.cell.pool-balance, .cell.explorer-link {
			display: none;
		}
	}
</style>

<div class="transactions-container">
	<div class="header">
		<div class="header-title">Pool Transactions</div>
	</div>

	<div class="table-header">
		<div class="cell">Type</div>
		<div class="cell">Asset</div>
		<div class="cell">Market</div>
		<div class="cell address">User</div>
		<div class="cell amount">Amount</div>
		<div class="cell pool-balance">Pool Balance</div>
		<div class="cell time">Time</div>
		<div class="cell explorer-link"></div>
	</div>

	{#if isLoading}
		<div class="loading">{@html LOADING_ICON}</div>
	{:else if $poolTransactions.length === 0}
		<div class="empty">No transactions yet</div>
	{:else}
		<div class="rows">
			{#each $poolTransactions as tx}
				<div class="row">
					<div class="cell type {getTransactionTypeClass(tx.type)}">{tx.type}</div>
					<div class="cell asset">
						<img src={formatAssetUrl(tx.asset)} alt={tx.asset} />
						<span>{tx.asset}</span>
					</div>
					<div class="cell market">{tx.market || '-'}</div>
					<div class="cell address">
						<a href={getExplorerUrl(tx.transactionHash)} target="_blank" rel="noopener">
							{shortAddress(tx.user)}
						</a>
					</div>
					<div class="cell amount">{numberWithCommas(tx.amount)}</div>
					<div class="cell pool-balance">{numberWithCommas(tx.poolBalance || 0)}</div>
					<div class="cell time">{formatDate(tx.timestamp)}</div>
					<div class="cell explorer-link">
						<a href={getExplorerUrl(tx.transactionHash)} target="_blank" rel="noopener" title="View on Arbiscan">
							&#8599;
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if loadingMore}
		<div class="loading-more">{@html LOADING_ICON}</div>
	{/if}

	<!-- Sentinel for infinite scroll -->
	<div bind:this={sentinel} style="height: 1px;"></div>
</div>
