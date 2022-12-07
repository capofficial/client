
<script>

	import Table from '@components/layout/table/Table.svelte'
	import Row from '@components/layout/table/Row.svelte'
	import Cell from '@components/layout/table/Cell.svelte'
	import ColoredPrice from '@components/layout/ColoredPrice.svelte'

	import tooltip from '@lib/tooltip'


	import { onDestroy } from 'svelte'
	import { XMARK_ICON, PENCIL_ICON } from '@lib/icons'

	import { DEFAULT_POSITIONS_SORT_KEY, BPS_DIVIDER } from '@lib/config'
	import { 
		formatPosition, 
		formatPnl, 
		formatForDisplay, 
		formatSide, 
		formatDate,
		formatMarketName
	} from '@lib/formatters'
	import { address, positionsSortKey, positionsSorted, positionsColumnsToShow, prices, marketInfos, fundingTrackers } from '@lib/stores'
	import { showModal } from '@lib/ui'
	import { saveUserSetting, calculateLiquidationPrice, getUPL } from '@lib/utils'

	import { getUserPositions } from '@api/positions'
	import { getFundingTracker } from '@api/markets'

	export let allColumns;

	let isLoading = true, t1;
	async function fetchData() {
		clearTimeout(t1);
		const done = await getUserPositions();
		if (done) isLoading = false;
		t1 = setTimeout(fetchData, 5000);
	}
	$: fetchData($address);

	let columns = [];
	$: columns = allColumns.filter((item) => $positionsColumnsToShow.includes(item.key));

	let formattedPositions = [];
	$: formattedPositions = $positionsSorted.map((pos) => formatPosition(pos));

	let lastFundingTrackersFetch = 0;
	async function fetchFundingTrackers(_positions) {
		if (!_positions.length) return;
		if (lastFundingTrackersFetch > Date.now() - 5 * 60 * 1000) return;
		lastFundingTrackersFetch = Date.now();
		for (const position of _positions) {
			getFundingTracker(position.asset, position.market);
		}
	}
	$: fetchFundingTrackers(formattedPositions);

	$: saveUserSetting('positionsSortKey', $positionsSortKey);
	$: saveUserSetting('positionsColumnsToShow', $positionsColumnsToShow);

	onDestroy(() => {
		clearTimeout(t1);
	});

	let upls = {}; // asset:market => upl

	function calculateUpls(_positions, _prices) {
		for (const position of _positions) {
			if (!_prices[position.market]) continue;
			upls[`${position.asset}:${position.market}`] = getUPL(position, _prices[position.market]);
		}
	}

	$: calculateUpls(formattedPositions, $prices);

	let fundings = {}; // asset:market => funding

	function calculateFundings(_positions, _fundingTrackers) {
		for (const position of _positions) {
			const ft = _fundingTrackers[position.asset]?.[position.market];
			if (!ft) continue;
			// funding negative means it's been charged
			// for a long, is fundingTracker > position.fundingTracker, that means it was charged funding (ftDiff < 0)
			let ftDiff = ft * 1 - position.fundingTracker * 1;
			if (position.isLong) ftDiff = -1 * ftDiff;
			fundings[`${position.asset}:${position.market}`] = position.size * ftDiff / BPS_DIVIDER || 0;
		}
	}

	$: calculateFundings(formattedPositions, $fundingTrackers);

	let totalUpls = {};

	function calculateTotalUpls(_upls, _fundings) {
		for (const key in _upls) {
			totalUpls[key] = _upls[key] * 1 + _fundings[key] * 1;
		}
	}

	$: calculateTotalUpls(upls, fundings);

	let liqPrices = {};

	function calculateLiqPrices(_positions, _marketInfos, _fundings) {
		for (const position of _positions) {
			if (!_marketInfos[position.market]) continue;
			// Liquidation price is the price at which UPL = margin

			const funding = fundings[`${position.asset}:${position.market}`] || 0;

			// console.log('funding', funding);

			// funding negative means it was charged, so subtract absValue from margin in both long and short

			let liqPrice;
			if (position.isLong) {
				liqPrice = position.price * 1 - (position.margin*1 + funding*1) * position.price / position.size;
			} else {
				liqPrice = position.price * 1 + (position.margin*1 + funding*1) * position.price / position.size;
			}

			// console.log('liqPrice', liqPrice);

			liqPrices[`${position.asset}:${position.market}`] = liqPrice;

			// liqPrices[`${position.asset}:${position.market}`] = calculateLiquidationPrice({
			// 	liqThreshold: _marketInfos[position.market].liqThreshold,
			// 	price: position.price * 1,
			// 	leverage: position.leverage * 1,
			// 	isLong: position.isLong,
			// 	funding: fundings[`${position.asset}:${position.market}`]
			// });
		}
	}

	$: calculateLiqPrices(formattedPositions, $marketInfos, fundings);

	let showDetails = {};

