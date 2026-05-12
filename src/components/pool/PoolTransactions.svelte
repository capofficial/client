<script>
	import { LOADING_ICON } from '@lib/icons'
	import { DEFAULT_POOL_TRANSACTIONS_COUNT } from '@lib/config'
	import { formatDate, formatForDisplay, formatMarketName, numberWithCommas } from '@lib/formatters'
	import { chainId, lastPoolTransactionsCount, poolTransactions } from '@lib/stores'
	import { getChainData, getLabelForAsset, shortAddress } from '@lib/utils'
	import { getPoolTransactions } from '@api/pool'

	const ITEMS_PER_PAGE = DEFAULT_POOL_TRANSACTIONS_COUNT;

	let isLoading = true;
	let loadingMore = false;
	let skip = 0;
	let hasMore = true;
	let activeChainId;

	async function loadFirstPage() {
		isLoading = true;
		skip = 0;
		hasMore = true;
		await getPoolTransactions({ first: ITEMS_PER_PAGE, skip });
		skip = $lastPoolTransactionsCount;
		hasMore = $lastPoolTransactionsCount >= ITEMS_PER_PAGE;
		isLoading = false;
	}

	async function loadMore() {
		if (isLoading || loadingMore || !hasMore) return;
		loadingMore = true;
		await getPoolTransactions({ first: ITEMS_PER_PAGE, skip });
		skip += $lastPoolTransactionsCount;
		hasMore = $lastPoolTransactionsCount >= ITEMS_PER_PAGE;
		loadingMore = false;
	}

	function handleScroll(event) {
		const container = event.currentTarget;
		if (container.scrollTop + container.clientHeight >= container.scrollHeight - 120) {
			loadMore();
		}
	}

	function getTypeLabel(type) {
		if (type == 'PoolDeposit') return 'Deposit';
		if (type == 'PoolWithdrawal') return 'Withdrawal';
		if (type == 'PoolPayIn') return 'Pay In';
		if (type == 'PoolPayOut') return 'Pay Out';
		return type || '-';
	}

	function getTypeClass(type) {
		if (type == 'PoolDeposit') return 'deposit';
		if (type == 'PoolWithdrawal') return 'withdrawal';
		if (type == 'PoolPayIn') return 'pay-in';
		if (type == 'PoolPayOut') return 'pay-out';
		return '';
	}

	function getAssetLabel(asset) {
		if (!asset) return '-';
		if (!asset.startsWith || !asset.startsWith('0x')) return asset;
		return getLabelForAsset(asset) || shortAddress(asset);
	}

	function formatAmount(amount) {
		if (amount == undefined || amount === '') return '-';
		return numberWithCommas(formatForDisplay(amount));
	}

	function getExplorerLink(type, value) {
		const explorer = getChainData('explorer');
		if (!explorer || !value) return;
		return `${explorer}/${type}/${value}`;
	}

	function getTransactionHash(transaction) {
		return transaction.transactionHash || transaction.txHash || transaction.hash;
	}

	$: if ($chainId && activeChainId != $chainId) {
		activeChainId = $chainId;
		loadFirstPage();
	}
</script>

