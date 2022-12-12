<script>
	import { onDestroy } from 'svelte'
	import Button from '@components/layout/Button.svelte'

	import { getTotalSupplyCAP, getUserCAPStake } from '@api/cap'
	import { getCAPPrice } from '@api/prices'
	import { formatForDisplay, numberWithCommas } from '@lib/formatters'
	import { address, totalSupplyCAP, CAPPrice, CAPStake } from '@lib/stores'
	import { showModal } from '@lib/ui'

	let t;
	async function fetchData() {
		clearTimeout(t);
		getTotalSupplyCAP();
		getCAPPrice();
		getUserCAPStake();
		t = setTimeout(fetchData, 60 * 1000);
	}
	$: fetchData($address);

	onDestroy(() => {
		clearTimeout(t);
	});

</script>

<style>

	.table {
		--grid-template: repeat(6, 1fr);
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
	.subtitle a {
		color: var(--primary);
		text-decoration: none;
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

<div class='stake-cap'>

	<div class='header'>
		<div class='left'>
			<div class='title'>Stake CAP</div>
			<div class='subtitle'>Stake CAP to receive a portion of protocol revenue. <a href='https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x031d35296154279dc1984dcd93e392b1f946737b' target="_blank">Buy CAP</a></div>
		</div>
		<div class='right buttons'>
			<Button isSmall={true} label={`Stake`} on:click={() => {showModal('StakeCAP')}} />
			<Button isSmall={true} label={`Unstake`} on:click={() => {showModal('UnstakeCAP')}} />	
		</div>
	</div>

	<div class='table'>
		<div class='table-header'>
			<div class='cell la'>Asset</div>
			<div class='cell'>Price</div>
			<div class='cell'>Total Supply</div>
			<div class='cell'>Total Staked</div>
			<div class='cell highlighted'>Your Stake</div>
			<div class='cell highlighted'>% of Stake</div>
		</div>
		<div class='table-body'>
			<div class='row'>
				<div class='cell la'><img src="{`/asset-logos/CAP.svg`}" alt="CAP" /> CAP</div>
				<div class='cell'>${formatForDisplay($CAPPrice)}</div>
				<div class='cell'>100,000</div>
				<div class='cell'>{numberWithCommas($totalSupplyCAP)}</div>
				<div class='cell highlighted'>{numberWithCommas($CAPStake)}</div>
				<div class='cell highlighted'>{$totalSupplyCAP == 0 ? 'N/A' : formatForDisplay(($CAPStake/$totalSupplyCAP *100))+'%'}</div>
			</div>
		</div>
	</div>
</div>