</script>

<style>

	.item {
		border-bottom: 1px solid var(--layer0);
	}
	.item:last-child {
	}
	.item.active {
		background-color: var(--layer50);
	}

	.summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 85px;
		padding: 0 25px;
		cursor: pointer;
		border-bottom: 1px solid var(--layer50);
	}
	.item:not(.active) .summary:hover {
		background-color: var(--layer25);
	}
	.item:last-child .summary {
		border-bottom: none;
	}


	.description {
		display: flex;
		align-items: center;
	}

	.side-indicator {
		height: 46px;
		width: 8px;
		border-radius: 10px;
		background-color: var(--primary);
		margin-right: 12px;
	}
	.side-indicator.red {
		background-color: var(--secondary);
	}

	.title {
		font-weight: 600;
		margin-bottom: 6px;
	}
	.text {
		font-size: 85%;
	}
	.status {
		font-weight: 600;
	}

	.details-wrapper {
		max-height: 0;
		overflow: hidden;
		transition: max-height 150ms ease-out;
	}
	.details {
		border-top: 1px solid var(--layer100);
		padding: 25px;
		font-size: 90%;
	}
	.item.active .details-wrapper {
		max-height: 300px;
		transition: max-height 150ms ease-in;
	}

	.info {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		grid-gap: 25px;
	}

	.box {
	}

	.box .label {
		font-weight: 600;
		margin-bottom: 6px;
	}

	a {
		color: var(--primary);
		text-decoration: none;
	}
	.isShort a {
		color: var(--secondary);
	}
	.value a {
		font-weight: 400;
	}

	.tools {
		padding-top: 25px;
	}

	.tools a {
		margin-right: 20px;
	}

	.empty {
		padding: 25px;
		text-align: center;
		color: var(--text500);
		font-size: 90%;
	}

	.wrapper {
		max-height: calc(var(--account-height) - 50px - 39px);
	}
</style>

<Table
	defaultSortKey={DEFAULT_POSITIONS_SORT_KEY}
	bind:sortKey={$positionsSortKey}
	columns={columns}
	isLoading={isLoading}
	isEmpty={$positionsSorted.length == 0}
