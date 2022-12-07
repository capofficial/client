
<script>

	import { onMount } from 'svelte'

	import { getLabelForKey } from '@lib/formatters'
	import { CHEVRON_UP_DOWN, CHEVRON_UP, CHEVRON_DOWN, XMARK_ICON, LIST_ICON, LOADING_ICON, ELLIPSIS_ICON, ELLIPSIS_CIRCLE_ICON } from '@lib/icons'
	import { lastHistoryItemsCount } from '@lib/stores'
	import { showModal } from '@lib/ui'

	import { getUserHistory } from '@api/history'

	export let columns;
	export let sortKey;
	export let defaultSortKey;
	export let isLoading;
	export let isEmpty;
	export let infiniteScroll = false;
	export let itemsPerPage = 0;

	function setSortKey(key) {
		if (!sortKey || !sortKey[0] || sortKey[0] != key) {
			// if column is not sorted, sort desc
			sortKey = [key, true];
		} else if (sortKey[0] == key) {
			if (sortKey[1]) {
				// if column is sorted desc, sort asc
				sortKey = [key, false];
			} else {
				// if column is sorted asc, clear sortKey
				if (defaultSortKey[1] == sortKey[1]) {
					sortKey = [key, !sortKey[1]];
				} else {
					sortKey = defaultSortKey;
				}
			}
		}
		if (infiniteScroll) {
			getUserHistory({});
		}
	}

	// get full grid template
	let gridTemplate;
	function setGridTemplate(_columns) {
		gridTemplate = '';
		for (const col of _columns) {
			gridTemplate += ` ${col.gridTemplate}`;
		}
	}

	$: setGridTemplate(columns);


	onMount(() => {
		// monitor scoll for infinite scroll
		if (infiniteScroll) {
			let loadingMore;
			let lastFetchedItems = [];
			let skip = itemsPerPage;
			const container = document.getElementById('infinite-scroll-container');
			container.onscroll = async () => {
				if (container.scrollTop > container.scrollHeight - 350) {
					if (loadingMore || $lastHistoryItemsCount < itemsPerPage) return;
					loadingMore = true;
					await getUserHistory({first: itemsPerPage, skip});
					loadingMore = false;
					skip += itemsPerPage;
				}
			}
		}
	});

</script>

<style>

	.table {
		height: 100%;
	}

	.columns {
		display: grid;
		align-items: center;
		height: 38px;
		padding: 0 25px;
		font-size: 85%;
		border-bottom: 1px solid var(--layer100);
		grid-template-columns: var(--grid-template);
	}

	.columns > div {
		height: 100%;
		display: flex;
		align-items: center;
		text-transform: capitalize;
		color: var(--text1);
	}

	.sortable {
		display: flex;
		align-items: center;
		cursor: pointer;
		user-select: none;
	}
	.sortable:hover:not(.sorted) {
		color: var(--text1-hover);
	}
	.sortable :global(svg) {
		fill: var(--text2);
		width: 8px;
		margin-left: 8px;
	}
	.sortable:hover:not(.sorted) :global(svg) {
		fill: var(--text1);
	}
	.sortable.sorted :global(svg) {
		fill: var(--text1);
	}

	.data-wrapper {
		height: calc(100% - 39px);
		overflow-y: scroll;
		scrollbar-color: var(--layer200);
		scrollbar-width: thin;
	}
	.data-wrapper::-webkit-scrollbar-track {
		background-color: transparent;
		border-radius: 6px;
	}
	.data-wrapper::-webkit-scrollbar {
		width: 5px;
		background-color: transparent;
	}
	.data-wrapper::-webkit-scrollbar-thumb {
		border-radius: 6px;
		background-color: var(--layer200);
	}

	.empty {
		padding: var(--base-padding);
		text-align: center;
		color: var(--text2);
		font-size: 85%;
	}

	.loading {
		padding: var(--base-padding);
		text-align: center;
		color: var(--text2);
	}
	.loading :global(svg) {
		width: 20px;
	}

	.clickable {
		cursor: pointer;
	}

</style>

<div class='table' style={`--grid-template: ${gridTemplate};`}>
	
	<div class='columns' id='columns'>
		{#each columns as column}
			{#if column.sortable}
				<div class='sortable' class:sorted={sortKey[0] == column.key} on:click|stopPropagation={() => {setSortKey(column.key)}} style={column.rightAlign ? 'justify-content: flex-end' : ''}>
					<span>{getLabelForKey(column.key)}</span>
					{#if sortKey[0] == column.key}
						{#if sortKey[1]}
							{@html CHEVRON_DOWN}
						{:else}
							{@html CHEVRON_UP}
						{/if}
					{:else}
						{@html CHEVRON_UP_DOWN}
					{/if}
				</div>
			{:else if column.key == 'tools'}
				<div></div>
			{:else}
				<div>{getLabelForKey(column.key)}</div>
			{/if}
		{/each}
	</div>

	<div id='infinite-scroll-container' class='data-wrapper'>

		{#if isLoading}
			<div class='loading'>{@html LOADING_ICON}</div>
		{:else if isEmpty}
			<div class='empty'>Nothing to show.</div>
		{:else}
			<slot></slot>
		{/if}

	</div>

</div>