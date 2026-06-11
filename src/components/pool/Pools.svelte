<script>
	import { onDestroy, onMount } from 'svelte'
	import Button from '@components/layout/Button.svelte'

	import { getPoolBalances, getBufferBalances, getUserPoolStakes, getGlobalUPL, getPoolTransactions } from '@api/pool'
	import { address, poolBalances, bufferBalances, prices, poolStakes, globalUPLs } from '@lib/stores'
	import { getAssets, getAmountInUsd, getTotalAmountInUsd, getChainData, shortAddress  } from '@lib/utils'
	import { formatForDisplay, numberWithCommas } from '@lib/formatters'
	import { showModal } from '@lib/ui'
	import { connect } from '@lib/connect'

	let assets = getAssets();

	const TRANSACTION_PAGE_SIZE = 20;
	let isLoading = true, t;
	let poolTransactions = [];
	let transactionBeforeBlock = null;
	let hasMoreTransactions = true;
	let isLoadingTransactions = false;
	let transactionSentinel;
	let transactionObserver;
	async function fetchData() {
		clearTimeout(t);
		const done = await getPoolBalances();
		getBufferBalances();
		getUserPoolStakes();
		getGlobalUPL('ETH');
		getGlobalUPL('USDC');
		if (done) {
			isLoading = false;
			loadPoolTransactions(true);
		}
	}
	$: fetchData($address);

	async function loadPoolTransactions(reset) {
		if (isLoadingTransactions) return;
		if (!reset && !hasMoreTransactions) return;

		isLoadingTransactions = true;
		try {
			const result = await getPoolTransactions({
				beforeBlock: reset ? null : transactionBeforeBlock,
				pageSize: TRANSACTION_PAGE_SIZE
			});

			poolTransactions = reset ? result.items : poolTransactions.concat(result.items);
			transactionBeforeBlock = result.nextBeforeBlock;
			hasMoreTransactions = result.nextBeforeBlock !== null;
		} catch(e) {
			hasMoreTransactions = false;
			console.error(e);
		}
		isLoadingTransactions = false;
	}

	function getTransactionUrl(transaction) {
		const explorer = getChainData('explorer');
		if (!explorer || !transaction || !transaction.transactionHash) return;
		return `${explorer}/tx/${transaction.transactionHash}`;
	}

	function formatTransactionAmount(transaction) {
		if (!transaction) return;
		const amount = numberWithCommas(transaction.amount);
		return transaction.asset ? `${amount} ${transaction.asset}` : amount;
	}

	onMount(() => {
		if (typeof IntersectionObserver == 'undefined') return;

		transactionObserver = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && poolTransactions.length) loadPoolTransactions();
		}, {rootMargin: '160px'});

		if (transactionSentinel) transactionObserver.observe(transactionSentinel);
	});

	onDestroy(() => {
		clearTimeout(t);
		if (transactionObserver) transactionObserver.disconnect();
	});

	let feeAPY = {};

	function setFeeAPYs(_balances) {
		if (!_balances) return;
		if (_balances['ETH']) feeAPY['ETH'] = 100 * 95 * 12 / _balances['ETH']; // Approx 95 ETH per month in fees
		if (_balances['USDC']) feeAPY['USDC'] = 100 * 100000 * 12 / _balances['USDC']; // Approx 100,000 USDC per month in fees
	}

	$: setFeeAPYs($poolBalances);

</script>

