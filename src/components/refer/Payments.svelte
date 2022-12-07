
<script>

	import Table from '@components/layout/table/Table.svelte'
	import Row from '@components/layout/table/Row.svelte'
	import Cell from '@components/layout/table/Cell.svelte'

	import { onMount, onDestroy } from 'svelte'
	import { LOADING_ICON } from '@lib/icons'
	import { getLabelForAsset } from '@lib/utils'
	import { address } from '@lib/stores'

	import { getTransactions } from '@api/transactions'
	import { formatForDisplay, formatDate } from '@lib/formatters'

	let isLoading = true;
	let items = [];
	async function fetchData() {
		if (!$address) return;
		items = await getTransactions('type=referrer-paid');
		isLoading = false;
	}
	$: fetchData($address);

</script>

<style>

	.transactions {
		margin-top: 48px;
	}

	.table {
		--grid-template: 140px 1fr 1fr 1fr;
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
		display: grid;
		grid-template-columns: 1fr 1fr;
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

</style>

<div class='transactions'>

	<div class='header'>
		<div class='left'>
			<div class='title'>Latest Payments</div>
		</div>
		<div class='right buttons'>
		</div>
	</div>

	<div class='table'>
		<div class='table-header'>
			<div class='cell la'>Asset</div>
			<div class='cell la'>Time</div>
			<div class='cell'>Amount</div>
			<div class='cell'>User</div>
		</div>
		<div class='table-body'>
			{#each items as item}
			<div class='row'>
				<div class='cell la'><img src={`/asset-logos/${getLabelForAsset(item.asset)}.svg`} /> {getLabelForAsset(item.asset)}</div>
				<div class='cell la'>{formatDate(item.timestamp)}</div>
				<div class='cell'>{formatForDisplay(item.referrerFee)}</div>
				<div class='cell'>{item.user}</div>
			</div>
			{/each}
		</div>
	</div>
</div>