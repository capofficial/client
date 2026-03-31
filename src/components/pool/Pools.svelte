<script>
	import { onDestroy, onMount } from 'svelte'
	import Button from '@components/layout/Button.svelte'

	import { getPoolBalances, getBufferBalances, getUserPoolStakes, getGlobalUPL, getPoolTransactions } from '@api/pool'
	import { address, poolBalances, bufferBalances, prices, poolStakes, globalUPLs, poolTransactions, lastPoolTransactionsCount } from '@lib/stores'
	import { getAssets, getAmountInUsd, getTotalAmountInUsd } from '@lib/utils'
	import { formatForDisplay, numberWithCommas, formatDate } from '@lib/formatters'
	import { showModal } from '@lib/ui'
	import { connect } from '@lib/connect'

	let assets = getAssets();

	let isLoading = true, t;
	async function fetchData() {
		clearTimeout(t);
		const done = await getPoolBalances();
		getBufferBalances();
		getUserPoolStakes();
		getGlobalUPL('ETH');
		getGlobalUPL('USDC');
		if (done) isLoading = false;
	}
	$: fetchData($address);

	onDestroy(() => {
		clearTimeout(t);
	});

	let feeAPY = {};

	function setFeeAPYs(_balances) {
		if (!_balances) return;
		if (_balances['ETH']) feeAPY['ETH'] = 100 * 95 * 12 / _balances['ETH']; // Approx 95 ETH per month in fees
		if (_balances['USDC']) feeAPY['USDC'] = 100 * 100000 * 12 / _balances['USDC']; // Approx 100,000 USDC per month in fees
	}

	$: setFeeAPYs($poolBalances);

	// Pool transactions infinite scroll
	let txIsLoading = false;
	let txLoadingMore = false;
	const TX_ITEMS_PER_PAGE = 50;
	let txSkip = TX_ITEMS_PER_PAGE;

	async function loadPoolTransactions() {
		txIsLoading = true;
		await getPoolTransactions({ first: TX_ITEMS_PER_PAGE, skip: 0 });
		txSkip = TX_ITEMS_PER_PAGE;
		txIsLoading = false;
	}

	$: loadPoolTransactions($address);

	async function loadMorePoolTransactions() {
		if (txLoadingMore || $lastPoolTransactionsCount < TX_ITEMS_PER_PAGE) return;
		txLoadingMore = true;
		await getPoolTransactions({ first: TX_ITEMS_PER_PAGE, skip: txSkip });
		txSkip += TX_ITEMS_PER_PAGE;
		txLoadingMore = false;
	}

	// Infinite scroll observer
	let txScrollDiv;
	let txObserver;

	onMount(() => {
		txObserver = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !txLoadingMore && !txIsLoading) {
					loadMorePoolTransactions();
				}
			},
			{ rootMargin: '120px' }
		);
		if (txScrollDiv) txObserver.observe(txScrollDiv);

		return () => {
			if (txObserver) txObserver.disconnect();
		};
	});

	function getTxTypeLabel(type) {
		const labels = {
			'PoolDeposit': 'Deposit',
			'PoolWithdrawal': 'Withdrawal',
			'PoolPayIn': 'Pay In',
			'PoolPayOut': 'Pay Out',
		};
		return labels[type] || type;
	}

	function getTxTypeClass(type) {
		if (type === 'PoolDeposit') return 'tx-deposit';
		if (type === 'PoolWithdrawal') return 'tx-withdrawal';
		if (type === 'PoolPayIn') return 'tx-payin';
		if (type === 'PoolPayOut') return 'tx-payout';
		return '';
	}

	function shortAddress(addr) {
		if (!addr) return '';
		return addr.slice(0, 6) + '...' + addr.slice(-4);
	}
</script>