<style>

	@media all and (max-width: 600px) {
		.table, .header, .transactions-table {
			min-width: 960px;
		}
	}

	.table {
		--grid-template: repeat(8, 1fr);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
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

	.buttons {
		display: flex;
		gap: var(--base-padding);
		grid-gap: var(--base-padding);
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
		grid-template-columns: var(--grid-template);
		color: var(--text300);
		font-size: 85%;
	}

	.row {
		display: grid;
		align-items: center;
		grid-template-columns: var(--grid-template);
		border-bottom: 1px solid var(--layer0-hover);
		height: 50px;
	}

	.cell {
		display: flex;
		align-items: center;
		text-transform: capitalize;
		height: 100%;
		padding: 0 25px;
		justify-content: flex-end;
		text-align: right;
	}
	.cell.la {
		justify-content: flex-start;
		text-align: left;
	}
	.cell.highlighted {
		background-color: var(--layer50);
	}

	.cell img {
		margin-right: 8px;
		width: 18px;
	}

	.grayed {
		opacity: 0.5;
		font-size: 80%;
		display: block;
	}

	.footnote {
		padding-top: 25px;
		color: var(--text300);
		font-size: 80%;
		line-height: 1.618;
	}

	.transactions {
		margin-top: 32px;
	}

	.transactions-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 16px;
	}

	.transactions-title {
		font-weight: 600;
		font-size: 18px;
	}

	.transactions-subtitle {
		color: var(--text300);
		font-size: 90%;
		margin-top: 4px;
	}

	.transactions-table {
		border: 1px solid var(--layer100);
		border-radius: 6px;
		overflow: hidden;
	}

	.transactions-table-header, .transaction-row {
		display: grid;
		grid-template-columns: 1fr 1.1fr 1.2fr 1.2fr 1fr 1fr;
		align-items: center;
	}

	.transactions-table-header {
		min-height: 38px;
		border-bottom: 1px solid var(--layer100);
		color: var(--text300);
		font-size: 85%;
	}

	.transaction-row {
		min-height: 50px;
		border-bottom: 1px solid var(--layer0-hover);
	}

	.transaction-row:last-child {
		border-bottom: 0;
	}

	.transaction-cell {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		text-align: right;
		height: 100%;
		padding: 0 25px;
	}

	.transaction-cell.la {
		justify-content: flex-start;
		text-align: left;
	}

	.type-pill {
		border: 1px solid var(--layer100);
		border-radius: 999px;
		padding: 3px 9px;
		background: var(--layer50);
		font-size: 90%;
	}

	.empty-transactions, .transactions-loading {
		padding: 20px 25px;
		color: var(--text300);
	}

	.load-more-row {
		display: flex;
		justify-content: center;
		padding-top: 16px;
	}

	.tx-link {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>

<div class='pools'>

	<div class='header'>
		<div class='left'>
			<div class='title'>Pools</div>
			<div class='subtitle'>Pools pay out trader wins and receive losses plus fees.</div>
		</div>
		<div class='right buttons'>
			{#if $address}
				<Button isSmall={true} label={`Deposit`} on:click={() => {showModal('Deposit')}} />
				<Button isSmall={true} label={`Withdraw`} on:click={() => {showModal('Withdraw')}} />
			{:else}
				<Button isSmall={true} label={`Connect Wallet`} on:click={() => {connect()}} />
			{/if}
		</div>
	</div>

	<div class='table'>
		<div class='table-header'>
			<div class='cell la'>Asset</div>
			<div class='cell'>Balance</div>
			<div class='cell'>Fee APY ¹</div>
			<div class='cell'>Total APY</div>
			<div class='cell'>Trader UP/L ²</div>
			<div class='cell'>Buffer</div>
			<div class='cell highlighted'>Your Balance</div>
			<div class='cell highlighted'>% of Pool</div>
		</div>
		<div class='table-body'>
			{#each assets as asset}
			<div class='row'>
				<div class='cell la'><img src={`/asset-logos/${asset}.svg`} /> {asset}</div>
				<div class='cell'><span>{numberWithCommas($poolBalances[asset]) || 0}<br/><span class='grayed'>${formatForDisplay(getAmountInUsd(asset, $poolBalances[asset], $prices))}</span></span></div>
				<div class='cell'>{formatForDisplay(feeAPY[asset])}%</div>
				<div class='cell'>30%+</div>
				<div class='cell'>{numberWithCommas($globalUPLs[asset])}</div>
				<div class='cell'>{numberWithCommas($bufferBalances[asset])}</div>
				<div class='cell highlighted'><span>{numberWithCommas($poolStakes[asset]) || 0}<br><span class='grayed'>${getAmountInUsd(asset, $poolStakes[asset], $prices)}</span></span></div>
				<div class='cell highlighted'>{$poolBalances[asset] == 0 ? 'N/A' : formatForDisplay(($poolStakes[asset])/$poolBalances[asset]  *100 )+ '%'}</div>
			</div>
			{/each}
			<div class='row'>
				<div class='cell la'>Total</div>
				<div class='cell'>${numberWithCommas(getTotalAmountInUsd($poolBalances, $prices))}</div>
				<div class='cell'>-</div>
				<div class='cell'>-</div>
				<div class='cell'>-</div>
				<div class='cell'>-</div>
				<div class='cell highlighted'>${numberWithCommas(getTotalAmountInUsd($poolStakes, $prices))}</div>
				<div class='cell highlighted'>-</div>
			</div>
		</div>
	</div>

	<div class='footnote'>
		¹ Does not include trader wins and losses.<br/>
		² Sum total of unrealized trader wins or losses. Updated every ~15min.
	</div>

	<div class='transactions'>
		<div class='transactions-header'>
			<div>
				<div class='transactions-title'>Pool Transactions</div>
				<div class='transactions-subtitle'>Recent deposits, withdrawals, trader wins, and trader losses.</div>
			</div>
		</div>

		<div class='transactions-table'>
			<div class='transactions-table-header'>
				<div class='transaction-cell la'>Type</div>
				<div class='transaction-cell'>Asset / Market</div>
				<div class='transaction-cell'>Amount</div>
				<div class='transaction-cell'>Pool Balance</div>
				<div class='transaction-cell'>Wallet</div>
				<div class='transaction-cell'>Tx</div>
			</div>
			<div class='transactions-table-body'>
				{#each poolTransactions as transaction (transaction.id)}
					<div class='transaction-row'>
						<div class='transaction-cell la'><span class='type-pill'>{transaction.type}</span></div>
						<div class='transaction-cell'>{transaction.market || transaction.asset}</div>
						<div class='transaction-cell'>{formatTransactionAmount(transaction)}</div>
						<div class='transaction-cell'>{transaction.poolBalance ? `${numberWithCommas(transaction.poolBalance)} ${transaction.asset}` : '-'}</div>
						<div class='transaction-cell' title={transaction.user}>{shortAddress(transaction.user)}</div>
						<div class='transaction-cell'>
							{#if getTransactionUrl(transaction)}
								<a class='tx-link' href={getTransactionUrl(transaction)} target='_blank' rel='noreferrer'>{shortAddress(transaction.transactionHash)}</a>
							{:else}
								{shortAddress(transaction.transactionHash)}
							{/if}
						</div>
					</div>
				{:else}
					{#if isLoadingTransactions}
						<div class='transactions-loading'>Loading transactions...</div>
					{:else}
						<div class='empty-transactions'>No pool transactions found.</div>
					{/if}
				{/each}
			</div>
		</div>

		<div bind:this={transactionSentinel}></div>
		{#if hasMoreTransactions}
			<div class='load-more-row'>
				<Button isSmall={true} label={isLoadingTransactions ? `Loading...` : `Load More`} on:click={() => {loadPoolTransactions()}} />
			</div>
		{/if}
	</div>
</div>