<style>
	.transactions {
		margin-top: 32px;
	}

	.header {
		margin-bottom: 16px;
	}

	.title {
		font-weight: 600;
		font-size: 24px;
		padding-bottom: 12px;
	}

	.subtitle {
		color: var(--text300);
	}

	.table {
		border: 1px solid var(--layer100);
		border-radius: 6px;
		overflow: hidden;
	}

	.table-scroll {
		overflow-x: auto;
		scrollbar-color: var(--layer200);
		scrollbar-width: thin;
	}

	.table-scroll::-webkit-scrollbar {
		height: 5px;
		background-color: transparent;
	}

	.table-scroll::-webkit-scrollbar-thumb {
		border-radius: 6px;
		background-color: var(--layer200);
	}

	.table-inner {
		min-width: 1080px;
	}

	.table-header,
	.row {
		display: grid;
		align-items: center;
		grid-template-columns: 130px 90px 130px 130px 130px 1fr 140px 90px;
	}

	.table-header {
		height: 38px;
		border-bottom: 1px solid var(--layer100);
		color: var(--text300);
		font-size: 85%;
	}

	.body {
		max-height: 560px;
		overflow-y: auto;
		scrollbar-color: var(--layer200);
		scrollbar-width: thin;
	}

	.body::-webkit-scrollbar {
		width: 5px;
		background-color: transparent;
	}

	.body::-webkit-scrollbar-thumb {
		border-radius: 6px;
		background-color: var(--layer200);
	}

	.row {
		min-height: 50px;
		border-bottom: 1px solid var(--layer0-hover);
	}

	.row:last-child {
		border-bottom: none;
	}

	.row:hover {
		background-color: var(--layer25);
	}

	.cell {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		height: 100%;
		padding: 0 20px;
		text-align: right;
	}

	.cell.la {
		justify-content: flex-start;
		text-align: left;
	}

	.type {
		display: inline-flex;
		align-items: center;
		border-radius: 4px;
		padding: 3px 8px;
		font-size: 85%;
		font-weight: 600;
	}

	.type.deposit {
		color: var(--primary);
		background-color: rgba(64, 214, 67, 0.1);
	}

	.type.withdrawal {
		color: var(--secondary);
		background-color: rgba(255, 83, 36, 0.1);
	}

	.type.pay-in {
		color: #f59e0b;
		background-color: rgba(245, 158, 11, 0.1);
	}

	.type.pay-out {
		color: #8b5cf6;
		background-color: rgba(139, 92, 246, 0.1);
	}

	.asset {
		text-transform: capitalize;
	}

	a {
		color: var(--primary);
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	.grayed {
		opacity: 0.5;
	}

	.loading,
	.empty {
		padding: 25px;
		text-align: center;
		color: var(--text400);
		font-size: 90%;
	}

	.loading :global(svg) {
		width: 22px;
	}
</style>

<div class='transactions'>
	<div class='header'>
		<div class='title'>Pool Transactions</div>
		<div class='subtitle'>Latest deposits, withdrawals, pay ins, and payouts across all pools.</div>
	</div>

	<div class='table'>
		<div class='table-scroll'>
			<div class='table-inner'>
				<div class='table-header'>
					<div class='cell la'>Type</div>
					<div class='cell'>Asset</div>
					<div class='cell'>Amount</div>
					<div class='cell'>Pool Balance</div>
					<div class='cell'>Buffer</div>
					<div class='cell la'>Market / User</div>
					<div class='cell'>Time</div>
					<div class='cell'>Tx</div>
				</div>

				<div class='body' on:scroll={handleScroll}>
					{#if isLoading}
						<div class='loading'>{@html LOADING_ICON}</div>
					{:else if $poolTransactions.length == 0}
						<div class='empty'>No pool transactions found.</div>
					{:else}
						{#each $poolTransactions as transaction}
							<div class='row'>
								<div class='cell la'>
									<span class={`type ${getTypeClass(transaction.type)}`}>{getTypeLabel(transaction.type)}</span>
								</div>
								<div class='cell asset'>{getAssetLabel(transaction.asset)}</div>
								<div class='cell'>{formatAmount(transaction.amount)}</div>
								<div class='cell'>{formatAmount(transaction.poolBalance)}</div>
								<div class='cell'>{formatAmount(transaction.bufferBalance)}</div>
								<div class='cell la'>
									<span>
										{#if transaction.market}
											{formatMarketName(transaction.market)}
											<br>
										{/if}
										{#if transaction.user}
											<a href={getExplorerLink('address', transaction.user)} target='_blank' rel='noreferrer'>{shortAddress(transaction.user)}</a>
										{:else}
											<span class='grayed'>-</span>
										{/if}
									</span>
								</div>
								<div class='cell'>{formatDate(transaction.timestamp) || '-'}</div>
								<div class='cell'>
									{#if getTransactionHash(transaction)}
										<a href={getExplorerLink('tx', getTransactionHash(transaction))} target='_blank' rel='noreferrer'>View</a>
									{:else}
										<span class='grayed'>-</span>
									{/if}
								</div>
							</div>
						{/each}

						{#if loadingMore}
							<div class='loading'>{@html LOADING_ICON}</div>
						{/if}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