<style>

	@media all and (max-width: 600px) {
		.table, .header {
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

	/* Pool Transactions Table */
	.tx-section {
		margin-top: 40px;
	}

	.tx-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.tx-title {
		font-weight: 600;
		font-size: 18px;
		padding-bottom: 12px;
	}

	.tx-table-wrap {
		border: 1px solid var(--layer100);
		border-radius: 6px;
		overflow: hidden;
	}

	.tx-table {
		width: 100%;
		overflow-x: auto;
	}

	.tx-table-header {
		display: grid;
		grid-template-columns: 100px 80px 120px 120px 120px 160px 140px;
		align-items: center;
		height: 38px;
		border-bottom: 1px solid var(--layer100);
		color: var(--text300);
		font-size: 85%;
		min-width: 840px;
	}

	.tx-row {
		display: grid;
		grid-template-columns: 100px 80px 120px 120px 120px 160px 140px;
		align-items: center;
		border-bottom: 1px solid var(--layer0-hover);
		height: 50px;
		min-width: 840px;
	}

	.tx-cell {
		padding: 0 16px;
		font-size: 85%;
		text-align: right;
	}

	.tx-cell.la {
		text-align: left;
	}

	.tx-cell img {
		margin-right: 6px;
		width: 16px;
		vertical-align: middle;
	}

	.tx-type {
		font-weight: 600;
		padding: 3px 8px;
		border-radius: 4px;
		font-size: 80%;
		display: inline-block;
	}

	.tx-type.tx-deposit {
		color: #3ecf8e;
		background: rgba(62, 207, 142, 0.1);
	}

	.tx-type.tx-withdrawal {
		color: #f6c90e;
		background: rgba(246, 201, 14, 0.1);
	}

	.tx-type.tx-payin {
		color: #6e78f1;
		background: rgba(110, 120, 241, 0.1);
	}

	.tx-type.tx-payout {
		color: #ef6c6c;
		background: rgba(239, 108, 108, 0.1);
	}

	.tx-sentinel {
		height: 1px;
	}

	.tx-loading {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20px;
		color: var(--text300);
		font-size: 85%;
	}

	.tx-empty {
		padding: 40px 20px;
		text-align: center;
		color: var(--text300);
		font-size: 85%;
	}

	.tx-asset-cell {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		text-transform: capitalize;
	}

	.tx-market {
		color: var(--text300);
		font-size: 80%;
		display: block;
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

	<!-- Pool Transactions Table with Infinite Scroll -->
	<div class='tx-section'>
		<div class='tx-header'>
			<div class='tx-title'>Pool Transactions</div>
		</div>

		<div class='tx-table-wrap'>
			<div class='tx-table'>
				<div class='tx-table-header'>
					<div class='tx-cell la'>Type</div>
					<div class='tx-cell'>Asset</div>
					<div class='tx-cell'>Amount</div>
					<div class='tx-cell'>Market</div>
					<div class='tx-cell'>Pool Balance</div>
					<div class='tx-cell'>Timestamp</div>
					<div class='tx-cell'>User</div>
				</div>

				{#if txIsLoading}
					<div class='tx-loading'>Loading transactions...</div>
				{:else if $poolTransactions.length === 0}
					<div class='tx-empty'>No transactions found.</div>
				{:else}
					{#each $poolTransactions as tx}
					<div class='tx-row'>
						<div class='tx-cell la'>
							<span class='tx-type {getTxTypeClass(tx.type)}'>{getTxTypeLabel(tx.type)}</span>
						</div>
						<div class='tx-cell'>
							<span class='tx-asset-cell'>
								{#if tx.asset === 'ETH'}
									<img src='/asset-logos/ETH.svg' alt='ETH' />
								{:else if tx.asset === 'USDC'}
									<img src='/asset-logos/USDC.svg' alt='USDC' />
								{/if}
								{tx.asset || '-'}
							</span>
						</div>
						<div class='tx-cell'>{tx.amount ? numberWithCommas(formatForDisplay(tx.amount)) : '-'}</div>
						<div class='tx-cell'>{tx.market || '-'}</div>
						<div class='tx-cell'>{tx.poolBalance ? numberWithCommas(formatForDisplay(tx.poolBalance)) : '-'}</div>
						<div class='tx-cell'>{tx.timestamp ? formatDate(tx.timestamp) : '-'}</div>
						<div class='tx-cell'>{tx.user ? shortAddress(tx.user) : '-'}</div>
					</div>
					{/each}
				{/if}

				<!-- Infinite scroll sentinel -->
				<div class='tx-sentinel' bind:this={txScrollDiv}></div>

				{#if txLoadingMore}
					<div class='tx-loading'>Loading more...</div>
				{/if}
			</div>
		</div>
	</div>

</div>
