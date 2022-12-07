<script>
	import { SEARCH_ICON } from '@lib/icons'
	import { marketSearchQuery, marketsFilter } from '@lib/stores'

	function resetFilter() {
		if ($marketSearchQuery) {
			marketsFilter.set('all');
		}
		if ($marketSearchQuery === '') {
			marketSearchQuery.set(null);
		}
	}

	$: resetFilter($marketSearchQuery);

</script>

<style>

	.search {
		position: relative;
		width: 100%;
		box-sizing: border-box;
		background-color: var(--layer50);
		border-bottom: 1px solid transparent;
		transition: box-shadow 100ms ease-in-out;
		padding-right: 14px;
		border-radius: 6px;
	}

	input {
		height: 38px;
		width: 100%;
		font-size: inherit;
		box-sizing: border-box;
		background-color: transparent;
		padding-left: 45px;
		outline: none;
		border: none;
	}
	input::placeholder {
	  color: var(--text500);
	  opacity: 1;
	}
	input::-ms-input-placeholder{
	  color: var(--text500);
	}
	input:-ms-input-placeholder {
	  color: var(--text500);
	}

	.search-icon :global(svg) {
		width: 16px;
		fill: currentColor;
	}
	.search-icon {
		color: var(--text300);
		position: absolute;
		top: 50%;
		left: 14px;
		transform: translateY(-50%);
		pointer-events: none;
		display: flex;
		align-items: center;
	}
	.marketListShown .search-icon {
		color: var(--text0);
	}

</style>

<div class='search'>
	<div class='search-icon'>{@html SEARCH_ICON}</div>
	<input 
		type='search' 
		lang="en" 
		placeholder='Search markets' 
		bind:value={$marketSearchQuery} 
		autocomplete="off" 
		autocorrect="off" 
		spellcheck="false"
	/>
</div>
