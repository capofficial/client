<script>
	import { LOADING_ICON } from '@lib/icons'
	import { DEFAULT_POOL_TRANSACTIONS_COUNT } from '@lib/config'
	import { formatDate, formatForDisplay, formatMarketName, numberWithCommas } from '@lib/formatters'
	import { chainId } from '@lib/stores'
	import { getChainData, shortAddress } from '@lib/utils'
	import { getPoolTransactionsPage } from '@api/pool'

	let transactions = [];
	let isLoading = true;
	let isLoadingMore = false;
	let hasMore = true;
	let nextToBlock;
	let activeChainId;
	let error;

	async function loadFirstPage() {
		isLoading = true;
		error = null;
		nextToBlock = null;
		transactions = [];
		await loadPage(true);
		isLoading = false;
	}

	async function loadPage(isFirstPage) {
		try {
			const page = await getPoolTransactionsPage({
				count: DEFAULT_POOL_TRANSACTIONS_COUNT,
				toBlock: isFirstPage ? null : nextToBlock
			});
			const knownTransactionIds = new Set(transactions.map((transaction) => transaction.id));
			const newTransactions = page.transactions.filter((transaction) => !knownTransactionIds.has(transaction.id));
			transactions = transactions.concat(newTransactions);
			nextToBlock = page.nextToBlock;
			hasMore = page.hasMore;
		} catch(e) {
			console.error('Pool transactions loading failed', e);
			error = 'Pool transactions could not be loaded.';
			hasMore = false;
		}
	}

	async function loadMore() {
		if (isLoading || isLoadingMore || !hasMore) return;
		isLoadingMore = true;
		await loadPage(false);
		isLoadingMore = false;
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

	function getExplorerLink(type, value) {
		const explorer = getChainData('explorer');
		if (!explorer || !value) return;
		return `${explorer}/${type}/${value}`;
	}

	function formatAmount(amount) {
		if (amount == undefined || amount === '') return '-';
		return numberWithCommas(formatForDisplay(amount));
	}

	function formatExtraAmount(transaction) {
		if (!transaction.bufferToPoolAmount && !transaction.clpAmount) return;
		if (transaction.bufferToPoolAmount) return `Buffer to pool: ${formatAmount(transaction.bufferToPoolAmount)}`;
		return `CLP: ${formatAmount(transaction.clpAmount)}`;
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
		scrollbar-color: var(--layer200) transparent;
		scrollbar-width: thin;
	}

	.table-inner {
		min-width: 1080px;
	}

	.table-header,
	.row {
		display: grid;
		align-items: center;
		grid-template-columns: 132px 100px 150px 142px 132px 1fr 164px 90px;
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
		scrollbar-color: var(--layer200) transparent;
		scrollbar-width: thin;
	}

	.table-scroll::-webkit-scrollbar,
	.body::-webkit-scrollbar {
		width: 5px;
		height: 5px;
		background-color: transparent;
	}

	.table-scroll::-webkit-scrollbar-thumb,
	.body::-webkit-scrollbar-thumb {
		border-radius: 6px;
		background-color: var(--layer200);
	}

	.row {
		min-height: 54px;
		border-bottom: 1px solid var(--layer0-hover);
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
		white-space: nowrap;
	}

	.type.deposit {
		color: var(--primary);
		background-color: var(--primary-highlighted);
	}

	.type.withdrawal {
		color: var(--secondary);
		background-color: var(--secondary-highlighted);
	}

	.type.pay-in {
		color: rgb(253,167,20);
		background-color: rgba(253,167,20,0.1);
	}

	.type.pay-out {
		color: #b6a2ff;
		background-color: rgba(182,162,255,0.1);
	}

	a {
		color: var(--primary);
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	.secondary {
		display: block;
		margin-top: 3px;
		color: var(--text400);
		font-size: 85%;
	}

	.loading,
	.empty,
	.error {
		padding: 25px;
		text-align: center;
		color: var(--text400);
		font-size: 90%;
	}

	.error {
		color: var(--error);
	}

	.loading :global(svg) {
		width: 22px;
		fill: currentColor;
	}

	.more {
		display: flex;
		justify-content: center;
		padding: 16px;
		border-top: 1px solid var(--layer0-hover);
	}

	.more button {
		width: auto;
		height: 34px;
		border-radius: var(--base-radius);
		padding: 0 16px;
		color: var(--primary-darkest);
		background-color: var(--primary);
		font-weight: 600;
	}

	.more button:disabled {
		cursor: default;
		opacity: 0.55;
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
					{:else if error}
						<div class='error'>{error}</div>
					{:else if transactions.length == 0}
						<div class='empty'>No pool transactions found in the latest scanned blocks.</div>
					{:else}
						{#each transactions as transaction (transaction.id)}
							<div class='row'>
								<div class='cell la'>
									<span class={`type ${getTypeClass(transaction.type)}`}>{getTypeLabel(transaction.type)}</span>
								</div>
								<div class='cell'>{transaction.assetLabel || '-'}</div>
								<div class='cell'>
									<span>
										{formatAmount(transaction.amount)}
										{#if formatExtraAmount(transaction)}
											<span class='secondary'>{formatExtraAmount(transaction)}</span>
										{/if}
									</span>
								</div>
								<div class='cell'>{formatAmount(transaction.poolBalance)}</div>
								<div class='cell'>{formatAmount(transaction.bufferBalance)}</div>
								<div class='cell la'>
									<span>
										{#if transaction.market}
											{formatMarketName(transaction.market)}
											<span class='secondary'>
												<a href={getExplorerLink('address', transaction.user)} target='_blank' rel='noreferrer'>{shortAddress(transaction.user)}</a>
											</span>
										{:else if transaction.user}
											<a href={getExplorerLink('address', transaction.user)} target='_blank' rel='noreferrer'>{shortAddress(transaction.user)}</a>
										{:else}
											-
										{/if}
									</span>
								</div>
								<div class='cell'>{formatDate(transaction.timestamp) || '-'}</div>
								<div class='cell'>
									{#if transaction.transactionHash}
										<a href={getExplorerLink('tx', transaction.transactionHash)} target='_blank' rel='noreferrer'>View</a>
									{:else}
										-
									{/if}
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>

		{#if !isLoading && hasMore}
			<div class='more'>
				<button on:click={loadMore} disabled={isLoadingMore}>
					{isLoadingMore ? 'Loading...' : 'Load older transactions'}
				</button>
			</div>
		{/if}
	</div>
</div>