>
	
	<div class='wrapper'>
	{#each formattedPositions as position}

		<Row>

			{#if $positionsColumnsToShow.includes('timestamp')}
				<Cell>{formatDate(position.timestamp)}</Cell>
			{/if}

			{#if $positionsColumnsToShow.includes('isLong')}
				<Cell hasClass={position.isLong ? 'green' : 'red'}>{formatSide(position.isLong)}</Cell>
			{/if}

			{#if $positionsColumnsToShow.includes('market')}
				<Cell><a href={`/trade/${position.market}`}>{formatMarketName(position.market)}</a></Cell>
			{/if}

			{#if $positionsColumnsToShow.includes('price')}
				<Cell>{formatForDisplay(position.price)}</Cell>
			{/if}

			{#if $positionsColumnsToShow.includes('size')}
				<Cell>{formatForDisplay(position.size)} {position.asset}</Cell>
			{/if}

			{#if $positionsColumnsToShow.includes('margin')}
				<Cell>{formatForDisplay(position.margin)} {position.asset}</Cell>
			{/if}

			{#if $positionsColumnsToShow.includes('leverage')}
				<Cell>{formatForDisplay(position.leverage)}×</Cell>
			{/if}

			{#if $positionsColumnsToShow.includes('upl')}
				{#if !totalUpls[`${position.asset}:${position.market}`]}
					<Cell hasClass='green'>0.0 (0%)</Cell>
				{:else}
					<Cell hasClass={totalUpls[`${position.asset}:${position.market}`] * 1 >= 0 ? 'green' : 'red'}>{@html formatPnl(totalUpls[`${position.asset}:${position.market}`])} ({@html formatPnl(100*totalUpls[`${position.asset}:${position.market}`]/position.margin, true)})</Cell>
				{/if}
			{/if}

			{#if $positionsColumnsToShow.includes('funding')}
				<Cell>{formatForDisplay(fundings[`${position.asset}:${position.market}`])} {position.asset}</Cell>
			{/if}

			{#if $positionsColumnsToShow.includes('liqprice')}
				<Cell>{formatForDisplay(liqPrices[`${position.asset}:${position.market}`])}</Cell>
			{/if}

			<Cell isTools={true}>
				<a use:tooltip={{content: 'Edit'}} on:click|stopPropagation={() => { showModal('EditMargin', position) }}>{@html PENCIL_ICON}</a>
				<a use:tooltip={{content: 'Close'}} on:click|stopPropagation={() => { showModal('ClosePosition', position) }}>{@html XMARK_ICON}</a>
			</Cell>

		</Row>

	{/each}

	</div>	

</Table>

<!-- {#if !isLoading && formattedPositions.length == 0}
	<div class='empty'>Nothing to show.</div>
{:else}

	{#each formattedPositions as position}
	<div class='item' class:isLong={position.isLong} class:isShort={!position.isLong} class:active={showDetails[`${position.asset}:${position.market}`]}>
		<div class='summary' on:click={() => {showDetails[`${position.asset}:${position.market}`] = !showDetails[`${position.asset}:${position.market}`]}}>
			<div class='description'>
				<div class='side-indicator' class:red={!position.isLong}></div>
				<div class="content">
					<div class='title'>{position.market} {formatSide(position.isLong)}</div>
					<div class='text'>{formatForDisplay(position.size)} {position.asset} at {formatForDisplay(position.price)}</div>
				</div>
			</div>
			<div class='status' 
				class:green={upls[`${position.asset}:${position.market}`] * 1 >= 0} 
				class:red={upls[`${position.asset}:${position.market}`] * 1 < 0}
			>
				{#if !upls[`${position.asset}:${position.market}`]}
					-
				{:else}
					{@html formatPnl(upls[`${position.asset}:${position.market}`])} {position.asset} ({@html formatPnl(100*upls[`${position.asset}:${position.market}`]/position.margin, true)})
				{/if}
			</div>
		</div>
		<div class='details-wrapper'>
			<div class='details'>
				<div class='info'>
					<div class='box'>
						<div class='label'>Submitted</div>
						<div class='value'>{formatDate(position.timestamp)}</div>
					</div>
					<div class='box'>
						<div class='label'>Market</div>
						<div class='value'><a href={`/trade/${position.market}`}>{position.market}</a></div>
					</div>
					<div class='box'>
						<div class='label'>Market Price</div>
						<div class='value'><ColoredPrice price={$prices[position.market]} /></div>
					</div>
					<div class='box'>
						<div class='label'>Liquidation Price</div>
						<div class='value'>{formatForDisplay(liqPrices[`${position.asset}:${position.market}`])}</div>
					</div>
					<div class='box'>
						<div class='label'>Size</div>
						<div class='value'>{formatForDisplay(position.size)} {position.asset}</div>
					</div>
					<div class='box'>
						<div class='label'>Margin</div>
						<div class='value'>{formatForDisplay(position.margin)} {position.asset} (<a on:click|stopPropagation={() => { showModal('EditMargin', position) }}>edit</a>)</div>
					</div>
					<div class='box'>
						<div class='label'>Leverage</div>
						<div class='value'>{formatForDisplay(position.leverage)}×</div>
					</div>
					<div class='box'>
						<div class='label'>Funding</div>
						<div class='value'>{formatForDisplay(fundings[`${position.asset}:${position.market}`])} {position.asset}</div>
					</div>
					
				</div>
				<div class='tools'>
					<a on:click|stopPropagation={() => { showModal('ClosePosition', position) }}>Close Position</a>
				</div>
			</div>
		</div>
	</div>
	{/each}
{/if} -->