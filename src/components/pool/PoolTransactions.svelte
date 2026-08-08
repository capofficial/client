<script>
	import { onMount } from 'svelte'
	import Button from '@components/layout/Button.svelte'
	import { LOADING_ICON } from '@lib/icons'
	import { chainId } from '@lib/stores'
	import { formatDate, numberWithCommas } from '@lib/formatters'
	import { shortAddress } from '@lib/utils'
	import { getPoolTransactions } from '@api/pool'

	const PAGE_SIZE = 50;

	let transactions = [];
	let nextCursor = null;
	let hasMore = true;
	let isLoading = false;
	let error = '';
	let sentinel;
	let observer;
	let mounted = false;
	let loadedChain;
	let requestId = 0;

	async function loadTransactions(reset = false) {
		if (!reset && (isLoading || !hasMore)) return;
		isLoading = true;
		error = '';
		const currentRequest = ++requestId;
		if (reset) {
			transactions = [];
			nextCursor = null;
			hasMore = true;
		}

		try {
			const result = await getPoolTransactions({
				cursor: reset ? null : nextCursor,
				pageSize: PAGE_SIZE
			});
			if (currentRequest != requestId) return;
			const existingIds = new Set(transactions.map((item) => item.id));
			const newItems = result.items.filter((item) => !existingIds.has(item.id));
			transactions = reset ? result.items : transactions.concat(newItems);
			nextCursor = result.nextCursor;
			hasMore = result.hasMore;
		} catch (e) {
			if (currentRequest == requestId) error = 'Unable to load pool transactions. Please try again.';
			console.error('Pool transaction history error', e);
		} finally {
			if (currentRequest == requestId) isLoading = false;
		}
	}

	$: if (mounted && $chainId && loadedChain != $chainId) {
		loadedChain = $chainId;
		loadTransactions(true);
	}

	onMount(() => {
		mounted = true;
		if ($chainId) {
			loadedChain = $chainId;
			loadTransactions(true);
		}
		observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting)) loadTransactions(false);
		}, {rootMargin: '240px'});
		if (sentinel) observer.observe(sentinel);

		return () => {
			requestId++;
			if (observer) observer.disconnect();
		};
	});
</script>

<style>
	.transactions {
		margin-top: 38px;
	}

	.header {
		margin-bottom: 16px;
	}

	.title {
		font-weight: 600;
		font-size: 20px;
		padding-bottom: 6px;
	}

	.subtitle, .muted, .empty {
		color: var(--text300);
		font-size: 85%;
	}

	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--layer100);
		border-radius: 6px;
	}

	.table {
		min-width: 900px;
	}

	.table-header, .row {
		display: grid;
		align-items: center;
		grid-template-columns: 0.9fr 0.65fr 0.8fr 1fr 1.05fr 1.05fr 1.2fr 0.85fr;
	}

	.table-header {
		height: 38px;
		border-bottom: 1px solid var(--layer100);
		color: var(--text300);
		font-size: 85%;
	}

	.row {
		min-height: 50px;
		border-bottom: 1px solid var(--layer0-hover);
	}

	.row:last-child {
		border-bottom: none;
	}

	.cell {
		min-width: 0;
		overflow: hidden;
		padding: 8px 16px;
		text-align: right;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cell.left {
		text-align: left;
	}

	.type {
		font-weight: 600;
		text-transform: capitalize;
	}

	.type.deposit { color: var(--primary); }
	.type.withdrawal, .type.pay-out { color: var(--secondary); }
	.type.pay-in { color: var(--text100); }

	.grayed {
		color: var(--text300);
		display: block;
		font-size: 80%;
	}

	a {
		color: var(--primary);
		text-decoration: none;
	}

	.footer {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 62px;
		padding: 8px;
	}

	.loading {
		color: var(--text300);
	}

	.loading :global(svg) {
		fill: currentColor;
		width: 22px;
	}

	.error, .empty {
		border: 1px solid var(--layer100);
		border-radius: 6px;
		padding: 24px;
		text-align: center;
	}

	.error {
		color: var(--secondary);
	}

	.error button {
		margin-left: 12px;
		color: var(--primary);
		background: transparent;
		text-decoration: underline;
	}

	.sentinel {
		height: 1px;
	}
</style>

<div class='transactions'>
	<div class='header'>
		<div class='title'>Pool transactions</div>
		<div class='subtitle'>Deposits, withdrawals, trader pay-ins, and trader pay-outs.</div>
	</div>

	{#if error}
		<div class='error'>{error}<button type='button' on:click={() => loadTransactions(true)}>Retry</button></div>
	{:else if transactions.length == 0 && !isLoading}
		<div class='empty'>No pool transactions found.</div>
	{:else}
		<div class='table-wrapper'>
			<div class='table'>
				<div class='table-header'>
					<div class='cell left'>Type</div>
					<div class='cell left'>Asset</div>
					<div class='cell left'>Market</div>
					<div class='cell'>Amount</div>
					<div class='cell'>Pool balance</div>
					<div class='cell'>Buffer</div>
					<div class='cell left'>User / time</div>
					<div class='cell'>Transaction</div>
				</div>
				{#each transactions as item (item.id)}
					<div class='row'>
						<div class={`cell left type ${item.type.replace(' ', '-')}`}>{item.type}</div>
						<div class='cell left'>{item.asset}</div>
						<div class='cell left'>{item.market || '-'}</div>
						<div class='cell'>{numberWithCommas(item.amount)} {item.asset}</div>
						<div class='cell'>{numberWithCommas(item.poolBalance)} {item.asset}</div>
						<div class='cell'>{item.bufferBalance == undefined ? '-' : `${numberWithCommas(item.bufferBalance)} ${item.asset}`}</div>
						<div class='cell left'><span>{shortAddress(item.user)}<span class='grayed'>{item.timestamp ? formatDate(item.timestamp) : `Block ${item.blockNumber}`}</span></span></div>
						<div class='cell'>{#if item.explorerUrl}<a href={item.explorerUrl} target='_blank' rel='noreferrer'>{item.transactionHash.slice(0, 6)}…</a>{:else}-{/if}</div>
					</div>
				{/each}
			</div>
		</div>

		<div class='footer'>
			{#if isLoading}
				<span class='loading'>{@html LOADING_ICON}</span>
			{:else if hasMore}
				<Button isSmall={true} label='Load more' on:click={() => loadTransactions(false)} />
			{:else}
				<span class='muted'>All available transactions loaded.</span>
			{/if}
		</div>
	{/if}

	<div class='sentinel' bind:this={sentinel}></div>
</div>
