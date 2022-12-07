<script>

	import { onMount, onDestroy } from 'svelte'
	import Search from './Search.svelte'
	import ColoredPrice from '@components/layout/ColoredPrice.svelte'

	import Table from '@components/layout/table/Table.svelte'
	import Row from '@components/layout/table/Row.svelte'
	import Cell from '@components/layout/table/Cell.svelte'
	
	import { DEFAULT_MARKETS_SORT_KEY } from '@lib/config'

	import { formatPnl, formatMarketName } from '@lib/formatters'
	import tooltip from '@lib/tooltip'
	import { LOADING_ICON, MOON_CIRCLE, STAR_ICON, FLAME_ICON } from '@lib/icons'
	import { getMarketInfo } from '@api/markets'
	import { marketInfos, marketSearchQuery, marketsSortKey, marketsSorted, selectedMarket, marketsFilter, starredMarkets } from '@lib/stores'
	import { getMarketPrices } from '@api/prices'
	import { saveUserSetting } from '@lib/utils'

	let isLoading = true;

	let t;
	async function fetchData() {
		clearTimeout(t);
		await getMarketInfo('all');
		isLoading = false;
		t = setTimeout(fetchData, 2 * 60 * 1000);
	}
	$: fetchData();

	onMount(() => {
		getMarketPrices('all');
	});

	let columns = [
		{key: 'market', gridTemplate: '115px', sortable: true},
		{key: 'price', gridTemplate: '1fr', sortable: true, rightAlign: true},
		{key: 'change', gridTemplate: '1fr', sortable: true, rightAlign: true},
	];

	function filterMarkets(fl) {
		marketSearchQuery.set();
		marketsFilter.set(fl);
	}

	function starMarket(m) {
		if ($starredMarkets[m]) {
			// Unstar
			starredMarkets.update((sm) => {
				delete sm[m];
				return sm;
			});
		} else {
			// star
			starredMarkets.update((sm) => {
				sm[m] = true;
				return sm;
			});
		}
		saveUserSetting('starredMarkets', $starredMarkets);
	}

	onDestroy(() => {
		clearTimeout(t);
	});

</script>

<style>

	.markets-wrapper {
		height: 100%;
		font-size: 85%;
	}
	.search-bar {
		padding: 20px;
		padding-bottom: 5px;
	}

	.market-row {
		padding: 0 25px;
		display: grid;
		align-items: center;
		height: 32px;
		color: var(--text0);
		text-decoration: none;
		grid-template-columns: var(--grid-template);
	}
	.market-row:hover {
		background-color: var(--layer100);
	}
	.market-row.selected {
		background-color: var(--layer100);
	}

	.grayed, .market-row :global(.grayed) {
		opacity: 0.5;
	}

	.star-icon {
		display: flex;
		align-items: center;
		cursor: pointer;
	}
	.star-icon :global(svg) {
		fill: var(--text500);
		width: 14px;
	}
	.star-icon.active :global(svg) {
		fill: gold;
	}
	.star-icon.mr {
		margin-right: 6px;
	}

	.moon-icon {
		display: flex;
		align-items: center;
		margin-left: 6px;
	}
	.moon-icon :global(svg) {
		fill: var(--layer100);
		width: 14px;
	}

	.nav {
		display: flex;
		align-items: center;
		padding: 10px 25px;
	}
	.nav a {
		cursor: pointer;
		margin-right: 10px;
		color: var(--text300);
	}
	.nav a:not(.active):hover {
		color: var(--text100);
	}
	.nav a.active {
		color: var(--primary);
	}

	.table-wrapper {
		height: calc(100% - 100px);
		overflow-y: hidden;
		position: relative;
	}

	.wrapper {
	}

	.leverage {
		margin-left: 6px;
		background-color: var(--layer100);
		padding: 3px 4px;
		border-radius: 3px;
		font-size: 80%;
	}

</style>

<div class='markets-wrapper'>
	<div class='search-bar'><Search /></div>
	<div class='nav'>
		<a on:click={() => filterMarkets('starred')} class:active={$marketsFilter == 'starred'} class='star-icon'>{@html STAR_ICON}</a>
		<a on:click={() => filterMarkets('open')} class:active={$marketsFilter == 'open'}>Open</a>
		<a on:click={() => filterMarkets('all')} class:active={$marketsFilter == 'all'}>All</a>
		<a on:click={() => filterMarkets('crypto')} class:active={$marketsFilter == 'crypto'}>Crypto</a>
		<a on:click={() => filterMarkets('fx')} class:active={$marketsFilter == 'fx'}>FX</a>
		<a on:click={() => filterMarkets('indices')} class:active={$marketsFilter == 'indices'}>Index</a>
		<a on:click={() => filterMarkets('commodities')} class:active={$marketsFilter == 'commodities'}>Comm</a>
	</div>
	<div class='table-wrapper'>
		<Table
			defaultSortKey={DEFAULT_MARKETS_SORT_KEY}
			bind:sortKey={$marketsSortKey}
			columns={columns}
			isLoading={isLoading}
			isEmpty={$marketsSorted.length == 0}
		>
			
			{#each $marketsSorted as market}

				<a class='market-row' href={`/trade/${market.market}`} class:selected={market.market == $selectedMarket} class:grayed={$marketInfos[market.market]?.isClosed}>
					<Cell>
						<div class='star-icon mr' class:active={$starredMarkets[market.market]} on:click|stopPropagation|preventDefault={() => {starMarket(market.market)}}>{@html STAR_ICON}</div>
						{@html formatMarketName(market.market, true)}
						{#if $marketInfos[market.market]?.isClosed}
						<div class='moon-icon' use:tooltip={{content: 'Market Closed'}}>{@html MOON_CIRCLE}</div>
						{:else}
						<span class='leverage'>{$marketInfos[market.market]?.maxLeverage}×</span>
						{/if}
					</Cell>
					<Cell rightAlign={true}><ColoredPrice price={market.price} /></Cell>
					<Cell rightAlign={true}>
						<span class:green={market.change*1 >= 0} class:red={market.change*1 < 0}>{@html formatPnl(market.change, true)}</span>
					</Cell>
				</a>

			{/each}

		</Table>
	</div>

</div>